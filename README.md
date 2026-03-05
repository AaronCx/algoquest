# ⚔️ AlgoQuest

> Learn algorithms through interactive adventure — Undertale meets Claude UI.

A browser-based algorithm visualizer game built with React, Tailwind CSS, Vite, and Framer Motion. Fully static, client-side — deployable to GitHub Pages.

## 🎮 Levels

| # | Level | Algorithm | XP |
|---|-------|-----------|-----|
| 1 | Bubble Sort | Sorting — swap adjacent elements | 100 |
| 2 | Binary Search | Searching — divide & conquer | 150 |
| 3 | BFS Maze | Graph traversal — breadth-first search | 200 |

## 🚀 Setup

```bash
npm install
npm run dev       # localhost:5173
```

## 📦 Build & Deploy

```bash
npm run build     # production build → dist/
npm run deploy    # push to gh-pages branch
```

> Ensure `vite.config.js` `base` matches your repo name: `/algoquest/`

## 🎨 Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS 3** (utility-first)
- **Framer Motion 12** (animations)
- **React Router 7** (HashRouter for GH Pages)
- **Google Fonts**: Press Start 2P + Inter
- **gh-pages** (deployment)

## 📁 Project Structure

```
src/
├── components/
│   ├── DialogBox.jsx     # Undertale typewriter dialog
│   ├── LevelCard.jsx     # Level select cards
│   ├── PixelButton.jsx   # Pixel art styled buttons
│   ├── ProgressBar.jsx   # HP/XP bars
│   └── ScoreScreen.jsx   # Post-level score + stars
├── levels/
│   ├── bubble-sort/      # Level 1: swap/keep decisions
│   ├── binary-search/    # Level 2: left/right choices
│   └── bfs-maze/         # Level 3: frontier exploration
├── pages/
│   └── Home.jsx          # Title screen + level select
├── store/
│   ├── GameContext.jsx   # React context provider
│   └── gameStore.js      # localStorage save/load
└── index.css             # Global styles + pixel art CSS
```

## 📱 Responsive Design

- Works from **375px** (iPhone SE) to **4K**
- Touch-friendly controls (44px+ tap targets)
- Pointer Events API for mouse + touch
- `dvh` units for mobile browser chrome
- Fluid typography with `clamp()`

## 🎮 Controls

### Bubble Sort
- **SWAP / KEEP** buttons (touch or mouse)
- Keyboard: `S` = Swap, `K` = Keep

### Binary Search
- **LEFT HALF / RIGHT HALF** buttons
- Keyboard: `←` left, `→` right

### BFS Maze
- **Tap orange ◆ frontier cells** to explore them
- Navigate from `S` (start) to `G` (goal)
