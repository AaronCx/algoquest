import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'heap-sort'

const DIALOG_LINES = [
  '* Welcome to the Heap! I am the Heap Guardian.',
  '* Heap Sort builds a MAX-HEAP, where every parent is larger than its children.',
  '* Once the heap is built, we extract the maximum and place it at the end.',
  '* Then we re-heapify the remaining elements and repeat!',
  "* You'll help build the heap. For each node, decide if it needs to SIFT DOWN. Let's go!",
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeArray(n = 7) {
  let arr
  do { arr = shuffle(Array.from({ length: n }, (_, i) => i + 1)) }
  while (arr.every((v, i, a) => i === 0 || a[i - 1] <= v))
  return arr
}

// Compute all heap sort steps
function computeHeapSortSteps(inputArr) {
  const steps = []
  const arr = [...inputArr]
  const n = arr.length

  function siftDown(start, end) {
    let root = start
    while (2 * root + 1 <= end) {
      let child = 2 * root + 1
      let swap = root

      steps.push({ type: 'compare', i: swap, j: child, heapEnd: end })
      if (arr[swap] < arr[child]) swap = child

      if (child + 1 <= end) {
        steps.push({ type: 'compare', i: swap, j: child + 1, heapEnd: end })
        if (arr[swap] < arr[child + 1]) swap = child + 1
      }

      if (swap !== root) {
        steps.push({ type: 'swap', i: root, j: swap, heapEnd: end });
        [arr[root], arr[swap]] = [arr[swap], arr[root]]
        root = swap
      } else {
        break
      }
    }
  }

  // Build max heap
  steps.push({ type: 'phase', name: 'build' })
  for (let i = Math.floor((n - 2) / 2); i >= 0; i--) {
    steps.push({ type: 'sift-start', index: i, heapEnd: n - 1 })
    siftDown(i, n - 1)
  }

  // Extract elements
  steps.push({ type: 'phase', name: 'extract' })
  for (let end = n - 1; end > 0; end--) {
    steps.push({ type: 'extract', i: 0, j: end });
    [arr[0], arr[end]] = [arr[end], arr[0]]
    steps.push({ type: 'sorted', index: end })
    if (end > 1) {
      siftDown(0, end - 1)
    }
  }
  steps.push({ type: 'sorted', index: 0 })

  return { steps, sortedArr: arr }
}

// Tree layout positions for a binary heap of size n
function getTreePositions(n) {
  const positions = []
  const depth = Math.floor(Math.log2(n)) + 1
  const width = 280
  const height = Math.min(140, depth * 40)

  for (let i = 0; i < n; i++) {
    const d = Math.floor(Math.log2(i + 1))
    const posInLevel = i - (Math.pow(2, d) - 1)
    // nodesInLevel intentionally unused — layout uses posInLevel directly
    const levelWidth = width / Math.pow(2, d)
    const x = levelWidth * (posInLevel + 0.5)
    const y = (d / (depth - 1 || 1)) * height
    positions.push({ x, y })
  }
  return positions
}

export default function HeapSort() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')   // intro | challenge | auto | score
  const [arr, setArr] = useState(() => makeArray())
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // Challenge: user helps build the heap (sift down decisions)
  const [challengeIdx, setChallengeIdx] = useState(null) // current node being sifted
  const [challengeChild, setChallengeChild] = useState(null) // which child to compare
  const [, setHeapBuilt] = useState(false)

  // Auto-animate
  const [autoArr, setAutoArr] = useState(null)
  const [autoHighlight, setAutoHighlight] = useState(null) // {type, indices}
  const [sortedIndices, setSortedIndices] = useState(new Set())
  const [autoPhaseLabel, setAutoPhaseLabel] = useState('')
  const autoRef = useRef(null)

  const N = arr.length

  // Start challenge: ask user about each sift-down during heap build
  useEffect(() => {
    if (phase === 'challenge' && challengeIdx === null) {
      // Start from last non-leaf node
      const startIdx = Math.floor((N - 2) / 2)
      beginSiftChallenge(startIdx)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function beginSiftChallenge(nodeIdx) {
    if (nodeIdx < 0) {
      // Heap build complete, go to auto-extract
      setHeapBuilt(true)
      setTimeout(() => {
        setAutoArr([...arr])
        setPhase('auto')
      }, 400)
      return
    }

    const left = 2 * nodeIdx + 1
    const right = 2 * nodeIdx + 2

    if (left >= N) {
      // No children, skip
      beginSiftChallenge(nodeIdx - 1)
      return
    }

    setChallengeIdx(nodeIdx)

    // Find largest child
    let largestChild = left
    if (right < N && arr[right] > arr[left]) largestChild = right
    setChallengeChild(largestChild)
  }

  const handleSiftChoice = useCallback((choice) => {
    if (phase !== 'challenge' || feedback || challengeIdx === null) return

    const left = 2 * challengeIdx + 1
    const right = 2 * challengeIdx + 2

    // Find if swap is needed
    let largestChild = left
    if (right < N && arr[right] > arr[left]) largestChild = right
    const needsSwap = arr[largestChild] > arr[challengeIdx]

    const isCorrect = (choice === 'swap') === needsSwap
    setTotal(t => t + 1)
    if (isCorrect) setCorrect(c => c + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    // Perform correct action
    if (needsSwap) {
      const newArr = [...arr];
      [newArr[challengeIdx], newArr[largestChild]] = [newArr[largestChild], newArr[challengeIdx]]
      setTimeout(() => {
        setArr(newArr)
        setFeedback(null)
        // Continue sifting down from the swapped position
        const newLeft = 2 * largestChild + 1
        if (newLeft < N) {
          let newLargest = newLeft
          const newRight = 2 * largestChild + 2
          if (newRight < N && newArr[newRight] > newArr[newLeft]) newLargest = newRight
          if (newArr[newLargest] > newArr[largestChild]) {
            setChallengeIdx(largestChild)
            setChallengeChild(newLargest)
            return
          }
        }
        // Move to next node
        beginSiftChallenge(challengeIdx - 1)
      }, 400)
    } else {
      setTimeout(() => {
        setFeedback(null)
        beginSiftChallenge(challengeIdx - 1)
      }, 400)
    }
  }, [phase, feedback, challengeIdx, arr, N]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'challenge' || feedback) return
      if (e.key === 's' || e.key === 'S') handleSiftChoice('swap')
      if (e.key === 'k' || e.key === 'K') handleSiftChoice('keep')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, feedback, handleSiftChoice])

  // Auto-complete: extraction phase
  useEffect(() => {
    if (phase !== 'auto' || !autoArr) return

    computeHeapSortSteps(autoArr)
    // Skip to extraction steps (heap is already built by challenge)
    // Actually re-run full algorithm on the array since it's already a heap
    // We'll just do extract steps
    const extractSteps = []
    const a = [...autoArr]
    const n = a.length

    function siftDown(start, end) {
      let root = start
      while (2 * root + 1 <= end) {
        let child = 2 * root + 1
        let swap = root

        extractSteps.push({ type: 'compare', i: swap, j: child })
        if (a[swap] < a[child]) swap = child

        if (child + 1 <= end) {
          extractSteps.push({ type: 'compare', i: swap, j: child + 1 })
          if (a[swap] < a[child + 1]) swap = child + 1
        }

        if (swap !== root) {
          extractSteps.push({ type: 'swap', i: root, j: swap });
          [a[root], a[swap]] = [a[swap], a[root]]
          root = swap
        } else {
          break
        }
      }
    }

    for (let end = n - 1; end > 0; end--) {
      extractSteps.push({ type: 'extract', i: 0, j: end });
      [a[0], a[end]] = [a[end], a[0]]
      extractSteps.push({ type: 'sorted', index: end })
      if (end > 1) siftDown(0, end - 1)
    }
    extractSteps.push({ type: 'sorted', index: 0 })

    let current = [...autoArr]
    let si = 0
    let sorted = new Set()

    function runStep() {
      if (si >= extractSteps.length) {
        setAutoHighlight(null)
        sorted = new Set(Array.from({ length: n }, (_, i) => i))
        setSortedIndices(new Set(sorted))
        setTimeout(finishScore, 500)
        return
      }

      const step = extractSteps[si++]

      if (step.type === 'compare') {
        setAutoHighlight({ type: 'compare', indices: [step.i, step.j] })
        autoRef.current = setTimeout(() => {
          setAutoHighlight(null)
          autoRef.current = setTimeout(runStep, 40)
        }, 100)
      } else if (step.type === 'swap') {
        ;[current[step.i], current[step.j]] = [current[step.j], current[step.i]]
        setAutoArr([...current])
        setAutoHighlight({ type: 'swap', indices: [step.i, step.j] })
        autoRef.current = setTimeout(() => {
          setAutoHighlight(null)
          autoRef.current = setTimeout(runStep, 40)
        }, 150)
      } else if (step.type === 'extract') {
        ;[current[step.i], current[step.j]] = [current[step.j], current[step.i]]
        setAutoArr([...current])
        setAutoHighlight({ type: 'extract', indices: [step.i, step.j] })
        autoRef.current = setTimeout(() => {
          setAutoHighlight(null)
          autoRef.current = setTimeout(runStep, 60)
        }, 200)
      } else if (step.type === 'sorted') {
        sorted = new Set([...sorted, step.index])
        setSortedIndices(new Set(sorted))
        autoRef.current = setTimeout(runStep, 60)
      }
    }

    setAutoPhaseLabel('Extracting maximums...')
    autoRef.current = setTimeout(runStep, 400)
    return () => clearTimeout(autoRef.current)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function finishScore() {
    const accuracy = total > 0 ? correct / total : 1
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1
    const xp = 65 + stars * 22
    setScore({ stars, xp, accuracy: Math.round(accuracy * 100) })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  function reset() {
    if (autoRef.current) clearTimeout(autoRef.current)
    const fresh = makeArray()
    setArr(fresh)
    setAutoArr(null)
    setAutoHighlight(null)
    setSortedIndices(new Set())
    setAutoPhaseLabel('')
    setChallengeIdx(null)
    setChallengeChild(null)
    setHeapBuilt(false)
    setCorrect(0)
    setTotal(0)
    setFeedback(null)
    setScore(null)
    setPhase('intro')
  }

  // Display
  const displayArr = phase === 'auto' ? (autoArr ?? arr) : arr
  const maxVal = Math.max(...displayArr)
  const treePositions = getTreePositions(displayArr.length)

  function barColor(idx) {
    if (phase === 'auto') {
      if (sortedIndices.has(idx)) return '#22c55e'
      if (autoHighlight?.type === 'swap' && autoHighlight.indices.includes(idx)) return '#e8645a'
      if (autoHighlight?.type === 'extract' && autoHighlight.indices.includes(idx)) return '#e8645a'
      if (autoHighlight?.type === 'compare' && autoHighlight.indices.includes(idx)) return '#d97706'
      return '#2d2d4e'
    }
    // Challenge phase
    if (idx === challengeIdx) return '#d97706'
    if (idx === challengeChild) return '#d97706'
    return '#2d2d4e'
  }

  function barGlow(idx) {
    if (phase === 'auto') {
      if (autoHighlight?.type === 'swap' && autoHighlight.indices.includes(idx)) return '0 0 14px rgba(232,100,90,0.7)'
      if (autoHighlight?.type === 'compare' && autoHighlight.indices.includes(idx)) return '0 0 14px rgba(217,119,6,0.7)'
    }
    if (phase === 'challenge' && (idx === challengeIdx || idx === challengeChild)) return '0 0 14px rgba(217,119,6,0.7)'
    return 'none'
  }

  function nodeColor(idx) {
    if (phase === 'auto') {
      if (sortedIndices.has(idx)) return '#22c55e'
      if (autoHighlight?.type === 'swap' && autoHighlight.indices.includes(idx)) return '#e8645a'
      if (autoHighlight?.type === 'extract' && autoHighlight.indices.includes(idx)) return '#e8645a'
      if (autoHighlight?.type === 'compare' && autoHighlight.indices.includes(idx)) return '#d97706'
      return '#2d2d4e'
    }
    if (idx === challengeIdx) return '#d97706'
    if (idx === challengeChild) return '#d97706'
    return '#2d2d4e'
  }

  // Score screen
  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Heap Sort"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct decisions', value: `${correct}/${total}` },
          { label: 'Accuracy', value: `${score.accuracy}%` },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : '/')}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : '\u2190 HOME'}
        onHome={() => navigate(backDest)}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col" style={{ maxWidth: '100vw' }}>

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
          HEAP SORT
        </div>
        {total > 0 ? (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">{correct}/{total}</div>
        ) : <div className="w-16" />}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col gap-2 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        <div className="flex gap-3 flex-wrap justify-center">
          {[
            { color: '#d97706', label: 'Comparing' },
            { color: '#e8645a', label: 'Swapping' },
            { color: '#22c55e', label: 'Sorted' },
            { color: '#2d2d4e', label: 'Heap' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              <span className="text-[#6b6b7a]" style={{ fontSize: 'clamp(0.55rem, 2vw, 0.7rem)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Tree visualization */}
        <div className="relative mx-auto" style={{ width: '280px', height: `${Math.min(140, (Math.floor(Math.log2(N)) + 1) * 40)}px` }}>
          {/* Edges */}
          <svg className="absolute inset-0" width="280" height="100%" style={{ overflow: 'visible' }}>
            {displayArr.map((_, idx) => {
              if (idx === 0) return null
              const parentIdx = Math.floor((idx - 1) / 2)
              const from = treePositions[parentIdx]
              const to = treePositions[idx]
              if (!from || !to) return null
              const isSorted = phase === 'auto' && sortedIndices.has(idx)
              return (
                <line
                  key={`edge-${idx}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isSorted ? '#22c55e33' : '#2a2a3a'}
                  strokeWidth="1.5"
                />
              )
            })}
          </svg>
          {/* Nodes */}
          {displayArr.map((val, idx) => {
            const pos = treePositions[idx]
            if (!pos) return null
            return (
              <motion.div
                key={idx}
                className="absolute flex items-center justify-center rounded-full"
                animate={{
                  backgroundColor: nodeColor(idx),
                  left: pos.x - 14,
                  top: pos.y - 14,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  width: '28px',
                  height: '28px',
                  fontSize: 'clamp(0.5rem, 2vw, 0.65rem)',
                  color: '#f0e6d3',
                  border: `2px solid ${nodeColor(idx) === '#2d2d4e' ? '#3a3a5a' : nodeColor(idx)}`,
                  zIndex: 1,
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>

        {/* Bar chart */}
        <div
          className="flex items-end justify-center gap-1 sm:gap-1.5"
          style={{ height: 'clamp(80px, 20vw, 140px)' }}
        >
          {displayArr.map((val, idx) => {
            const hPct = val / maxVal
            return (
              <div key={idx} className="flex flex-col items-center" style={{ flex: 1, maxWidth: '42px' }}>
                <span
                  className="text-center text-[#a0a0b0] mb-0.5 tabular-nums"
                  style={{ fontSize: 'clamp(0.4rem, 2vw, 0.6rem)' }}
                >
                  {val}
                </span>
                <motion.div
                  layout
                  className="w-full rounded-t-sm"
                  animate={{
                    height: `${hPct * 100}px`,
                    backgroundColor: barColor(idx),
                    boxShadow: barGlow(idx),
                  }}
                  transition={{ layout: { type: 'spring', stiffness: 500, damping: 30 }, duration: 0.15 }}
                  style={{ minHeight: '6px' }}
                />
              </div>
            )
          })}
        </div>

        {/* Phase UIs */}
        <AnimatePresence mode="wait">

          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="HEAP GUARDIAN"
                onDone={() => setPhase('challenge')}
              />
            </motion.div>
          )}

          {phase === 'challenge' && challengeIdx !== null && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">

              <div className="pixel-dialog pointer-events-none">
                <p className="text-sm sm:text-base">
                  Node <span className="text-[#d97706] font-bold">{arr[challengeIdx]}</span>
                  {' '}(index {challengeIdx}) vs child{' '}
                  <span className="text-[#d97706] font-bold">{arr[challengeChild]}</span>
                  {' '}&mdash; swap to maintain max-heap?
                </p>
                <AnimatePresence>
                  {feedback && (
                    <motion.p
                      key={feedback}
                      initial={{ opacity: 0, x: feedback === 'correct' ? -6 : 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-1 pixel-font text-[0.55rem] ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {feedback === 'correct' ? '\u2605 CORRECT!' : '\u2717 WRONG!'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSiftChoice('swap')}
                  className="pixel-btn pixel-btn-coral w-full"
                  disabled={!!feedback}
                >
                  \u2195 SWAP
                </button>
                <button
                  onClick={() => handleSiftChoice('keep')}
                  className="pixel-btn pixel-btn-secondary w-full"
                  disabled={!!feedback}
                >
                  \u2192 KEEP
                </button>
              </div>

              <p className="text-center text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>
                Press <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">S</kbd> to swap,{' '}
                <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">K</kbd> to keep
              </p>
            </motion.div>
          )}

          {phase === 'auto' && (
            <motion.div
              key="auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pixel-dialog pointer-events-none"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#d97706] animate-pulse-glow text-lg">\u2B50</span>
                <div>
                  <p className="pixel-font text-[0.6rem] text-[#d97706]">AUTO-EXTRACTING...</p>
                  <p className="text-[#6b6b7a] text-sm mt-1">{autoPhaseLabel || 'Watch the heap extract maximums one by one!'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
