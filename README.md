# AlgoQuest

> Learn algorithms through interactive adventure — Undertale meets coding education.

**[Play it live](https://aaroncx.github.io/algoquest/)**

A browser-based algorithm visualizer RPG built with React, Tailwind CSS, Vite, and Framer Motion. Fully static, client-side — deployed to GitHub Pages.

## Features

### RPG Adventure Mode (Act I)

Explore a pixel-art overworld with named locations, NPCs, and branching dialog. Complete algorithm challenges as battles to progress through the story.

**Locations:**
- Sorting Yard — Bubble Sort & Selection Sort challenges
- Stack Gate — Stack push/pop operations
- Queue Chapel — Queue data structure
- Heap Meadow — Heap operations
- Bazaar — Linear Search (help Byte find lost data)
- Loop Lake — Floyd's Cycle Detection
- GCD Shrine — Euclid's GCD algorithm
- Pact Aid Station — Rest and heal

**Characters & NPCs:**
- **Byte** — Lost data companion in the Bazaar
- **Sorting Sage** — Bubble Sort mentor
- **Library Sphinx** — Binary Search guide
- **Capt. Stack** — Guardian of the Stack Gate
- **Marshal Thread** — Selection Sort commander
- **Graph Oracle** — BFS mentor
- **Profiler V** — Euclid's GCD trial master
- **Prof. Invariant** — Algorithm theory guide
- **Old Wanderer** — Lore and hints
- **Nurse Null** — Aid station healer

### Algorithm Levels

| # | Level | Algorithm | Complexity |
|---|-------|-----------|------------|
| 1 | Bubble Sort | Sorting — swap adjacent elements | O(n²) |
| 2 | Binary Search | Searching — divide & conquer | O(log n) |
| 3 | BFS Rescue | Graph traversal — breadth-first search | O(V+E) |
| 4 | Quick Sort | Sorting — pivot partitioning | O(n log n) |
| 5 | Selection Sort | Sorting — find minimum, place, repeat | O(n²) |
| 6 | Stack Push/Pop | Data structure — LIFO operations | O(1) |
| 7 | Linear Search | Searching — sequential scan | O(n) |
| 8 | Floyd's Cycle Detection | Linked list — tortoise and hare | O(n) |
| 9 | Euclid's GCD | Math — greatest common divisor | O(log min(a,b)) |

Each level includes quiz questions, star ratings, and XP rewards.

### Game Systems

- Undertale-style typewriter dialog with branching choices
- 2D pixel art characters and tile-based overworld
- XP progression and leveling
- Star rating system (1-3 stars per level)
- Sequential level unlocking
- Encounter system — NPC dialog triggers algorithm battles
- Act I story arc with intro cutscene and ending
- Sound effects for battles, navigation, and dialog
- localStorage save/load persistence

## Setup

```bash
bun install
bun run dev       # localhost:5173
```

## Build & Deploy

```bash
bun run build     # production build -> dist/
bun run deploy    # push to gh-pages branch
```

## Tech Stack

- **Bun** (runtime & package manager)
- **React 19** + **Vite 7**
- **Tailwind CSS 3** (utility-first styling)
- **Framer Motion 12** (animations)
- **React Router 7** (HashRouter for GitHub Pages)
- **Google Fonts**: Press Start 2P + Inter
- **gh-pages** (deployment)

## Responsive Design

- Works from 375px (iPhone SE) to 4K
- Touch-friendly controls (44px+ tap targets)
- Fluid typography with `clamp()`

## License

MIT
