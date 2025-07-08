# CustomSkin

Un éditeur de skin Minecraft moderne, rapide et personnalisable, développé avec React et Vite.

## ✨ Fonctionnalités
- **Aperçu 2D et 3D** du skin en temps réel
- Sélection et superposition d'assets (corps, cheveux, yeux, vêtements, accessoires...)
- Colorisation avancée de chaque partie
- Export du skin en PNG ou JSON
- Déploiement facile sur GitHub Pages

---

## 🚀 Installation

1. **Cloner le repo**
   ```bash
   git clone https://github.com/<ton-utilisateur>/<nom-du-repo>.git
   cd <nom-du-repo>
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   ```

---

## 🛠️ Développement local

```bash
npm run dev
```
Le site sera accessible sur [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Build (production)

```bash
npm run build
```
Les fichiers statiques seront générés dans le dossier `dist/`.

---

## 🌐 Déploiement sur GitHub Pages

1. **Configurer le chemin de base dans `vite.config.js`**
   ```js
   export default {
     base: '/<nom-du-repo>/',
   }
   ```
2. **Installer gh-pages** (si besoin)
   ```bash
   npm install --save-dev gh-pages
   ```
3. **Ajouter le script de déploiement dans `package.json`**
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
4. **Déployer**
   ```bash
   npm run deploy
   ```
5. **Activer GitHub Pages** dans les paramètres du repo (branche `gh-pages`)

---

## 📁 Structure du projet

```
src/
  components/      # Composants React (2D, 3D, éditeur...)
  assets/          # Images et assets graphiques
  store/           # State management (Zustand)
  ...
```

---

## 🙏 Remerciements
- [skinview3d](https://github.com/bs-community/skinview3d) pour le rendu 3D Minecraft

---

## 👤 Auteur

Développé par **Esurique**

---

