# Viking CustomSkin

Un éditeur de skins Minecraft moderne, développé en React + Vite, avec aperçu 2D/3D, colorisation avancée et gestion dynamique des assets (corps, cheveux, yeux, nez, bouche, vêtements, accessoires).

## Fonctionnalités principales
- **Aperçu 2D et 3D** du skin en temps réel (canvas 2D + skinview3d)
- **Customisation avancée** : couleurs, carrousels d'assets, color pickers
- **Gestion dynamique des assets** (import.meta.glob)
- **Colorisation avancée** (modes de fusion overlay/multiply, masquage alpha)
- **Téléchargement du skin** (PNG)
- **Interface moderne** (sidebar animée, UX soignée)

## Installation

```bash
# Clone le repo
git clone https://github.com/Esurique/Viking-CustomSkin.git
cd Viking-CustomSkin

# Installe les dépendances
npm install
```

## Développement local

```bash
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173) dans ton navigateur.

## Build production

```bash
npm run build
```

## Déploiement sur GitHub Pages

1. Mets à jour le champ `base` dans `vite.config.ts` :
   ```js
   base: '/Viking-CustomSkin/',
   ```
2. Installe gh-pages si besoin :
   ```bash
   npm install --save-dev gh-pages
   ```
3. Déploie :
   ```bash
   npm run deploy
   ```
4. Active GitHub Pages sur la branche `gh-pages` dans les settings du repo.

## Structure du projet

- `src/` : code source React/TypeScript
- `src/assets/` : images et assets du skin
- `public/` : fichiers statiques éventuels
- `dist/` : build de production (ignoré par git)

## Stack technique
- React 19 + Vite
- TypeScript
- Zustand (state)
- skinview3d (aperçu 3D)
- TailwindCSS

## Auteur
- [Esurique](https://github.com/Esurique)

---

> Projet open-source, contributions bienvenues !
