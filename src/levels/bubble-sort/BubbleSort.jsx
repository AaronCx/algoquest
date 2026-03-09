import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'bubble-sort'

const DIALOG_LINES = [
  '* Welcome, traveler! I am the Sorting Sage.',
  '* Bubble Sort compares neighboring elements and swaps them when they\'re out of order.',
  '* Each pass "bubbles" the largest value to its correct position at the end.',
  '* You\'ll guide the first pass! Decide: SWAP or KEEP for each pair of adjacent bars.',
  '* Choose correctly and the algorithm will finish the rest automatically. Good luck!',
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
  // Guarantee it's not already sorted
  let arr
  do { arr = shuffle(Array.from({ length: n }, (_, i) => i + 1)) }
  while (arr.every((v, i, a) => i === 0 || a[i - 1] <= v))
  return arr
}

export default function BubbleSort() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')   // intro | challenge | auto | score
  const [arr, setArr] = useState(() => makeArray())
  const [cmpIdx, setCmpIdx] = useState(0)
  const [sortedFrom, setSortedFrom] = useState(null) // null = unknown
  const [highlight, setHighlight] = useState(null)  // [i,j] swapped/compared
  const [feedback, setFeedback] = useState(null)    // 'correct'|'wrong'
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [score, setScore] = useState(null)
  const [autoArr, setAutoArr] = useState(null)
  const [autoHighlight, setAutoHighlight] = useState(null)

  const autoRef = useRef(null)
  const N = arr.length

  // ── Challenge: player decides SWAP or KEEP ──────────────────────────
  const handleChoice = useCallback((choice) => {
    if (phase !== 'challenge') return
    const needsSwap = arr[cmpIdx] > arr[cmpIdx + 1]
    const wasCorrect = (choice === 'swap') === needsSwap

    setTotal(t => t + 1)
    if (wasCorrect) setCorrect(c => c + 1)
    setFeedback(wasCorrect ? 'correct' : 'wrong')

    const newArr = [...arr]
    if (choice === 'swap') {
      [newArr[cmpIdx], newArr[cmpIdx + 1]] = [newArr[cmpIdx + 1], newArr[cmpIdx]]
      setHighlight([cmpIdx, cmpIdx + 1])
    }
    setArr(newArr)

    setTimeout(() => {
      setHighlight(null)
      setFeedback(null)
      // After first complete pass, kick off auto-complete
      if (cmpIdx + 1 >= N - 1) {
        setSortedFrom(N - 1)
        setAutoArr([...newArr])
        setPhase('auto')
      } else {
        setCmpIdx(i => i + 1)
      }
    }, 350)
  }, [phase, arr, cmpIdx, N])

  // ── Keyboard shortcut: S = swap, K = keep ──────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'challenge') return
      if (e.key === 's' || e.key === 'S') handleChoice('swap')
      if (e.key === 'k' || e.key === 'K') handleChoice('keep')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, handleChoice])

  // ── Auto-complete animation ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'auto' || !autoArr) return

    // Build all remaining steps (passes after the first)
    const steps = []
    const a = [...autoArr]
    const sf = autoArr.length - 1 // first sorted element index

    for (let end = sf - 1; end >= 1; end--) {
      for (let j = 0; j < end; j++) {
        if (a[j] > a[j + 1]) {
          steps.push({ type: 'swap', i: j, j: j + 1 })
          ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        } else {
          steps.push({ type: 'compare', i: j, j: j + 1 })
        }
      }
      steps.push({ type: 'sorted', from: end })
    }

    if (steps.length === 0) {
      setTimeout(finishScore, 600)
      return
    }

    let current = [...autoArr]
    let si = 0
    let currentSortedFrom = sf

    function runStep() {
      if (si >= steps.length) {
        setAutoHighlight(null)
        setTimeout(finishScore, 500)
        return
      }
      const step = steps[si++]

      if (step.type === 'swap') {
        ;[current[step.i], current[step.j]] = [current[step.j], current[step.i]]
        setAutoArr([...current])
        setAutoHighlight({ type: 'swap', indices: [step.i, step.j] })
        setSortedFrom(null) // will update
        autoRef.current = setTimeout(() => {
          setAutoHighlight(null)
          autoRef.current = setTimeout(runStep, 60)
        }, 180)
      } else if (step.type === 'compare') {
        setAutoHighlight({ type: 'compare', indices: [step.i, step.j] })
        autoRef.current = setTimeout(() => {
          setAutoHighlight(null)
          autoRef.current = setTimeout(runStep, 40)
        }, 130)
      } else if (step.type === 'sorted') {
        currentSortedFrom = step.from
        setSortedFrom(currentSortedFrom)
        autoRef.current = setTimeout(runStep, 60)
      }
    }

    autoRef.current = setTimeout(runStep, 400)
    return () => clearTimeout(autoRef.current)
  }, [phase, autoArr])

  function finishScore() {
    const accuracy = total > 0 ? correct / total : 1
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1
    const xp = 50 + stars * 17
    setScore({ stars, xp, accuracy: Math.round(accuracy * 100) })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  function reset() {
    if (autoRef.current) clearTimeout(autoRef.current)
    const fresh = makeArray()
    setArr(fresh)
    setAutoArr(null)
    setCmpIdx(0)
    setSortedFrom(null)
    setHighlight(null)
    setFeedback(null)
    setCorrect(0)
    setTotal(0)
    setScore(null)
    setAutoHighlight(null)
    setPhase('intro')
  }

  // ── Decide display array ────────────────────────────────────────────
  const displayArr = phase === 'auto' ? (autoArr ?? arr) : arr
  const maxVal = Math.max(...displayArr)

  // Which indices are highlighted?
  const swapIdxs = highlight ?? (autoHighlight?.type === 'swap' ? autoHighlight.indices : null)
  const cmpIdxs = autoHighlight?.type === 'compare' ? autoHighlight.indices : null
  // Sorted indices (from sortedFrom to end)
  const sortedStart = sortedFrom ?? (phase === 'challenge' ? N : N)

  function barColor(idx) {
    if (swapIdxs && swapIdxs.includes(idx)) return '#e8645a'
    if (cmpIdxs && cmpIdxs.includes(idx)) return '#d97706'
    if (phase === 'challenge' && (idx === cmpIdx || idx === cmpIdx + 1)) return '#d97706'
    if (idx >= sortedStart) return '#22c55e'
    return '#2d2d4e'
  }

  function barGlow(idx) {
    if (swapIdxs && swapIdxs.includes(idx)) return '0 0 14px rgba(232,100,90,0.7)'
    if (cmpIdxs && cmpIdxs.includes(idx)) return '0 0 14px rgba(217,119,6,0.7)'
    if (phase === 'challenge' && (idx === cmpIdx || idx === cmpIdx + 1)) return '0 0 14px rgba(217,119,6,0.7)'
    return 'none'
  }

  // ── Score screen ────────────────────────────────────────────────────
  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Bubble Sort"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct decisions', value: `${correct}/${total}` },
          { label: 'Accuracy', value: `${score.accuracy}%` },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : '/level/binary-search')}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : 'NEXT LEVEL \u2192'}
        onHome={() => navigate(backDest)}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col" style={{ maxWidth: '100vw' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a2a]">
        <button
          onClick={() => navigate(backDest)}
          className="pixel-btn pixel-btn-secondary"
          style={{ fontSize: '0.5rem', padding: '0.45rem 0.7rem', minHeight: '36px' }}
        >
          {state.returnToRPG ? '← ADVENTURE' : '← HOME'}
        </button>
        <div className="pixel-font text-center" style={{ fontSize: 'clamp(0.4rem, 2vw, 0.6rem)', color: '#d97706' }}>
          LV.1 — BUBBLE SORT
        </div>
        {total > 0 && (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">
            {correct}/{total}
          </div>
        )}
        {total === 0 && <div className="w-16" />}
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        <div className="flex gap-3 flex-wrap justify-center">
          {[
            { color: '#d97706', label: 'Comparing' },
            { color: '#e8645a', label: 'Swapping' },
            { color: '#22c55e', label: 'Sorted' },
            { color: '#2d2d4e', label: 'Unsorted' },
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
                    height: `${hPct * (phase === 'auto' ? 160 : 140)}px`,
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

        {/* Phase UIs */}
        <AnimatePresence mode="wait">

          {/* Dialog intro */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="SORTING SAGE"
                onDone={() => setPhase('challenge')}
              />
            </motion.div>
          )}

          {/* Challenge */}
          {phase === 'challenge' && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">

              {/* Info box */}
              <div className="pixel-dialog pointer-events-none">
                <p className="text-sm sm:text-base">
                  Comparing position{' '}
                  <span className="text-[#d97706] font-bold">{cmpIdx + 1}</span> and{' '}
                  <span className="text-[#d97706] font-bold">{cmpIdx + 2}</span>:{' '}
                  <span className="text-[#fbbf24] font-bold">{arr[cmpIdx]}</span>
                  {' '}vs{' '}
                  <span className="text-[#fbbf24] font-bold">{arr[cmpIdx + 1]}</span>
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
                      {feedback === 'correct' ? '★ CORRECT!' : '✗ WRONG!'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChoice('swap')}
                  className="pixel-btn pixel-btn-coral w-full"
                >
                  ↕ SWAP
                </button>
                <button
                  onClick={() => handleChoice('keep')}
                  className="pixel-btn pixel-btn-secondary w-full"
                >
                  → KEEP
                </button>
              </div>

              {/* Hint */}
              <p className="text-center text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>
                Press <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">S</kbd> to swap,{' '}
                <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">K</kbd> to keep
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 flex-wrap">
                {Array.from({ length: N - 1 }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      background: i < cmpIdx ? '#22c55e' : i === cmpIdx ? '#d97706' : '#2a2a3a',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Auto-complete */}
          {phase === 'auto' && (
            <motion.div
              key="auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pixel-dialog pointer-events-none"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#d97706] animate-pulse-glow text-lg">⚙️</span>
                <div>
                  <p className="pixel-font text-[0.6rem] text-[#d97706]">AUTO-COMPLETING...</p>
                  <p className="text-[#6b6b7a] text-sm mt-1">Watch the algorithm bubble up the remaining elements!</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
