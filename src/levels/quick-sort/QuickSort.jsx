import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'quick-sort'

const DIALOG_LINES = [
  '* Greetings, seeker! I am the Partition Sage.',
  '* Quick Sort picks a PIVOT element, then partitions the array around it.',
  '* Elements smaller than the pivot go LEFT, larger ones go RIGHT.',
  '* After partitioning, the pivot lands in its final sorted position.',
  '* Click each highlighted element to place it in the correct partition. Good luck!',
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeArray(n = 8) {
  let arr
  do { arr = shuffle(Array.from({ length: n }, (_, i) => i + 1)) }
  while (arr.every((v, i, a) => i === 0 || a[i - 1] <= v))
  return arr
}

// Pre-compute all quick sort steps for auto-animate
function computeQuickSortSteps(inputArr) {
  const steps = []
  const arr = [...inputArr]

  function partition(lo, hi) {
    const pivotVal = arr[hi]
    steps.push({ type: 'pivot', index: hi, lo, hi })
    let i = lo
    for (let j = lo; j < hi; j++) {
      steps.push({ type: 'compare', index: j, pivotIndex: hi, lo, hi })
      if (arr[j] <= pivotVal) {
        if (i !== j) {
          steps.push({ type: 'swap', i, j, lo, hi, pivotIndex: hi })
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        i++
      }
    }
    if (i !== hi) {
      steps.push({ type: 'swap', i, j: hi, lo, hi, pivotIndex: hi })
      ;[arr[i], arr[hi]] = [arr[hi], arr[i]]
    }
    steps.push({ type: 'placed', index: i, lo, hi })
    return i
  }

  function quickSort(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) steps.push({ type: 'placed', index: lo, lo, hi })
      return
    }
    steps.push({ type: 'subarray', lo, hi })
    const p = partition(lo, hi)
    quickSort(lo, p - 1)
    quickSort(p + 1, hi)
  }

  quickSort(0, arr.length - 1)
  return { steps, sortedArr: arr }
}

export default function QuickSort() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')   // intro | challenge | auto | score
  const [arr, setArr] = useState(() => makeArray())
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // Challenge state: user partitions the first call
  const [pivotIndex, setPivotIndex] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)     // scanning index j
  const [partitionI, setPartitionI] = useState(0)      // partition boundary i
  const [placed, setPlaced] = useState(new Set())       // indices in final position
  const [subRange, setSubRange] = useState(null)        // {lo, hi} current subarray

  // Auto-animate state
  const [autoArr, setAutoArr] = useState(null)
  const [autoHighlight, setAutoHighlight] = useState(null)
  const [autoPlaced, setAutoPlaced] = useState(new Set())
  const [autoSubRange, setAutoSubRange] = useState(null)
  const [autoPivotIdx, setAutoPivotIdx] = useState(null)
  const autoRef = useRef(null)

  const N = arr.length

  // Start challenge: use last element as pivot for the full array
  useEffect(() => {
    if (phase === 'challenge') {
      setPivotIndex(N - 1)
      setCurrentIdx(0)
      setPartitionI(0)
      setSubRange({ lo: 0, hi: N - 1 })
    }
  }, [phase, N])

  // User decides: should this element go left (<=pivot) or right (>pivot)?
  const handleChoice = useCallback((choice) => {
    if (phase !== 'challenge' || feedback || pivotIndex === null) return
    if (currentIdx >= pivotIndex) return

    const pivotVal = arr[pivotIndex]
    const val = arr[currentIdx]
    const shouldGoLeft = val <= pivotVal
    const isCorrect = (choice === 'left') === shouldGoLeft

    setTotal(t => t + 1)
    if (isCorrect) setCorrect(c => c + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    // Always perform the correct action
    const newArr = [...arr]
    if (shouldGoLeft && partitionI !== currentIdx) {
      [newArr[partitionI], newArr[currentIdx]] = [newArr[currentIdx], newArr[partitionI]]
      // If pivot was at partitionI, update pivot index
      setArr(newArr)
    }
    const newI = shouldGoLeft ? partitionI + 1 : partitionI

    setTimeout(() => {
      setFeedback(null)
      setArr(newArr)
      setPartitionI(newI)

      const nextIdx = currentIdx + 1
      if (nextIdx >= pivotIndex) {
        // Partition complete: place pivot
        const finalArr = [...newArr]
        if (newI !== pivotIndex) {
          [finalArr[newI], finalArr[pivotIndex]] = [finalArr[pivotIndex], finalArr[newI]]
        }
        setArr(finalArr)
        setPlaced(prev => new Set([...prev, newI]))

        // Transition to auto-animate remaining
        setTimeout(() => {
          setAutoArr([...finalArr])
          setAutoPlaced(new Set([...placed, newI]))
          setPhase('auto')
        }, 400)
      } else {
        setCurrentIdx(nextIdx)
      }
    }, 400)
  }, [phase, feedback, arr, currentIdx, pivotIndex, partitionI, placed])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'challenge' || feedback) return
      if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowLeft') handleChoice('left')
      if (e.key === 'r' || e.key === 'R' || e.key === 'ArrowRight') handleChoice('right')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, feedback, handleChoice])

  // Auto-complete: run remaining quick sort steps
  useEffect(() => {
    if (phase !== 'auto' || !autoArr) return

    const { steps } = computeQuickSortSteps(autoArr)
    if (steps.length === 0) {
      setTimeout(finishScore, 400)
      return
    }

    let current = [...autoArr]
    let si = 0
    let placedSet = new Set(autoPlaced)

    function runStep() {
      if (si >= steps.length) {
        setAutoHighlight(null)
        setAutoSubRange(null)
        setAutoPivotIdx(null)
        // Mark all as placed
        const allPlaced = new Set(Array.from({ length: current.length }, (_, i) => i))
        setAutoPlaced(allPlaced)
        setTimeout(finishScore, 500)
        return
      }

      const step = steps[si++]

      if (step.type === 'subarray') {
        setAutoSubRange({ lo: step.lo, hi: step.hi })
        autoRef.current = setTimeout(runStep, 100)
      } else if (step.type === 'pivot') {
        setAutoPivotIdx(step.index)
        setAutoHighlight({ type: 'pivot', index: step.index })
        autoRef.current = setTimeout(() => {
          setAutoHighlight(null)
          autoRef.current = setTimeout(runStep, 60)
        }, 200)
      } else if (step.type === 'compare') {
        setAutoHighlight({ type: 'compare', index: step.index })
        setAutoPivotIdx(step.pivotIndex)
        autoRef.current = setTimeout(() => {
          setAutoHighlight(null)
          autoRef.current = setTimeout(runStep, 40)
        }, 120)
      } else if (step.type === 'swap') {
        ;[current[step.i], current[step.j]] = [current[step.j], current[step.i]]
        setAutoArr([...current])
        setAutoHighlight({ type: 'swap', indices: [step.i, step.j] })
        autoRef.current = setTimeout(() => {
          setAutoHighlight(null)
          autoRef.current = setTimeout(runStep, 40)
        }, 160)
      } else if (step.type === 'placed') {
        placedSet = new Set([...placedSet, step.index])
        setAutoPlaced(new Set(placedSet))
        setAutoHighlight(null)
        setAutoPivotIdx(null)
        autoRef.current = setTimeout(runStep, 80)
      }
    }

    autoRef.current = setTimeout(runStep, 400)
    return () => clearTimeout(autoRef.current)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function finishScore() {
    const accuracy = total > 0 ? correct / total : 1
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1
    const xp = 60 + stars * 20
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
    setAutoPlaced(new Set())
    setAutoSubRange(null)
    setAutoPivotIdx(null)
    setPivotIndex(null)
    setCurrentIdx(0)
    setPartitionI(0)
    setPlaced(new Set())
    setSubRange(null)
    setCorrect(0)
    setTotal(0)
    setFeedback(null)
    setScore(null)
    setPhase('intro')
  }

  // Display array
  const displayArr = phase === 'auto' ? (autoArr ?? arr) : arr
  const maxVal = Math.max(...displayArr)
  const displayPlaced = phase === 'auto' ? autoPlaced : placed

  function barColor(idx) {
    // Auto phase highlights
    if (phase === 'auto') {
      if (autoHighlight?.type === 'swap' && autoHighlight.indices.includes(idx)) return '#e8645a'
      if (autoHighlight?.type === 'compare' && autoHighlight.index === idx) return '#d97706'
      if (autoPivotIdx === idx) return '#8b5cf6'
      if (autoPlaced.has(idx)) return '#22c55e'
      if (autoSubRange && idx >= autoSubRange.lo && idx <= autoSubRange.hi) return '#3b3b5e'
      return '#2d2d4e'
    }
    // Challenge phase
    if (displayPlaced.has(idx)) return '#22c55e'
    if (idx === pivotIndex) return '#8b5cf6'
    if (phase === 'challenge' && idx === currentIdx && currentIdx < pivotIndex) return '#d97706'
    if (phase === 'challenge' && subRange && idx < partitionI) return '#3b82f6'
    return '#2d2d4e'
  }

  function barGlow(idx) {
    if (phase === 'auto') {
      if (autoHighlight?.type === 'swap' && autoHighlight.indices.includes(idx)) return '0 0 14px rgba(232,100,90,0.7)'
      if (autoHighlight?.type === 'compare' && autoHighlight.index === idx) return '0 0 14px rgba(217,119,6,0.7)'
      if (autoPivotIdx === idx) return '0 0 14px rgba(139,92,246,0.7)'
    }
    if (idx === pivotIndex && phase === 'challenge') return '0 0 14px rgba(139,92,246,0.7)'
    if (phase === 'challenge' && idx === currentIdx && currentIdx < pivotIndex) return '0 0 14px rgba(217,119,6,0.7)'
    return 'none'
  }

  // Score screen
  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Quick Sort"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct partitions', value: `${correct}/${total}` },
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
          QUICK SORT
        </div>
        {total > 0 ? (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">{correct}/{total}</div>
        ) : <div className="w-16" />}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        <div className="flex gap-3 flex-wrap justify-center">
          {[
            { color: '#8b5cf6', label: 'Pivot' },
            { color: '#d97706', label: 'Comparing' },
            { color: '#e8645a', label: 'Swapping' },
            { color: '#3b82f6', label: '\u2264 Pivot' },
            { color: '#22c55e', label: 'Sorted' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              <span className="text-[#6b6b7a]" style={{ fontSize: 'clamp(0.55rem, 2vw, 0.7rem)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div
          className="flex items-end justify-center gap-1 sm:gap-1.5"
          style={{ height: 'clamp(120px, 30vw, 200px)' }}
        >
          {displayArr.map((val, idx) => {
            const hPct = val / maxVal
            return (
              <div key={idx} className="flex flex-col items-center" style={{ flex: 1, maxWidth: '52px' }}>
                <span
                  className="text-center text-[#a0a0b0] mb-0.5 tabular-nums"
                  style={{ fontSize: 'clamp(0.45rem, 2.5vw, 0.7rem)' }}
                >
                  {val}
                </span>
                <motion.div
                  layout
                  className="w-full rounded-t-sm"
                  animate={{
                    height: `${hPct * 160}px`,
                    backgroundColor: barColor(idx),
                    boxShadow: barGlow(idx),
                  }}
                  transition={{ layout: { type: 'spring', stiffness: 500, damping: 30 }, duration: 0.15 }}
                  style={{ minHeight: '8px' }}
                />
              </div>
            )
          })}
        </div>

        {/* Partition boundary indicator */}
        {phase === 'challenge' && subRange && (
          <div className="flex justify-center">
            <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">
              Partition boundary at index {partitionI} | Pivot: {arr[pivotIndex]}
            </div>
          </div>
        )}

        {/* Phase UIs */}
        <AnimatePresence mode="wait">

          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="PARTITION SAGE"
                onDone={() => setPhase('challenge')}
              />
            </motion.div>
          )}

          {phase === 'challenge' && pivotIndex !== null && currentIdx < pivotIndex && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">

              <div className="pixel-dialog pointer-events-none">
                <p className="text-sm sm:text-base">
                  Element{' '}
                  <span className="text-[#d97706] font-bold">{arr[currentIdx]}</span>
                  {' '}vs pivot{' '}
                  <span className="text-[#8b5cf6] font-bold">{arr[pivotIndex]}</span>
                  {' '}&mdash; goes LEFT or RIGHT?
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
                  onClick={() => handleChoice('left')}
                  className="pixel-btn pixel-btn-secondary w-full"
                  disabled={!!feedback}
                >
                  \u2190 LEFT (\u2264 pivot)
                </button>
                <button
                  onClick={() => handleChoice('right')}
                  className="pixel-btn pixel-btn-coral w-full"
                  disabled={!!feedback}
                >
                  RIGHT (&gt; pivot) \u2192
                </button>
              </div>

              <p className="text-center text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>
                Press <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">L</kbd> for left,{' '}
                <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">R</kbd> for right
              </p>

              {/* Progress */}
              <div className="flex justify-center gap-1.5 flex-wrap">
                {Array.from({ length: pivotIndex }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      background: i < currentIdx ? '#22c55e' : i === currentIdx ? '#d97706' : '#2a2a3a',
                    }}
                  />
                ))}
              </div>
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
                <span className="text-[#8b5cf6] animate-pulse-glow text-lg">\u26A1</span>
                <div>
                  <p className="pixel-font text-[0.6rem] text-[#8b5cf6]">AUTO-PARTITIONING...</p>
                  <p className="text-[#6b6b7a] text-sm mt-1">Watch quick sort recursively partition the remaining subarrays!</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
