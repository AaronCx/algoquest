# Changelog

All notable changes to AlgoQuest are documented here.

## [Unreleased]

### Algorithm Levels
- **DFS Traversal** — Depth-first search graph visualization with stack view
- **Heap Sort** — Binary heap visualization with tree and array views
- **Binary Search Tree** — BST insertion and search visualization
- **Merge Sort** — Divide and merge step visualization
- **Quick Sort** — Pivot partitioning visualization
- **Dijkstra's Algorithm** — Shortest path graph visualization

### UX Features
- **Keyboard navigation** — Arrow keys to browse level grid, Enter to select
- **Step-by-step mode** — Pause after each algorithm step and advance manually
- **Progress tracker** — Visual overview of completed algorithms and star counts
- **Difficulty levels** — Adjustable animation speed (0.5x / 1x / 2x)
- **How to Play modal** — Onboarding guide with controls reference
- **Explanatory tooltips** — Hover descriptions on algorithm visualization elements
- **Complexity badges** — Big-O notation and descriptions shown on level cards

### Technical
- **Unit tests** — Vitest test suite covering bubble sort, binary search, merge sort, quick sort, and heap sort logic
- **CI pipeline** — GitHub Actions workflow running build, lint, and test on push/PR
- **Mobile responsiveness** — Improved layouts for screens below 375px
- **Full-screen settings** — Settings modal goes full-screen on very small devices

## [1.0.0] — Initial Release

### Core
- React 19 + Vite 7 + Tailwind CSS 3 + Framer Motion 12
- Bun runtime and package manager
- GitHub Pages deployment via gh-pages

### Algorithm Levels
- Bubble Sort — swap adjacent elements
- Binary Search — divide & conquer search
- Stack Push/Pop — LIFO operations
- Linear Search — sequential scan
- Selection Sort — find minimum, place, repeat
- Euclid's GCD — greatest common divisor
- Floyd's Cycle Detection — tortoise and hare
- BFS Maze — breadth-first search rescue

### RPG Adventure Mode (Act I)
- Pixel-art overworld with 8+ named locations
- 10 unique NPCs with branching dialog
- Encounter system — NPC dialog triggers algorithm battles
- Story stats: Correctness, Efficiency, Harmony
- Intro cutscene and ending sequence
- Sound effects for battles, navigation, and dialog

### Game Systems
- Undertale-style typewriter dialog
- XP progression and star rating system (1-3 stars)
- Sequential level unlocking and story-gated levels
- Multiple color themes
- localStorage save/load persistence
- Responsive design (375px to 4K)
