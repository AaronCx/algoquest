const KEY = 'algoquest_v1'

export const LEVELS = [
  { id: 'bubble-sort',    name: 'Bubble Sort',    route: '/level/bubble-sort',    emoji: '🫧', type: 'Sorting',   xpReward: 100 },
  { id: 'binary-search',  name: 'Binary Search',  route: '/level/binary-search',  emoji: '🔍', type: 'Searching', xpReward: 150 },
  { id: 'bfs-maze',       name: 'BFS Maze',       route: '/level/bfs-maze',       emoji: '🌐', type: 'Graph',     xpReward: 200 },
]

const DEFAULT = {
  xp: 0,
  completedLevels: [],
  levelStars: {},
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* noop */ }
}

export function isUnlocked(levelId, completedLevels) {
  const idx = LEVELS.findIndex(l => l.id === levelId)
  if (idx === 0) return true
  return completedLevels.includes(LEVELS[idx - 1].id)
}
