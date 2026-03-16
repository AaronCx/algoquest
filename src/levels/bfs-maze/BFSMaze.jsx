import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'bfs-maze'

const DIALOG_LINES = [
  '* Welcome, pathfinder! I am the Graph Oracle.',
  '* Breadth-First Search (BFS) explores a maze level by level.',
  '* It finds the SHORTEST path by exploring all neighbors before going deeper.',
  '* The FRONTIER shows cells you can visit next (neighbors of visited cells).',
  '* Click any orange frontier cell to visit it. Reach the GOAL to win!',
]

// 6×6 maze: 0=open, 1=wall
// Start: [0][0] (top-left), Goal: [5][5] (bottom-right)
const MAZE = [
  [0, 0, 1, 0, 0, 0],  // row 0
  [0, 1, 0, 1, 0, 0],  // row 1
  [0, 0, 0, 0, 1, 0],  // row 2
  [1, 0, 1, 0, 0, 0],  // row 3
  [0, 0, 0, 1, 0, 0],  // row 4
  [0, 1, 0, 0, 0, 0],  // row 5
]
const ROWS = MAZE.length
const COLS = MAZE[0].length
const START = [0, 0]
const GOAL  = [5, 5]

// BFS optimal path length from START to GOAL
// Precomputed: 13 moves
const OPTIMAL_STEPS = 13

const DIRS = [[-1,0],[1,0],[0,-1],[0,1]]

function cellKey(r, c) { return `${r},${c}` }

function getNeighbors(r, c, visited) {
  return DIRS
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) =>
      nr >= 0 && nr < ROWS &&
      nc >= 0 && nc < COLS &&
      MAZE[nr][nc] === 0 &&
      !visited.has(cellKey(nr, nc))
    )
}

function calcStars(steps) {
  if (steps <= OPTIMAL_STEPS + 2) return 3
  if (steps <= OPTIMAL_STEPS + 6) return 2
  return 1
}

export default function BFSMaze() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')
  const [visited, setVisited] = useState(new Set([cellKey(...START)]))
  const [frontier, setFrontier] = useState(new Set())
  const [current, setCurrent] = useState(START)
  const [path, setPath] = useState([cellKey(...START)])
  const [steps, setSteps] = useState(0)
  const [score, setScore] = useState(null)
  const [wrongFlash, setWrongFlash] = useState(null)
  const [winAnim, setWinAnim] = useState(false)

  function initFrontier() {
    const f = new Set()
    getNeighbors(...START, new Set([cellKey(...START)])).forEach(([r, c]) => f.add(cellKey(r, c)))
    return f
  }

  function startChallenge() {
    const initialVisited = new Set([cellKey(...START)])
    setVisited(initialVisited)
    setFrontier(initFrontier())
    setCurrent(START)
    setPath([cellKey(...START)])
    setSteps(0)
    setPhase('explore')
  }

  // ── Handle frontier cell click ─────────────────────────────────────
  const handleCellClick = useCallback((row, col) => {
    if (phase !== 'explore') return
    const key = cellKey(row, col)

    if (!frontier.has(key)) {
      // Not a valid frontier cell — flash error
      setWrongFlash(key)
      setTimeout(() => setWrongFlash(null), 400)
      return
    }

    const newVisited = new Set(visited)
    newVisited.add(key)

    // New frontier = all unvisited neighbors of newly visited cell + existing frontier minus visited
    const newFrontier = new Set(frontier)
    newFrontier.delete(key)
    getNeighbors(row, col, newVisited).forEach(([r, c]) => {
      newFrontier.add(cellKey(r, c))
    })

    const newPath = [...path, key]
    const newSteps = steps + 1

    setVisited(newVisited)
    setFrontier(newFrontier)
    setCurrent([row, col])
    setPath(newPath)
    setSteps(newSteps)

    // Check win
    if (row === GOAL[0] && col === GOAL[1]) {
      setWinAnim(true)
      const s = calcStars(newSteps)
      const xp = 80 + s * 20
      setScore({ stars: s, xp, steps: newSteps })
      completeLevel(LEVEL_ID, s, xp)
      setTimeout(() => setPhase('score'), 1500)
    }
  }, [phase, frontier, visited, path, steps, completeLevel])

  function reset() {
    setVisited(new Set([cellKey(...START)]))
    setFrontier(new Set())
    setCurrent(START)
    setPath([cellKey(...START)])
    setSteps(0)
    setScore(null)
    setWrongFlash(null)
    setWinAnim(false)
    setPhase('intro')
  }

  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="BFS Maze"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Cells visited',  value: score.steps },
          { label: 'Optimal path',   value: OPTIMAL_STEPS },
          { label: 'Grid size',      value: `${ROWS}×${COLS}` },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : backDest)}
        onHome={() => navigate(backDest)}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : 'ALL DONE! \u2192'}
        hasNext={true}
      />
    )
  }

  // ── Cell rendering helper ──────────────────────────────────────────
  function getCellStyle(r, c) {
    const key = cellKey(r, c)
    const isWall      = MAZE[r][c] === 1
    const isStart     = r === START[0] && c === START[1]
    const isGoal      = r === GOAL[0] && c === GOAL[1]
    const isVisited   = visited.has(key)
    const isFrontier  = frontier.has(key)
    const isCurrent   = current[0] === r && current[1] === c
    const isWrong     = wrongFlash === key

    let bg = '#0f0f1a'        // default open
    let border = '#1a1a2a'
    let textColor = 'transparent'
    let label = ''
    let glow = 'none'

    if (isWall)          { bg = '#0a0a12'; border = '#0a0a12' }
    else if (isStart)    { bg = '#1e1e3a'; border = '#4a4a7a' }
    else if (isGoal)     {
      bg = winAnim ? '#22c55e' : '#1a2e1a'
      border = '#22c55e'
      glow = winAnim ? '0 0 20px rgba(34,197,94,0.8)' : '0 0 10px rgba(34,197,94,0.4)'
      label = 'G'
      textColor = '#22c55e'
    }
    else if (isWrong)    { bg = '#3a1a1a'; border = '#e8645a'; glow = '0 0 10px rgba(232,100,90,0.6)' }
    else if (isCurrent)  { bg = '#2a1f0a'; border = '#f59e0b'; glow = '0 0 16px rgba(245,158,11,0.7)' }
    else if (isVisited)  { bg = '#1a2a1a'; border = '#2a3a2a' }
    else if (isFrontier) { bg = '#2a200a'; border = '#d97706'; glow = '0 0 8px rgba(217,119,6,0.5)' }

    return { bg, border, textColor, label, glow, isWall, isVisited, isFrontier, isCurrent, isGoal, isStart }
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a2a]">
        <button
          onClick={() => navigate(backDest)}
          className="pixel-btn pixel-btn-secondary"
          style={{ fontSize: '0.5rem', padding: '0.45rem 0.7rem', minHeight: '36px' }}
        >
          {state.returnToRPG ? '← ADVENTURE' : '← HOME'}
        </button>
        <div className="pixel-font text-center" style={{ fontSize: 'clamp(0.4rem, 2vw, 0.6rem)', color: '#d97706' }}>
          LV.3 — BFS MAZE
        </div>
        {steps > 0 && (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">
            {steps} MOVES
          </div>
        )}
        {steps === 0 && <div className="w-16" />}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        {phase === 'explore' && (
          <div className="flex gap-2 flex-wrap justify-center">
            {[
              { color: '#f59e0b', border: '#f59e0b', label: 'Current' },
              { color: '#2a200a', border: '#d97706', label: 'Frontier' },
              { color: '#1a2a1a', border: '#2a3a2a', label: 'Visited' },
              { color: '#1a2e1a', border: '#22c55e', label: 'Goal' },
              { color: '#0a0a12', border: '#0a0a12', label: 'Wall' },
            ].map(({ color, border, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-3 h-3 border" style={{ background: color, borderColor: border }} />
                <span className="text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {phase !== 'intro' && (
          <div className="flex flex-col items-center">
            <div
              className="grid gap-0.5 sm:gap-1"
              style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: '100%', maxWidth: '340px' }}
            >
              {Array.from({ length: ROWS }, (_, r) =>
                Array.from({ length: COLS }, (_, c) => {
                  const s = getCellStyle(r, c)
                  const key = cellKey(r, c)
                  const clickable = !s.isWall && frontier.has(key) && phase === 'explore'

                  return (
                    <motion.button
                      key={key}
                      onClick={() => !s.isWall && handleCellClick(r, c)}
                      animate={{
                        backgroundColor: s.bg,
                        borderColor: s.border,
                        boxShadow: s.glow,
                        scale: s.isCurrent ? [1, 1.05, 1] : 1,
                      }}
                      transition={{ duration: 0.18 }}
                      disabled={s.isWall || phase !== 'explore'}
                      className="flex items-center justify-center border transition-transform"
                      style={{
                        aspectRatio: '1',
                        cursor: clickable ? 'pointer' : s.isWall ? 'default' : 'not-allowed',
                        borderRadius: '2px',
                        minWidth: '28px',
                        minHeight: '28px',
                      }}
                      aria-label={s.isWall ? 'Wall' : s.isGoal ? 'Goal' : s.isStart ? 'Start' : `Cell ${r},${c}`}
                    >
                      {s.isStart && !s.isVisited ? (
                        <span style={{ fontSize: 'clamp(0.5rem, 2.5vw, 0.9rem)' }}>S</span>
                      ) : s.isGoal ? (
                        <span style={{ fontSize: 'clamp(0.5rem, 2.5vw, 0.9rem)', color: '#22c55e' }}>G</span>
                      ) : s.isCurrent ? (
                        <span style={{ fontSize: 'clamp(0.5rem, 2.5vw, 0.9rem)', color: '#fbbf24' }}>●</span>
                      ) : s.isFrontier ? (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          style={{ fontSize: 'clamp(0.4rem, 2vw, 0.7rem)', color: '#d97706' }}
                        >
                          ◆
                        </motion.span>
                      ) : s.isVisited ? (
                        <span style={{ fontSize: 'clamp(0.35rem, 1.5vw, 0.5rem)', color: '#2a4a2a' }}>·</span>
                      ) : null}
                    </motion.button>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* BFS Queue display */}
        {phase === 'explore' && frontier.size > 0 && (
          <div className="bg-[#0d0d1a] border border-[#2a2a3a] p-2">
            <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-1">
              FRONTIER QUEUE ({frontier.size} cells):
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from(frontier).map(k => (
                <span
                  key={k}
                  className="text-[#d97706] bg-[#1a1500] border border-[#3a2800] px-1.5 py-0.5 text-xs font-mono"
                >
                  ({k})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Win message */}
        {winAnim && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div
              className="pixel-font text-[#22c55e] text-glow-green"
              style={{ fontSize: 'clamp(0.6rem, 3vw, 0.9rem)' }}
            >
              ★ GOAL REACHED IN {steps} MOVES! ★
            </div>
          </motion.div>
        )}

        {/* Phase UIs */}
        <AnimatePresence mode="wait">

          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="GRAPH ORACLE"
                onDone={startChallenge}
              />
            </motion.div>
          )}

          {phase === 'explore' && !winAnim && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pixel-dialog pointer-events-none"
            >
              <p className="text-sm">
                <span className="text-[#d97706]">●</span> Click any{' '}
                <span className="text-[#d97706] font-bold">orange ◆ frontier</span> cell to explore it.
              </p>
              <p className="text-[#6b6b7a] text-xs mt-1">
                Navigate from <span className="text-white">S</span> to{' '}
                <span className="text-[#22c55e]">G</span> — find the shortest path!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
