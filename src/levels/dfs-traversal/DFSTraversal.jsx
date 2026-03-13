import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'dfs-traversal'

const DIALOG_LINES = [
  '* Welcome, explorer! I am the Depth Seeker.',
  '* Depth-First Search (DFS) explores as FAR as possible before backtracking.',
  '* It uses a STACK to remember where to go next.',
  '* Watch the stack grow as we go deeper, and shrink as we backtrack!',
  '* Predict the next node DFS will visit, or auto-step to observe.',
]

// ── Seeded RNG ──────────────────────────────────────────────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// ── Graph generation (unweighted) ───────────────────────────────────────────
function generateGraph(seed) {
  const rng = mulberry32(seed)
  const nodeCount = 7 + Math.floor(rng() * 2) // 7-8 nodes
  const labels = 'ABCDEFGH'.slice(0, nodeCount).split('')

  const cx = 250, cy = 200, radius = 140
  const nodes = labels.map((label, i) => {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2
    return {
      id: label,
      x: cx + radius * Math.cos(angle) + (rng() - 0.5) * 25,
      y: cy + radius * Math.sin(angle) + (rng() - 0.5) * 25,
    }
  })

  const edges = []
  const edgeSet = new Set()
  function addEdge(a, b) {
    const key = [a, b].sort().join('-')
    if (!edgeSet.has(key) && a !== b) {
      edgeSet.add(key)
      edges.push({ from: a, to: b })
    }
  }

  // Spanning tree
  const shuffled = [...labels]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  for (let i = 1; i < shuffled.length; i++) {
    addEdge(shuffled[i - 1], shuffled[i])
  }

  // Extra edges
  const extraCount = Math.floor(nodeCount * 0.7)
  for (let k = 0; k < extraCount; k++) {
    const a = labels[Math.floor(rng() * nodeCount)]
    const b = labels[Math.floor(rng() * nodeCount)]
    addEdge(a, b)
  }

  // Build adjacency list (sorted for deterministic DFS)
  const adj = {}
  labels.forEach(l => { adj[l] = [] })
  edges.forEach(e => {
    adj[e.from].push(e.to)
    adj[e.to].push(e.from)
  })
  labels.forEach(l => adj[l].sort())

  return { nodes, edges, adj }
}

// ── DFS (iterative with explicit stack) ─────────────────────────────────────
function runDFS(adj, startId, allNodes) {
  const visited = new Set()
  const stack = [startId]
  const steps = [] // { current, visited, stack, backtrack }

  while (stack.length > 0) {
    const current = stack.pop()
    if (visited.has(current)) continue

    visited.add(current)
    const neighbors = adj[current].filter(n => !visited.has(n))

    // Push neighbors in reverse order so first alphabetical is on top
    for (let i = neighbors.length - 1; i >= 0; i--) {
      stack.push(neighbors[i])
    }

    steps.push({
      current,
      visited: new Set(visited),
      stack: [...stack],
      neighbors: [...neighbors],
      backtrack: neighbors.length === 0,
    })
  }

  return steps
}

// ── BFS for comparison ──────────────────────────────────────────────────────
function runBFS(adj, startId) {
  const visited = new Set()
  const queue = [startId]
  const order = []
  visited.add(startId)

  while (queue.length > 0) {
    const current = queue.shift()
    order.push(current)
    adj[current].forEach(n => {
      if (!visited.has(n)) {
        visited.add(n)
        queue.push(n)
      }
    })
  }
  return order
}

// ── Scoring ─────────────────────────────────────────────────────────────────
function calcStars(correctPicks, totalPicks) {
  const ratio = correctPicks / Math.max(1, totalPicks)
  if (ratio >= 0.8) return 3
  if (ratio >= 0.55) return 2
  return 1
}

// ── Constants ───────────────────────────────────────────────────────────────
const SVG_W = 500, SVG_H = 400, NODE_R = 22

export default function DFSTraversal() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')
  // intro | running | complete | score
  const [graph, setGraph] = useState(null)
  const [startNode, setStartNode] = useState(null)
  const [dfsSteps, setDfsSteps] = useState([])
  const [stepIdx, setStepIdx] = useState(-1)
  const [autoPlay, setAutoPlay] = useState(false)
  const [correctPicks, setCorrectPicks] = useState(0)
  const [totalPicks, setTotalPicks] = useState(0)
  const [bfsOrder, setBfsOrder] = useState([])
  const [score, setScore] = useState(null)
  const [wrongFlash, setWrongFlash] = useState(null)
  const autoRef = useRef(null)

  const currentStep = stepIdx >= 0 && stepIdx < dfsSteps.length ? dfsSteps[stepIdx] : null
  const finalStep = dfsSteps.length > 0 ? dfsSteps[dfsSteps.length - 1] : null

  // ── Start ─────────────────────────────────────────────────────────────────
  function startChallenge() {
    const seed = Date.now()
    const g = generateGraph(seed)
    setGraph(g)
    // Pick start as first node alphabetically
    const start = g.nodes[0].id
    setStartNode(start)
    const steps = runDFS(g.adj, start, g.nodes)
    setDfsSteps(steps)
    const bfs = runBFS(g.adj, start)
    setBfsOrder(bfs)
    setStepIdx(-1)
    setAutoPlay(false)
    setCorrectPicks(0)
    setTotalPicks(0)
    setScore(null)
    setWrongFlash(null)
    setPhase('running')
  }

  // ── Step forward ──────────────────────────────────────────────────────────
  const advanceStep = useCallback(() => {
    setStepIdx(prev => {
      const next = prev + 1
      if (next >= dfsSteps.length) {
        setAutoPlay(false)
        setPhase('complete')
        return prev
      }
      return next
    })
  }, [dfsSteps.length])

  // ── Interactive: user picks next node ─────────────────────────────────────
  function handleNodeClick(nodeId) {
    if (phase !== 'running') return
    if (stepIdx + 1 >= dfsSteps.length) return

    const nextStep = dfsSteps[stepIdx + 1]
    setTotalPicks(p => p + 1)

    if (nextStep.current === nodeId) {
      setCorrectPicks(p => p + 1)
      advanceStep()
      setWrongFlash(null)
    } else {
      setWrongFlash(nodeId)
      setTimeout(() => setWrongFlash(null), 400)
    }
  }

  // ── Auto-play ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoPlay && phase === 'running') {
      autoRef.current = setInterval(() => {
        advanceStep()
      }, 1000)
    }
    return () => clearInterval(autoRef.current)
  }, [autoPlay, phase, advanceStep])

  // ── Finish ────────────────────────────────────────────────────────────────
  function finishLevel() {
    const stars = calcStars(correctPicks, totalPicks)
    const xp = 110 + stars * 25
    setScore({ stars, xp })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  function reset() {
    setPhase('intro')
    setGraph(null)
    setStartNode(null)
    setDfsSteps([])
    setStepIdx(-1)
    setAutoPlay(false)
    setCorrectPicks(0)
    setTotalPicks(0)
    setBfsOrder([])
    setScore(null)
    setWrongFlash(null)
  }

  // ── Node coloring ─────────────────────────────────────────────────────────
  function nodeColor(id) {
    if (!currentStep && phase === 'running') return '#4a4a6a'
    const step = phase === 'complete' ? finalStep : currentStep
    if (!step) return '#4a4a6a'

    if (wrongFlash === id) return '#e8645a'
    if (step.current === id && phase !== 'complete') return '#f59e0b'
    if (step.stack.includes(id) && !step.visited.has(id)) return '#fbbf24'
    if (step.visited.has(id)) return '#22c55e'
    return '#4a4a6a'
  }

  function nodeGlow(id) {
    if (!currentStep && phase === 'running') return 'none'
    const step = phase === 'complete' ? finalStep : currentStep
    if (!step) return 'none'
    if (step.current === id && phase !== 'complete') return 'drop-shadow(0 0 8px rgba(245,158,11,0.7))'
    if (wrongFlash === id) return 'drop-shadow(0 0 8px rgba(232,100,90,0.6))'
    return 'none'
  }

  function edgeHighlight(from, to) {
    if (!currentStep || phase === 'complete') return false
    // Highlight edge from previous visited to current
    const step = currentStep
    if (step.current === to || step.current === from) {
      // Check if the other end was visited in a previous step
      if (stepIdx > 0) {
        const prevStep = dfsSteps[stepIdx - 1]
        if (prevStep.visited.has(from) && step.current === to) return true
        if (prevStep.visited.has(to) && step.current === from) return true
      }
    }
    return false
  }

  // ── DFS traversal order so far ────────────────────────────────────────────
  const visitOrder = dfsSteps.slice(0, stepIdx + 1).map(s => s.current)

  // ── Score screen ──────────────────────────────────────────────────────────
  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="DFS Traversal"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct predictions', value: `${correctPicks}/${totalPicks}` },
          { label: 'Nodes traversed', value: dfsSteps.length },
          { label: 'Graph nodes', value: graph?.nodes.length || 0 },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : backDest)}
        onHome={() => navigate(backDest)}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : 'ALL DONE! \u2192'}
        hasNext={true}
      />
    )
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
          {state.returnToRPG ? '\u2190 ADVENTURE' : '\u2190 HOME'}
        </button>
        <div className="pixel-font text-center" style={{ fontSize: 'clamp(0.4rem, 2vw, 0.6rem)', color: '#d97706' }}>
          LV.12 — DFS TRAVERSAL
        </div>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        {(phase === 'running' || phase === 'complete') && (
          <div className="flex gap-2 flex-wrap justify-center">
            {[
              { color: '#f59e0b', label: 'Current' },
              { color: '#fbbf24', label: 'In Stack' },
              { color: '#22c55e', label: 'Visited' },
              { color: '#4a4a6a', label: 'Unvisited' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main content: graph + stack side by side */}
        {graph && phase !== 'intro' && (
          <div className="flex gap-3 items-start">
            {/* SVG Graph */}
            <div className="flex-1 min-w-0">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full"
                style={{ background: '#0d0d1a', borderRadius: '4px', border: '1px solid #1a1a2a' }}
              >
                {/* Edges */}
                {graph.edges.map((e, i) => {
                  const from = graph.nodes.find(n => n.id === e.from)
                  const to = graph.nodes.find(n => n.id === e.to)
                  const highlighted = edgeHighlight(e.from, e.to)
                  return (
                    <motion.line
                      key={`edge-${i}`}
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={highlighted ? '#f59e0b' : '#2a2a3a'}
                      strokeWidth={highlighted ? 2.5 : 1.5}
                      animate={{ stroke: highlighted ? '#f59e0b' : '#2a2a3a' }}
                      transition={{ duration: 0.2 }}
                    />
                  )
                })}

                {/* Nodes */}
                {graph.nodes.map(n => {
                  const nc = nodeColor(n.id)
                  const glow = nodeGlow(n.id)
                  const clickable = phase === 'running' && !autoPlay
                  return (
                    <g
                      key={n.id}
                      onClick={() => handleNodeClick(n.id)}
                      style={{ cursor: clickable ? 'pointer' : 'default' }}
                    >
                      <motion.circle
                        cx={n.x} cy={n.y} r={NODE_R}
                        fill="#0d0d1a"
                        stroke={nc}
                        strokeWidth={2.5}
                        animate={{ stroke: nc, filter: glow }}
                        transition={{ duration: 0.2 }}
                      />
                      <text
                        x={n.x} y={n.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={nc}
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {n.id}
                      </text>
                      {n.id === startNode && (
                        <text
                          x={n.x} y={n.y - NODE_R - 6}
                          textAnchor="middle"
                          fill="#f59e0b"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          START
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Stack visualization */}
            <div className="w-24 sm:w-28 shrink-0">
              <div className="bg-[#0d0d1a] border border-[#2a2a3a] p-2 rounded" style={{ minHeight: '200px' }}>
                <div className="pixel-font text-[0.4rem] text-[#6b6b7a] mb-2 text-center">
                  STACK
                </div>
                <div className="flex flex-col-reverse gap-1">
                  {currentStep && currentStep.stack.length > 0 ? (
                    currentStep.stack.map((id, i) => (
                      <motion.div
                        key={`stack-${i}-${id}`}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center border px-2 py-1 font-mono text-xs"
                        style={{
                          background: i === currentStep.stack.length - 1 ? '#2a1f0a' : '#0d0d1a',
                          borderColor: i === currentStep.stack.length - 1 ? '#f59e0b' : '#2a2a3a',
                          color: i === currentStep.stack.length - 1 ? '#f59e0b' : '#fbbf24',
                        }}
                      >
                        {id}
                        {i === currentStep.stack.length - 1 && (
                          <span className="text-[0.5rem] ml-1 text-[#6b6b7a]">\u2190 top</span>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-[#3a3a4a] text-xs text-center font-mono">
                      {currentStep ? '(empty)' : '...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {phase === 'running' && (
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="pixel-btn pixel-btn-secondary"
              style={{ fontSize: '0.5rem', padding: '0.4rem 0.8rem' }}
            >
              {autoPlay ? '\u23F8 PAUSE' : '\u25B6 AUTO'}
            </button>
            {!autoPlay && (
              <button
                onClick={advanceStep}
                className="pixel-btn pixel-btn-primary"
                style={{ fontSize: '0.5rem', padding: '0.4rem 0.8rem' }}
              >
                NEXT STEP \u25B6
              </button>
            )}
          </div>
        )}

        {/* Step info */}
        {currentStep && phase === 'running' && (
          <div className="bg-[#0d0d1a] border border-[#2a2a3a] p-2">
            <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-1">
              STEP {stepIdx + 1}/{dfsSteps.length} — Visiting{' '}
              <span className="text-[#f59e0b]">{currentStep.current}</span>
              {currentStep.backtrack && (
                <span className="text-[#e8645a] ml-2">(BACKTRACKING)</span>
              )}
            </div>
            <div className="text-xs font-mono text-[#6b6b7a]">
              Order: {visitOrder.map((id, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-[#3a3a4a]"> \u2192 </span>}
                  <span className={id === currentStep.current ? 'text-[#f59e0b]' : 'text-[#22c55e]'}>{id}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Running hint */}
        {phase === 'running' && !autoPlay && stepIdx < 0 && (
          <div className="pixel-dialog pointer-events-none">
            <p className="text-sm">
              <span className="text-[#d97706]">\u25CF</span> Click the node DFS will visit{' '}
              <span className="text-[#d97706] font-bold">next</span>, or use{' '}
              <span className="text-[#d97706]">AUTO</span> to watch.
            </p>
            <p className="text-[#6b6b7a] text-xs mt-1">
              DFS goes deep first, then backtracks. Watch the stack!
            </p>
          </div>
        )}

        {/* Complete phase — compare with BFS */}
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="pixel-font text-center text-[#22c55e] text-glow-green" style={{ fontSize: 'clamp(0.5rem, 2.5vw, 0.8rem)' }}>
              DFS TRAVERSAL COMPLETE!
            </div>

            {/* Comparison */}
            <div className="bg-[#0d0d1a] border border-[#2a2a3a] p-3">
              <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-2">DFS vs BFS COMPARISON</div>
              <div className="flex flex-col gap-2 text-xs font-mono">
                <div>
                  <span className="text-[#f59e0b]">DFS:</span>{' '}
                  {dfsSteps.map((s, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-[#3a3a4a]"> \u2192 </span>}
                      <span className="text-[#22c55e]">{s.current}</span>
                    </span>
                  ))}
                </div>
                <div>
                  <span className="text-[#60a5fa]">BFS:</span>{' '}
                  {bfsOrder.map((id, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-[#3a3a4a]"> \u2192 </span>}
                      <span className="text-[#93c5fd]">{id}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[0.65rem] text-[#6b6b7a] mt-2">
                DFS explores deeply before backtracking. BFS explores level by level.
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={finishLevel}
                className="pixel-btn pixel-btn-primary"
                style={{ fontSize: '0.5rem', padding: '0.5rem 1.2rem' }}
              >
                FINISH \u2192
              </button>
            </div>
          </motion.div>
        )}

        {/* Intro dialog */}
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="DEPTH SEEKER"
                onDone={startChallenge}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
