// ── Shared Level Registry ─────────────────────────────────────────────────────
// Single source of truth for all algorithm levels.
// Used by Level Select (Home.jsx) and RPG encounters.
//
// Fields:
//   id            — unique level slug (used in routes, state, unlocks)
//   name          — display name
//   emoji         — icon for level card
//   type          — category label (Sorting, Searching, Graph, Math, etc.)
//   route         — React Router path
//   xpReward      — XP for level select card display
//   storyOnly     — if true, only unlockable via RPG story
//   lockedHint    — text shown on locked card
//   unlockedByDefault — always available (first level)
//   unlockAfter   — level id that must be completed first (sequential unlock)
//   encounterId   — RPG encounter that maps to this level (if any)

export const LEVEL_REGISTRY = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    emoji: '\uD83E\uDEE7',
    type: 'Sorting',
    route: '/level/bubble-sort',
    xpReward: 100,
    unlockedByDefault: true,
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    emoji: '\uD83D\uDD0D',
    type: 'Searching',
    route: '/level/binary-search',
    xpReward: 150,
    unlockAfter: 'bubble-sort',
  },
  {
    id: 'stack-push-pop',
    name: 'Stack Push/Pop',
    emoji: '\uD83D\uDCDA',
    type: 'Data Structure',
    route: '/level/stack-push-pop',
    xpReward: 80,
    storyOnly: true,
    lockedHint: 'Complete the Stack Gate trial in RPG.',
    encounterId: 'stack_discipline',
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    emoji: '\uD83D\uDC63',
    type: 'Searching',
    route: '/level/linear-search',
    xpReward: 80,
    storyOnly: true,
    lockedHint: "Help Byte find lost data in the RPG.",
    encounterId: 'linear_search',
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    emoji: '\uD83C\uDFAF',
    type: 'Sorting',
    route: '/level/selection-sort',
    xpReward: 100,
    storyOnly: true,
    lockedHint: 'Restore order in the Sorting Yard (RPG).',
    encounterId: 'selection_sort',
  },
  {
    id: 'euclid-gcd',
    name: "Euclid's GCD",
    emoji: '\u2797',
    type: 'Math',
    route: '/level/euclid-gcd',
    xpReward: 120,
    storyOnly: true,
    lockedHint: "Pass Profiler V's trial in the RPG.",
    encounterId: 'euclid_gcd',
  },
  {
    id: 'floyd-cycle',
    name: 'Floyd Cycle',
    emoji: '\uD83D\uDD04',
    type: 'Linked List',
    route: '/level/floyd-cycle',
    xpReward: 140,
    storyOnly: true,
    lockedHint: 'Face the Loop Lake trial in the RPG.',
    encounterId: 'floyd_cycle',
  },
  {
    id: 'bfs-maze',
    name: 'BFS Maze',
    emoji: '\uD83C\uDF10',
    type: 'Graph',
    route: '/level/bfs-maze',
    xpReward: 200,
    storyOnly: true,
    lockedHint: 'Complete the BFS Rescue in the RPG.',
    encounterId: 'bfs_rescue',
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    emoji: '\uD83C\uDFD4\uFE0F',
    type: 'Sorting',
    route: '/level/heap-sort',
    xpReward: 220,
    unlockAfter: 'bubble-sort',
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    emoji: '\uD83E\uDDE9',
    type: 'Sorting',
    route: '/level/merge-sort',
    xpReward: 200,
    unlockAfter: 'bubble-sort',
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    emoji: '\u26A1',
    type: 'Sorting',
    route: '/level/quick-sort',
    xpReward: 250,
    unlockAfter: 'bubble-sort',
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    emoji: '\uD83D\uDDFA\uFE0F',
    type: 'Graph',
    route: '/level/dijkstra',
    xpReward: 200,
    unlockAfter: 'bfs-maze',
  },
  {
    id: 'bst',
    name: 'Binary Search Tree',
    emoji: '\uD83C\uDF33',
    type: 'Data Structure',
    route: '/level/bst',
    xpReward: 180,
    unlockAfter: 'binary-search',
  },
]

// Map encounter ID → level IDs unlocked on completion
export const ENCOUNTER_LEVEL_UNLOCKS = {
  stack_discipline: ['stack-push-pop'],
  linear_search:    ['linear-search'],
  selection_sort:   ['selection-sort'],
  euclid_gcd:       ['euclid-gcd'],
  floyd_cycle:      ['floyd-cycle'],
  bfs_rescue:       ['bfs-maze'],
}

// Lookup helpers
export function getLevelById(id) {
  return LEVEL_REGISTRY.find(l => l.id === id) || null
}

export function getLevelByEncounter(encounterId) {
  return LEVEL_REGISTRY.find(l => l.encounterId === encounterId) || null
}
