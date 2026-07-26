# TREZORA — Trésorerie Pro (application de bureau Electron)

Application de gestion de trésorerie pour **SMARTERS GROUP**, packagée en vraie application de bureau (Windows / macOS / Linux) avec [Electron](https://www.electronjs.org/).

Toutes les données restent **stockées localement** sur l'ordinateur (localStorage du navigateur intégré à l'application) — comme dans la version fichier unique, mais avec :
- une icône et un raccourci Windows/Bureau dignes d'une vraie application,
- une boîte de dialogue native « Enregistrer sous » pour les sauvegardes/PDF/CSV (au lieu d'un téléchargement silencieux),
- un menu natif (Fichier / Édition / Affichage / Aide),
- pas de dépendance à un navigateur ou une connexion internet pour fonctionner au quotidien.

## Structure du projet

```
.
├── app/
│   └── index.html        ← l'application (le fichier HTML corrigé)
├── build/
│   ├── icon.ico           ← icône Windows
│   ├── icon.icns           ← icône macOS
│   └── icon.png            ← icône Linux
├── main.js                ← processus principal Electron
├── package.json            ← config electron-builder
└── .github/workflows/build.yml  ← compilation automatique via GitHub Actions
```

## 1. Tester en local (optionnel, nécessite Node.js installé)

```bash
npm install
npm start
```

Cela ouvre l'application dans une fenêtre Electron, exactement comme le fichier HTML mais en application native.

## 2. Compiler l'exécutable Windows (.exe) — méthode recommandée : GitHub Actions

Cette méthode ne nécessite **aucune installation** sur votre machine (comme pour Smarters Trésorerie Pro) :

1. Créez un nouveau dépôt GitHub (ex. `trezora-tresorerie-pro`), vide.
2. Poussez tout le contenu de ce dossier à la racine du dépôt :
   ```bash
   git init
   git add .
   git commit -m "Initial commit — TREZORA Electron"
   git branch -M main
   git remote add origin https://github.com/<votre-compte>/trezora-tresorerie-pro.git
   git push -u origin main
   ```
3. Allez dans l'onglet **Actions** de votre dépôt GitHub. Le workflow **"Build TREZORA Desktop"** se lance automatiquement à chaque push sur `main` (vous pouvez aussi le relancer manuellement via le bouton *"Run workflow"*).
4. Une fois le workflow terminé (~5-10 minutes), ouvrez le run terminé → section **Artifacts** en bas de page :
   - `TREZORA-windows` → contient le `.exe` (installeur NSIS + version portable)
   - `TREZORA-mac` → contient le `.dmg` (si vous en avez besoin)
   - `TREZORA-linux` → contient l'`.AppImage`
5. Téléchargez l'artefact `TREZORA-windows`, dézippez-le : vous obtenez un installeur classique (double-clic → Suivant → Installer) et une version portable (`.exe` unique, sans installation, à mettre sur une clé USB par exemple).

## 3. Mettre à jour l'application plus tard

Quand vous corrigez ou faites évoluer `app/index.html` :
1. Remplacez le fichier `app/index.html` par la nouvelle version.
2. (Optionnel) Incrémentez `"version"` dans `package.json`.
3. `git add . && git commit -m "Mise à jour" && git push`
4. GitHub Actions recompile automatiquement — récupérez le nouvel exécutable dans **Actions → Artifacts**.

## 4. Notes importantes

- **Aucune donnée n'est envoyée en ligne.** GitHub Actions sert uniquement à compiler l'application ; vos données de trésorerie ne transitent jamais par GitHub.
- Les données de l'application (transactions, clients, factures…) sont stockées dans le profil Electron de l'utilisateur sur chaque poste — **une sauvegarde régulière via le bouton "💾 Backup" reste indispensable**, exactement comme avant.
- Si vous changez d'ordinateur, utilisez "📂 Restaurer" avec votre dernier fichier de sauvegarde `.json`.
- L'icône de l'application a été générée automatiquement à partir du logo intégré dans le HTML.
