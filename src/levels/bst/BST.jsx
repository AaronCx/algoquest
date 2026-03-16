import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'bst'

const DIALOG_LINES = [
  '* Hello, seeker! I am the Tree Keeper.',
  '* A Binary Search Tree (BST) keeps values sorted as they are inserted.',
  '* For each node: LEFT children are SMALLER, RIGHT children are LARGER.',
  '* You will guide values into the tree by choosing LEFT or RIGHT at each step.',
  '* Then we will SEARCH for a value — follow the path to find it!',
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

// ── BST Node ────────────────────────────────────────────────────────────────
function createNode(value) {
  return { value, left: null, right: null }
}

function insertIntoTree(root, value) {
  if (!root) return createNode(value)
  const newRoot = { ...root }
  if (value < root.value) {
    newRoot.left = insertIntoTree(root.left, value)
  } else if (value > root.value) {
    newRoot.right = insertIntoTree(root.right, value)
  }
  return newRoot
}

// ── Tree layout (assign x,y positions) ─────────────────────────────────────
function layoutTree(root) {
  if (!root) return []
  const nodes = []
  const SVG_W = 500

  function traverse(node, depth, leftBound, rightBound, parentX, parentY, side) {
    const x = (leftBound + rightBound) / 2
    const y = 50 + depth * 70
    nodes.push({
      value: node.value,
      x, y,
      parentX, parentY,
      side,
      hasLeft: !!node.left,
      hasRight: !!node.right,
    })
    if (node.left) traverse(node.left, depth + 1, leftBound, x, x, y, 'left')
    if (node.right) traverse(node.right, depth + 1, x, rightBound, x, y, 'right')
  }

  traverse(root, 0, 30, SVG_W - 30, 0, 0, null)
  return nodes
}

// ── Get insertion path (direction choices at each node) ─────────────────────
function getInsertionPath(root, value) {
  const path = []
  let node = root
  while (node) {
    if (value < node.value) {
      path.push({ nodeValue: node.value, direction: 'left' })
      node = node.left
    } else if (value > node.value) {
      path.push({ nodeValue: node.value, direction: 'right' })
      node = node.right
    } else {
      break // duplicate
    }
  }
  return path
}

// ── Search path ─────────────────────────────────────────────────────────────
function getSearchPath(root, target) {
  const path = []
  let node = root
  while (node) {
    path.push(node.value)
    if (target === node.value) return { path, found: true }
    if (target < node.value) node = node.left
    else node = node.right
  }
  return { path, found: false }
}

// ── Generate sequence ───────────────────────────────────────────────────────
function generateSequence(seed) {
  const rng = mulberry32(seed)
  const count = 7 + Math.floor(rng() * 3) // 7-9 values
  const values = new Set()
  while (values.size < count) {
    values.add(Math.floor(rng() * 90) + 10) // 10-99
  }
  return Array.from(values)
}

// ── Scoring ─────────────────────────────────────────────────────────────────
function calcStars(correctInserts, totalInsertPicks, correctSearches, totalSearchPicks) {
  const total = totalInsertPicks + totalSearchPicks
  const correct = correctInserts + correctSearches
  const ratio = correct / Math.max(1, total)
  if (ratio >= 0.85) return 3
  if (ratio >= 0.6) return 2
  return 1
}

// ── Constants ───────────────────────────────────────────────────────────────
const SVG_W = 500, SVG_H = 420, NODE_R = 18

export default function BST() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')
  // intro | inserting | insertStep | searchIntro | searching | searchStep | complete | score
  const [sequence, setSequence] = useState([])
  const [tree, setTree] = useState(null)
  const [insertIdx, setInsertIdx] = useState(0)
  const [insertPath, setInsertPath] = useState([])
  const [insertPathIdx, setInsertPathIdx] = useState(0)
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [placedNodes, setPlacedNodes] = useState(new Set())
  const [currentTraverseNode, setCurrentTraverseNode] = useState(null)
  const [wrongFlash, setWrongFlash] = useState(false)

  // Search phase
  const [searchTarget, setSearchTarget] = useState(null)
  const [searchPath, setSearchPath] = useState([])
  const [searchPathIdx, setSearchPathIdx] = useState(0)
  const [searchHighlight, setSearchHighlight] = useState(new Set())

  // Scoring
  const [correctInserts, setCorrectInserts] = useState(0)
  const [totalInsertPicks, setTotalInsertPicks] = useState(0)
  const [correctSearches, setCorrectSearches] = useState(0)
  const [totalSearchPicks, setTotalSearchPicks] = useState(0)
  const [score, setScore] = useState(null)

  // ── Start ─────────────────────────────────────────────────────────────────
  function startChallenge() {
    const seed = Date.now() // eslint-disable-line react-hooks/purity
    const seq = generateSequence(seed)
    setSequence(seq)
    setTree(null)
    setInsertIdx(0)
    setPlacedNodes(new Set())
    setHighlightNodes(new Set())
    setCurrentTraverseNode(null)
    setCorrectInserts(0)
    setTotalInsertPicks(0)
    setCorrectSearches(0)
    setTotalSearchPicks(0)
    setScore(null)
    setWrongFlash(false)
    // First value goes straight in (root)
    const root = createNode(seq[0])
    setTree(root)
    setPlacedNodes(new Set([seq[0]]))
    setInsertIdx(1)
    if (seq.length > 1) {
      beginInsertStep(root, seq[1])
    }
    setPhase('inserting')
  }

  function beginInsertStep(currentTree, value) {
    const path = getInsertionPath(currentTree, value)
    setInsertPath(path)
    setInsertPathIdx(0)
    setHighlightNodes(new Set())
    if (path.length > 0) {
      setCurrentTraverseNode(path[0].nodeValue)
    }
    setPhase('insertStep')
  }

  // ── Handle left/right choice during insert ────────────────────────────────
  function handleInsertChoice(direction) {
    if (phase !== 'insertStep') return

    const step = insertPath[insertPathIdx]
    if (!step) return

    setTotalInsertPicks(p => p + 1)

    if (direction === step.direction) {
      setCorrectInserts(p => p + 1)
      const newHighlight = new Set(highlightNodes)
      newHighlight.add(step.nodeValue)
      setHighlightNodes(newHighlight)

      const nextIdx = insertPathIdx + 1
      if (nextIdx >= insertPath.length) {
        // Place the value
        const value = sequence[insertIdx]
        const newTree = insertIntoTree(tree, value)
        const newPlaced = new Set(placedNodes)
        newPlaced.add(value)
        setTree(newTree)
        setPlacedNodes(newPlaced)
        setCurrentTraverseNode(null)
        setHighlightNodes(new Set())

        const nextInsertIdx = insertIdx + 1
        setInsertIdx(nextInsertIdx)

        if (nextInsertIdx < sequence.length) {
          // Short delay before next insertion
          setTimeout(() => {
            beginInsertStep(newTree, sequence[nextInsertIdx])
          }, 600)
          setPhase('inserting')
        } else {
          // All inserted, move to search
          setTimeout(() => startSearchPhase(newTree), 800)
          setPhase('inserting')
        }
      } else {
        setInsertPathIdx(nextIdx)
        setCurrentTraverseNode(insertPath[nextIdx].nodeValue)
      }
    } else {
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 400)
    }
  }

  // ── Search phase ──────────────────────────────────────────────────────────
  function startSearchPhase(currentTree) {
    // Pick a random value that exists in the tree
    const rng = mulberry32(Date.now())
    const target = sequence[Math.floor(rng() * sequence.length)]
    setSearchTarget(target)
    const { path } = getSearchPath(currentTree, target)
    setSearchPath(path)
    setSearchPathIdx(0)
    setSearchHighlight(new Set())
    setCurrentTraverseNode(path.length > 0 ? path[0] : null)
    setPhase('searchIntro')
  }

  function beginSearch() {
    setPhase('searchStep')
  }

  function handleSearchChoice(direction) {
    if (phase !== 'searchStep') return

    const currentVal = searchPath[searchPathIdx]
    if (currentVal === undefined) return

    // Determine correct direction
    let correctDir
    if (searchPathIdx + 1 >= searchPath.length) {
      // We found it — should not be choosing direction
      return
    }
    const nextVal = searchPath[searchPathIdx + 1]
    correctDir = nextVal < currentVal ? 'left' : 'right'

    setTotalSearchPicks(p => p + 1)

    if (direction === correctDir) {
      setCorrectSearches(p => p + 1)
      const newHighlight = new Set(searchHighlight)
      newHighlight.add(currentVal)
      setSearchHighlight(newHighlight)

      const nextIdx = searchPathIdx + 1
      setSearchPathIdx(nextIdx)
      setCurrentTraverseNode(searchPath[nextIdx])

      // Check if found
      if (searchPath[nextIdx] === searchTarget) {
        newHighlight.add(searchTarget)
        setSearchHighlight(newHighlight)
        setTimeout(() => setPhase('complete'), 800)
      }
    } else {
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 400)
    }
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  function finishLevel() {
    const stars = calcStars(correctInserts, totalInsertPicks, correctSearches, totalSearchPicks)
    const xp = 100 + stars * 25
    setScore({ stars, xp })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  function reset() {
    setPhase('intro')
    setTree(null)
    setSequence([])
    setInsertIdx(0)
    setInsertPath([])
    setInsertPathIdx(0)
    setHighlightNodes(new Set())
    setPlacedNodes(new Set())
    setCurrentTraverseNode(null)
    setSearchTarget(null)
    setSearchPath([])
    setSearchPathIdx(0)
    setSearchHighlight(new Set())
    setCorrectInserts(0)
    setTotalInsertPicks(0)
    setCorrectSearches(0)
    setTotalSearchPicks(0)
    setScore(null)
    setWrongFlash(false)
  }

  // ── Node coloring ─────────────────────────────────────────────────────────
  function getNodeColor(value) {
    if (phase === 'searchStep' || phase === 'searchIntro' || phase === 'complete') {
      if (searchHighlight.has(value)) return '#22c55e'
      if (value === currentTraverseNode) return '#f59e0b'
      if (placedNodes.has(value)) return '#4a4a6a'
    }
    if (value === currentTraverseNode) return '#f59e0b'
    if (highlightNodes.has(value)) return '#fbbf24'
    if (placedNodes.has(value)) return '#22c55e'
    return '#4a4a6a'
  }

  function getNodeGlow(value) {
    if (value === currentTraverseNode) return 'drop-shadow(0 0 8px rgba(245,158,11,0.7))'
    return 'none'
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  const treeNodes = tree ? layoutTree(tree) : []

  // ── Score screen ──────────────────────────────────────────────────────────
  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Binary Search Tree"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Insert accuracy', value: `${correctInserts}/${totalInsertPicks}` },
          { label: 'Search accuracy', value: `${correctSearches}/${totalSearchPicks}` },
          { label: 'Tree size', value: sequence.length },
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
          LV.11 — BST
        </div>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        {phase !== 'intro' && phase !== 'score' && (
          <div className="flex gap-2 flex-wrap justify-center">
            {[
              { color: '#f59e0b', label: 'Current' },
              { color: '#fbbf24', label: 'Path' },
              { color: '#22c55e', label: 'Placed' },
              { color: '#4a4a6a', label: 'Node' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* SVG Tree */}
        {tree && phase !== 'intro' && (
          <div className="flex justify-center">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full max-w-lg"
              style={{ background: '#0d0d1a', borderRadius: '4px', border: '1px solid #1a1a2a' }}
            >
              {/* Edges */}
              {treeNodes.filter(n => n.parentX !== 0 || n.parentY !== 0).map((n, i) => (
                <motion.line
                  key={`edge-${n.value}-${i}`}
                  x1={n.parentX} y1={n.parentY}
                  x2={n.x} y2={n.y}
                  stroke="#2a2a3a"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ))}

              {/* Nodes */}
              {treeNodes.map((n) => {
                const nc = getNodeColor(n.value)
                const glow = getNodeGlow(n.value)
                return (
                  <g key={`node-${n.value}`}>
                    <motion.circle
                      cx={n.x} cy={n.y} r={NODE_R}
                      fill="#0d0d1a"
                      stroke={nc}
                      strokeWidth={2.5}
                      initial={{ scale: 0 }}
                      animate={{
                        scale: 1,
                        stroke: nc,
                        filter: glow,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                    <text
                      x={n.x} y={n.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={nc}
                      fontSize="13"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {n.value}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}

        {/* Sequence progress */}
        {phase !== 'intro' && phase !== 'score' && phase !== 'complete' && (
          <div className="bg-[#0d0d1a] border border-[#2a2a3a] p-2">
            <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-1">
              {phase.startsWith('search') || phase === 'searchStep'
                ? `SEARCH FOR: ${searchTarget}`
                : `INSERT VALUES (${insertIdx}/${sequence.length}):`
              }
            </div>
            <div className="flex flex-wrap gap-1">
              {sequence.map((v, i) => (
                <span
                  key={`seq-${i}`}
                  className="px-1.5 py-0.5 text-xs font-mono border"
                  style={{
                    background: i < insertIdx ? '#1a2a1a' : i === insertIdx && phase !== 'searchStep' && phase !== 'searchIntro' ? '#2a1f0a' : '#0d0d1a',
                    borderColor: i < insertIdx ? '#2a3a2a' : i === insertIdx && phase !== 'searchStep' && phase !== 'searchIntro' ? '#f59e0b' : '#1a1a2a',
                    color: i < insertIdx ? '#22c55e' : i === insertIdx && phase !== 'searchStep' && phase !== 'searchIntro' ? '#f59e0b' : '#4a4a6a',
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Left/Right choice buttons */}
        {(phase === 'insertStep' || phase === 'searchStep') && (
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={() => phase === 'insertStep' ? handleInsertChoice('left') : handleSearchChoice('left')}
              className="pixel-btn"
              animate={{
                backgroundColor: wrongFlash ? '#3a1a1a' : '#1a1a2a',
                borderColor: wrongFlash ? '#e8645a' : '#4a4a6a',
              }}
              style={{ fontSize: '0.55rem', padding: '0.5rem 1.5rem', color: '#f0e6d3', border: '2px solid #4a4a6a' }}
            >
              \u2190 LEFT (smaller)
            </motion.button>
            <motion.button
              onClick={() => phase === 'insertStep' ? handleInsertChoice('right') : handleSearchChoice('right')}
              className="pixel-btn"
              animate={{
                backgroundColor: wrongFlash ? '#3a1a1a' : '#1a1a2a',
                borderColor: wrongFlash ? '#e8645a' : '#4a4a6a',
              }}
              style={{ fontSize: '0.55rem', padding: '0.5rem 1.5rem', color: '#f0e6d3', border: '2px solid #4a4a6a' }}
            >
              RIGHT (larger) \u2192
            </motion.button>
          </div>
        )}

        {/* Instruction text for current step */}
        {phase === 'insertStep' && (
          <div className="text-center text-sm text-[#6b6b7a]">
            Inserting <span className="text-[#f59e0b] font-bold">{sequence[insertIdx]}</span> —
            at node <span className="text-[#f59e0b] font-bold">{currentTraverseNode}</span>,
            go left or right?
          </div>
        )}

        {phase === 'searchStep' && (
          <div className="text-center text-sm text-[#6b6b7a]">
            Searching for <span className="text-[#f59e0b] font-bold">{searchTarget}</span> —
            at node <span className="text-[#f59e0b] font-bold">{currentTraverseNode}</span>,
            go left or right?
          </div>
        )}

        {/* Complete */}
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="pixel-font text-center text-[#22c55e] text-glow-green" style={{ fontSize: 'clamp(0.5rem, 2.5vw, 0.8rem)' }}>
              TREE BUILT & VALUE FOUND!
            </div>
            <div className="text-[#6b6b7a] text-sm text-center">
              Found <span className="text-[#22c55e] font-bold">{searchTarget}</span> in{' '}
              {searchPath.length} steps through the tree.
            </div>
            <button
              onClick={finishLevel}
              className="pixel-btn pixel-btn-primary"
              style={{ fontSize: '0.5rem', padding: '0.5rem 1.2rem' }}
            >
              FINISH \u2192
            </button>
          </motion.div>
        )}

        {/* Phase UIs */}
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="TREE KEEPER"
                onDone={startChallenge}
              />
            </motion.div>
          )}

          {phase === 'inserting' && (
            <motion.div
              key="inserting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pixel-dialog pointer-events-none"
            >
              <p className="text-sm">
                <span className="text-[#22c55e]">\u2713</span> Value placed!{' '}
                {insertIdx < sequence.length
                  ? <span>Next up: <span className="text-[#f59e0b] font-bold">{sequence[insertIdx]}</span></span>
                  : <span className="text-[#22c55e]">All values inserted! Preparing search...</span>
                }
              </p>
            </motion.div>
          )}

          {phase === 'searchIntro' && (
            <motion.div
              key="searchIntro"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="pixel-dialog">
                <p className="text-sm">
                  Now let's <span className="text-[#d97706] font-bold">SEARCH</span> for the value{' '}
                  <span className="text-[#f59e0b] font-bold">{searchTarget}</span> in the tree!
                </p>
                <p className="text-[#6b6b7a] text-xs mt-1">
                  At each node, choose left or right based on the target value.
                </p>
              </div>
              <button
                onClick={beginSearch}
                className="pixel-btn pixel-btn-primary"
                style={{ fontSize: '0.5rem', padding: '0.5rem 1rem' }}
              >
                START SEARCH \u25B6
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
