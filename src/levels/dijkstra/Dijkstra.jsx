import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'dijkstra'

const DIALOG_LINES = [
  '* Greetings, traveler! I am the Weighted Oracle.',
  "* Dijkstra's Algorithm finds the shortest path in a weighted graph.",
  '* Each edge has a COST. The algorithm always picks the cheapest unvisited node.',
  '* It updates distances to neighbors if a shorter path is found.',
  '* Pick the START node, then watch the algorithm find shortest paths to all nodes!',
]

// ── Graph generation ────────────────────────────────────────────────────────
function generateGraph(seed) {
  const rng = mulberry32(seed)
  const nodeCount = 6 + Math.floor(rng() * 3) // 6-8 nodes
  const labels = 'ABCDEFGH'.slice(0, nodeCount).split('')

  // Place nodes in a circle for clean layout
  const cx = 250, cy = 200, radius = 140
  const nodes = labels.map((label, i) => {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2
    return {
      id: label,
      x: cx + radius * Math.cos(angle) + (rng() - 0.5) * 30,
      y: cy + radius * Math.sin(angle) + (rng() - 0.5) * 30,
    }
  })

  // Generate edges — ensure connected graph
  const edges = []
  const edgeSet = new Set()
  function addEdge(a, b, w) {
    const key = [a, b].sort().join('-')
    if (!edgeSet.has(key) && a !== b) {
      edgeSet.add(key)
      edges.push({ from: a, to: b, weight: w })
    }
  }

  // Spanning tree first (ensure connectivity)
  const shuffled = [...labels]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  for (let i = 1; i < shuffled.length; i++) {
    addEdge(shuffled[i - 1], shuffled[i], 1 + Math.floor(rng() * 9))
  }

  // Add extra edges
  const extraCount = Math.floor(nodeCount * 0.8)
  for (let k = 0; k < extraCount; k++) {
    const a = labels[Math.floor(rng() * nodeCount)]
    const b = labels[Math.floor(rng() * nodeCount)]
    addEdge(a, b, 1 + Math.floor(rng() * 9))
  }

  return { nodes, edges }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// ── Dijkstra's algorithm (full run) ─────────────────────────────────────────
function runDijkstra(nodes, edges, startId) {
  const dist = {}
  const prev = {}
  const visited = new Set()
  const steps = [] // each step: { current, visited: Set, dist: {...}, relaxed: [...] }

  nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null })
  dist[startId] = 0

  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    adj[e.from].push({ to: e.to, w: e.weight })
    adj[e.to].push({ to: e.from, w: e.weight })
  })

  for (let i = 0; i < nodes.length; i++) {
    // Pick unvisited node with smallest dist
    let u = null, best = Infinity
    nodes.forEach(n => {
      if (!visited.has(n.id) && dist[n.id] < best) {
        best = dist[n.id]
        u = n.id
      }
    })
    if (u === null) break

    visited.add(u)
    const relaxed = []

    adj[u].forEach(({ to, w }) => {
      if (!visited.has(to)) {
        const alt = dist[u] + w
        if (alt < dist[to]) {
          dist[to] = alt
          prev[to] = u
          relaxed.push(to)
        }
      }
    })

    steps.push({
      current: u,
      visited: new Set(visited),
      dist: { ...dist },
      relaxed: [...relaxed],
      prev: { ...prev },
    })
  }

  return { steps, finalDist: dist, prev }
}

function getShortestPath(prev, target) {
  const path = []
  let curr = target
  while (curr !== null) {
    path.unshift(curr)
    curr = prev[curr]
  }
  return path
}

// ── Scoring ─────────────────────────────────────────────────────────────────
function calcStars(correctPicks, totalSteps) {
  const ratio = correctPicks / Math.max(1, totalSteps)
  if (ratio >= 0.85) return 3
  if (ratio >= 0.6) return 2
  return 1
}

// ── SVG dimensions ──────────────────────────────────────────────────────────
const SVG_W = 500, SVG_H = 400, NODE_R = 22

export default function Dijkstra() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')        // intro | pickStart | running | complete | score
  const [graph, setGraph] = useState(null)
  const [startNode, setStartNode] = useState(null)
  const [algoSteps, setAlgoSteps] = useState([])
  const [stepIdx, setStepIdx] = useState(-1)
  const [autoPlay, setAutoPlay] = useState(false)
  const [correctPicks, setCorrectPicks] = useState(0)
  const [totalPicks, setTotalPicks] = useState(0)
  const [showPath, setShowPath] = useState(null)       // target node to highlight path to
  const [score, setScore] = useState(null)
  const autoRef = useRef(null)

  // Current step data
  const currentStep = stepIdx >= 0 && stepIdx < algoSteps.length ? algoSteps[stepIdx] : null
  const finalStep = algoSteps.length > 0 ? algoSteps[algoSteps.length - 1] : null

  // ── Init graph ────────────────────────────────────────────────────────────
  function startChallenge() {
    const seed = Date.now()
    const g = generateGraph(seed)
    setGraph(g)
    setStartNode(null)
    setStepIdx(-1)
    setAlgoSteps([])
    setAutoPlay(false)
    setCorrectPicks(0)
    setTotalPicks(0)
    setShowPath(null)
    setScore(null)
    setPhase('pickStart')
  }

  // ── Pick start node ───────────────────────────────────────────────────────
  function handlePickStart(nodeId) {
    if (phase !== 'pickStart') return
    setStartNode(nodeId)
    const { steps } = runDijkstra(graph.nodes, graph.edges, nodeId)
    setAlgoSteps(steps)
    setStepIdx(-1)
    setPhase('running')
  }

  // ── Step forward ──────────────────────────────────────────────────────────
  const advanceStep = useCallback(() => {
    setStepIdx(prev => {
      const next = prev + 1
      if (next >= algoSteps.length) {
        setAutoPlay(false)
        setPhase('complete')
        return prev
      }
      return next
    })
  }, [algoSteps.length])

  // ── Interactive: user picks next node ─────────────────────────────────────
  function handleNodeClick(nodeId) {
    if (phase === 'pickStart') {
      handlePickStart(nodeId)
      return
    }
    if (phase !== 'running') return
    if (stepIdx + 1 >= algoSteps.length) return

    const nextStep = algoSteps[stepIdx + 1]
    setTotalPicks(p => p + 1)
    if (nextStep.current === nodeId) {
      setCorrectPicks(p => p + 1)
      advanceStep()
    }
    // Wrong pick — just flash, don't advance
  }

  // ── Auto-play ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoPlay && phase === 'running') {
      autoRef.current = setInterval(() => {
        advanceStep()
      }, 1200)
    }
    return () => clearInterval(autoRef.current)
  }, [autoPlay, phase, advanceStep])

  // ── Complete → score ──────────────────────────────────────────────────────
  function finishLevel() {
    const stars = calcStars(correctPicks, totalPicks)
    const xp = 120 + stars * 30
    setScore({ stars, xp })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function reset() {
    setPhase('intro')
    setGraph(null)
    setStartNode(null)
    setAlgoSteps([])
    setStepIdx(-1)
    setAutoPlay(false)
    setCorrectPicks(0)
    setTotalPicks(0)
    setShowPath(null)
    setScore(null)
  }

  // ── Helpers for rendering ─────────────────────────────────────────────────
  function nodeColor(id) {
    if (phase === 'pickStart') return '#4a4a6a'
    if (!currentStep && phase === 'running') return '#4a4a6a'

    const step = phase === 'complete' ? finalStep : currentStep
    if (!step) return '#4a4a6a'

    if (showPath) {
      const pathNodes = getShortestPath(step.prev, showPath)
      if (pathNodes.includes(id)) return '#e8645a'
    }

    if (step.current === id && phase !== 'complete') return '#f59e0b'
    if (step.visited.has(id)) return '#22c55e'
    if (step.relaxed.includes(id)) return '#fbbf24'
    return '#4a4a6a'
  }

  function nodeBorder(id) {
    if (id === startNode) return '#f59e0b'
    if (showPath) {
      const step = phase === 'complete' ? finalStep : currentStep
      if (step) {
        const pathNodes = getShortestPath(step.prev, showPath)
        if (pathNodes.includes(id)) return '#e8645a'
      }
    }
    return nodeColor(id)
  }

  function edgeColor(from, to) {
    if (!showPath || !finalStep) return '#2a2a3a'
    const pathNodes = getShortestPath(finalStep.prev, showPath)
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const a = pathNodes[i], b = pathNodes[i + 1]
      if ((a === from && b === to) || (a === to && b === from)) return '#e8645a'
    }
    return '#2a2a3a'
  }

  function getDistLabel(id) {
    const step = phase === 'complete' ? finalStep : currentStep
    if (!step) return ''
    const d = step.dist[id]
    return d === Infinity ? '\u221E' : String(d)
  }

  // ── Score screen ──────────────────────────────────────────────────────────
  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Dijkstra's Algorithm"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct picks', value: `${correctPicks}/${totalPicks}` },
          { label: 'Nodes explored', value: algoSteps.length },
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
          LV.10 — DIJKSTRA
        </div>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        {(phase === 'running' || phase === 'complete') && (
          <div className="flex gap-2 flex-wrap justify-center">
            {[
              { color: '#f59e0b', label: 'Current' },
              { color: '#22c55e', label: 'Visited' },
              { color: '#fbbf24', label: 'Relaxed' },
              { color: '#4a4a6a', label: 'Unvisited' },
              { color: '#e8645a', label: 'Path' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* SVG Graph */}
        {graph && phase !== 'intro' && (
          <div className="flex justify-center">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full max-w-lg"
              style={{ background: '#0d0d1a', borderRadius: '4px', border: '1px solid #1a1a2a' }}
            >
              {/* Edges */}
              {graph.edges.map((e, i) => {
                const from = graph.nodes.find(n => n.id === e.from)
                const to = graph.nodes.find(n => n.id === e.to)
                const ec = edgeColor(e.from, e.to)
                const midX = (from.x + to.x) / 2
                const midY = (from.y + to.y) / 2
                return (
                  <g key={`edge-${i}`}>
                    <motion.line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={ec}
                      strokeWidth={ec === '#e8645a' ? 3 : 1.5}
                      animate={{ stroke: ec }}
                      transition={{ duration: 0.3 }}
                    />
                    <rect
                      x={midX - 10} y={midY - 8} width={20} height={16} rx={3}
                      fill="#0a0a12" stroke="#2a2a3a" strokeWidth={0.5}
                    />
                    <text
                      x={midX} y={midY + 4}
                      textAnchor="middle"
                      fill="#8b8b9a"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {e.weight}
                    </text>
                  </g>
                )
              })}

              {/* Nodes */}
              {graph.nodes.map(n => {
                const nc = nodeColor(n.id)
                const nb = nodeBorder(n.id)
                const distLabel = getDistLabel(n.id)
                const clickable = phase === 'pickStart' || phase === 'running'
                return (
                  <g
                    key={n.id}
                    onClick={() => handleNodeClick(n.id)}
                    style={{ cursor: clickable ? 'pointer' : 'default' }}
                  >
                    <motion.circle
                      cx={n.x} cy={n.y} r={NODE_R}
                      fill="#0d0d1a"
                      stroke={nb}
                      strokeWidth={2.5}
                      animate={{
                        stroke: nb,
                        filter: nc === '#f59e0b' ? 'drop-shadow(0 0 8px rgba(245,158,11,0.7))' : 'none',
                      }}
                      transition={{ duration: 0.3 }}
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
                    {/* Distance label */}
                    {distLabel && (
                      <motion.text
                        x={n.x} y={n.y - NODE_R - 6}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        d={distLabel}
                      </motion.text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        )}

        {/* Controls during running */}
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
              STEP {stepIdx + 1}/{algoSteps.length} — Visiting node{' '}
              <span className="text-[#f59e0b]">{currentStep.current}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {graph.nodes.map(n => (
                <span key={n.id} className={currentStep.visited.has(n.id) ? 'text-[#22c55e]' : 'text-[#6b6b7a]'}>
                  {n.id}:{currentStep.dist[n.id] === Infinity ? '\u221E' : currentStep.dist[n.id]}
                </span>
              ))}
            </div>
            {currentStep.relaxed.length > 0 && (
              <div className="text-[#fbbf24] text-xs mt-1 font-mono">
                Updated: {currentStep.relaxed.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Complete phase — pick a target to show path */}
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="pixel-font text-center text-[#22c55e] text-glow-green" style={{ fontSize: 'clamp(0.5rem, 2.5vw, 0.8rem)' }}>
              ALGORITHM COMPLETE!
            </div>
            <div className="bg-[#0d0d1a] border border-[#2a2a3a] p-2">
              <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-1">
                FINAL DISTANCES FROM {startNode}:
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {graph.nodes.map(n => (
                  <span key={n.id} className="text-[#22c55e]">
                    {n.id}:{finalStep.dist[n.id] === Infinity ? '\u221E' : finalStep.dist[n.id]}
                  </span>
                ))}
              </div>
            </div>
            <div className="pixel-font text-[0.45rem] text-[#6b6b7a] text-center">
              CLICK A NODE TO HIGHLIGHT SHORTEST PATH:
            </div>
            <div className="flex justify-center gap-2">
              {graph.nodes.filter(n => n.id !== startNode).map(n => (
                <button
                  key={n.id}
                  onClick={() => setShowPath(showPath === n.id ? null : n.id)}
                  className="px-2 py-1 text-xs font-mono border"
                  style={{
                    background: showPath === n.id ? '#2a1a1a' : '#0d0d1a',
                    borderColor: showPath === n.id ? '#e8645a' : '#2a2a3a',
                    color: showPath === n.id ? '#e8645a' : '#6b6b7a',
                    cursor: 'pointer',
                  }}
                >
                  {n.id} (d={finalStep.dist[n.id] === Infinity ? '\u221E' : finalStep.dist[n.id]})
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-2">
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

        {/* Phase UIs */}
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="WEIGHTED ORACLE"
                onDone={startChallenge}
              />
            </motion.div>
          )}

          {phase === 'pickStart' && (
            <motion.div
              key="pickStart"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pixel-dialog pointer-events-none"
            >
              <p className="text-sm">
                <span className="text-[#d97706]">\u25CF</span> Click a{' '}
                <span className="text-[#d97706] font-bold">node</span> to set it as the start.
              </p>
              <p className="text-[#6b6b7a] text-xs mt-1">
                Dijkstra will find shortest paths from that node to all others.
              </p>
            </motion.div>
          )}

          {phase === 'running' && !autoPlay && stepIdx < 0 && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pixel-dialog pointer-events-none"
            >
              <p className="text-sm">
                <span className="text-[#d97706]">\u25CF</span> Click the node with the{' '}
                <span className="text-[#fbbf24] font-bold">smallest distance</span> to advance,
                or use <span className="text-[#d97706]">AUTO</span> to watch.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
