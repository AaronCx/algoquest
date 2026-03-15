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
| 1 | Bubble Sort | Sorting — swap adjacent elements | O(n^2) |
| 2 | Binary Search | Searching — divide & conquer | O(log n) |
| 3 | Stack Push/Pop | Data structure — LIFO operations | O(1) |
| 4 | Linear Search | Searching — sequential scan | O(n) |
| 5 | Selection Sort | Sorting — find minimum, place, repeat | O(n^2) |
| 6 | Euclid's GCD | Math — greatest common divisor | O(log min(a,b)) |
| 7 | Floyd Cycle Detection | Linked list — tortoise and hare | O(n) |
| 8 | BFS Maze | Graph traversal — breadth-first search | O(V+E) |
| 9 | Heap Sort | Sorting — binary heap extraction | O(n log n) |
| 10 | Merge Sort | Sorting — divide, sort, merge | O(n log n) |
| 11 | Quick Sort | Sorting — pivot partitioning | O(n log n) |
| 12 | Dijkstra's Algorithm | Graph — shortest path | O(V^2) |
| 13 | Binary Search Tree | Data structure — insert & search | O(log n) |
| 14 | DFS Traversal | Graph traversal — depth-first search | O(V+E) |

Each level includes interactive challenges, star ratings (1-3), and XP rewards.

### UX Features

- **Difficulty levels** — Adjustable animation speed (0.5x / 1x / 2x)
- **Step-by-step mode** — Pause after each algorithm step and advance manually
- **Progress tracker** — Visual overview of completed algorithms and star counts
- **Keyboard navigation** — Arrow keys to browse levels, Enter to select, Esc to go back
- **How to Play modal** — Onboarding guide with controls reference
- **Explanatory tooltips** — Hover descriptions explaining what each algorithm step does
- **Complexity badges** — Big-O notation shown on level cards

### Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Navigate level grid / move in RPG |
| Enter / Space | Select level / advance dialog |
| Esc | Go back / deselect |
| S / K | Swap / Keep (Bubble Sort) |
| Left / Right | Choose half (Binary Search) |
| Space | Pause / Resume auto-complete |

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
- Multiple color themes

## Setup

```bash
bun install
bun run dev       # localhost:5174
```

## Build & Deploy

```bash
bun run build     # production build -> dist/
bun run deploy    # push to gh-pages branch
```

## Testing

```bash
bun test          # run unit tests via vitest
```

## CI

GitHub Actions runs build, lint, and test on every push and PR to `main`.

## Tech Stack

- **Bun** (runtime & package manager)
- **React 19** + **Vite 7**
- **Tailwind CSS 3** (utility-first styling)
- **Framer Motion 12** (animations)
- **React Router 7** (HashRouter for GitHub Pages)
- **Vitest** (unit testing)
- **Google Fonts**: Press Start 2P + Inter
- **gh-pages** (deployment)

## Responsive Design

- Works from sub-375px (tiny phones) to 4K
- Touch-friendly controls (44px+ tap targets)
- Fluid typography with `clamp()`
- Full-screen settings modal on very small screens

## License

MIT
