import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'selection-sort'

const DIALOG_LINES = [
  '* The Sorting Yard is in chaos! I am Marshal Thread.',
  '* Selection Sort works by finding the MINIMUM element in the unsorted portion.',
  '* Each round, click the smallest bar from the remaining unsorted section.',
  "* It will be swapped into its correct position at the front.",
  '* Find all minimums correctly for the best score!',
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

export default function SelectionSort() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')
  const [arr, setArr] = useState(() => makeArray())
  const [sortedCount, setSortedCount] = useState(0) // how many are in final position
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [score, setScore] = useState(null)

  const N = arr.length

  const handleBarClick = useCallback((idx) => {
    if (phase !== 'challenge' || feedback || idx < sortedCount) return

    setTotal(t => t + 1)
    setSelectedIdx(idx)

    // Find actual minimum in unsorted portion
    let minIdx = sortedCount
    for (let i = sortedCount + 1; i < N; i++) {
      if (arr[i] < arr[minIdx]) minIdx = i
    }

    const isCorrect = idx === minIdx
    if (isCorrect) setCorrect(c => c + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    setTimeout(() => {
      // Always swap the actual minimum into position
      const newArr = [...arr];
      [newArr[sortedCount], newArr[minIdx]] = [newArr[minIdx], newArr[sortedCount]]
      setArr(newArr)
      setSelectedIdx(null)
      setFeedback(null)

      const newSorted = sortedCount + 1
      setSortedCount(newSorted)

      if (newSorted >= N - 1) {
        finishScore(correct + (isCorrect ? 1 : 0), total + 1)
      }
    }, 500)
  }, [phase, feedback, sortedCount, arr, N, correct, total])

  function finishScore(c, t) {
    const accuracy = t > 0 ? c / t : 1
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1
    const xp = 40 + stars * 20
    setScore({ stars, xp, accuracy: Math.round(accuracy * 100), correct: c, total: t })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  function reset() {
    const fresh = makeArray()
    setArr(fresh)
    setSortedCount(0)
    setCorrect(0)
    setTotal(0)
    setFeedback(null)
    setSelectedIdx(null)
    setScore(null)
    setPhase('intro')
  }

  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Selection Sort"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct picks', value: `${score.correct}/${score.total}` },
          { label: 'Accuracy', value: `${score.accuracy}%` },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : '/')}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : '\u2190 HOME'}
        onHome={() => navigate(backDest)}
      />
    )
  }

  const maxVal = Math.max(...arr)

  function barColor(idx) {
    if (idx < sortedCount) return '#22c55e'
    if (idx === selectedIdx && feedback === 'correct') return '#22c55e'
    if (idx === selectedIdx && feedback === 'wrong') return '#e8645a'
    return '#2d2d4e'
  }

  function barGlow(idx) {
    if (idx === selectedIdx && feedback === 'correct') return '0 0 14px rgba(34,197,94,0.7)'
    if (idx === selectedIdx && feedback === 'wrong') return '0 0 14px rgba(232,100,90,0.7)'
    return 'none'
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
          SELECTION SORT
        </div>
        {total > 0 ? (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">{correct}/{total}</div>
        ) : <div className="w-16" />}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        <div className="flex gap-3 flex-wrap justify-center">
          {[
            { color: '#22c55e', label: 'Sorted' },
            { color: '#d97706', label: 'Unsorted' },
            { color: '#e8645a', label: 'Wrong pick' },
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
          {arr.map((val, idx) => {
            const hPct = val / maxVal
            const clickable = phase === 'challenge' && idx >= sortedCount && !feedback
            return (
              <div
                key={idx}
                className="flex flex-col items-center"
                style={{ flex: 1, maxWidth: '52px', cursor: clickable ? 'pointer' : 'default' }}
                onClick={() => clickable && handleBarClick(idx)}
              >
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

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="MARSHAL THREAD"
                onDone={() => setPhase('challenge')}
              />
            </motion.div>
          )}

          {phase === 'challenge' && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pixel-dialog">
                <p className="text-sm">
                  Round {sortedCount + 1}/{N - 1}: Click the{' '}
                  <span className="text-[#d97706] font-bold">smallest bar</span> from the unsorted section.
                </p>
                <AnimatePresence>
                  {feedback && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`mt-1 pixel-font text-[0.55rem] ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {feedback === 'correct' ? '\u2605 CORRECT! Minimum found!' : '\u2717 Not the minimum! The correct one has been placed.'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 flex-wrap mt-3">
                {Array.from({ length: N - 1 }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: i < sortedCount ? '#22c55e' : i === sortedCount ? '#d97706' : '#2a2a3a' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
