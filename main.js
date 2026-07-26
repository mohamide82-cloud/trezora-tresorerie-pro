const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const isMac = process.platform === 'darwin';

function getIconPath() {
  if (process.platform === 'win32') return path.join(__dirname, 'build', 'icon.ico');
  if (process.platform === 'darwin') return path.join(__dirname, 'build', 'icon.icns');
  return path.join(__dirname, 'build', 'icon.png');
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'TREZORA — Trésorerie Pro',
    icon: getIconPath(),
    backgroundColor: '#f0f4f8',
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  // Ouvrir les liens externes (ex: liens FNE/DGI dans Paramètres) dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Gère les exports (Backup JSON, PDF, CSV) : propose une boîte de dialogue
// "Enregistrer sous" native au lieu de télécharger silencieusement.
function setupDownloadHandler(session) {
  session.on('will-download', (event, item) => {
    const suggested = item.getFilename();
    const defaultPath = path.join(app.getPath('documents'), suggested);
    const chosen = dialog.showSaveDialogSync(mainWindow, {
      title: 'Enregistrer le fichier',
      defaultPath,
      buttonLabel: 'Enregistrer'
    });
    if (chosen) {
      item.setSavePath(chosen);
    } else {
      event.preventDefault();
      item.cancel();
    }
  });
}

function buildMenu() {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Recharger l\'application',
          accelerator: 'CmdOrCtrl+R',
          click: () => { if (mainWindow) mainWindow.reload(); }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', label: 'Quitter' }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Tout sélectionner' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { role: 'resetZoom', label: 'Zoom par défaut' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' },
        { type: 'separator' },
        { role: 'toggleDevTools', label: 'Outils de développement' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos de TREZORA',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos',
              message: 'TREZORA — Trésorerie Pro',
              detail: `Version ${app.getVersion()}\nApplication de gestion de trésorerie pour SMARTERS GROUP.\nToutes les données sont stockées localement sur cet ordinateur.`
            });
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  setupDownloadHandler(mainWindow.webContents.session);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

// Empêche la navigation accidentelle hors de l'application (sécurité de base)
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navUrl) => {
    const startUrl = 'file://' + path.join(__dirname, 'app', 'index.html');
    if (navUrl !== startUrl) event.preventDefault();
  });
});
