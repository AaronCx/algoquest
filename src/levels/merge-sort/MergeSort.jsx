import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'merge-sort'

const DIALOG_LINES = [
  '* Ah, a new apprentice! I am the Merge Mage.',
  '* Merge Sort works by DIVIDING the array in half, again and again.',
  '* Once we have tiny pieces, we MERGE them back in sorted order.',
  '* During the merge step, pick which element comes next from the two halves.',
  '* Choose wisely to earn the best score!',
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

// Pre-compute all merge sort steps for visualization (used for future auto-mode)
function computeMergeSortSteps(inputArr) { // eslint-disable-line no-unused-vars
  const steps = []
  const arr = [...inputArr]

  function mergeSort(lo, hi) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    steps.push({ type: 'divide', lo, mid, hi })
    mergeSort(lo, mid)
    mergeSort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  function merge(lo, mid, hi) {
    steps.push({ type: 'merge-start', lo, mid, hi })
    const left = arr.slice(lo, mid + 1)
    const right = arr.slice(mid + 1, hi + 1)
    let i = 0, j = 0, k = lo

    while (i < left.length && j < right.length) {
      steps.push({ type: 'compare', leftVal: left[i], rightVal: right[j], leftIdx: lo + i, rightIdx: mid + 1 + j, k, lo, hi })
      if (left[i] <= right[j]) {
        arr[k] = left[i]
        steps.push({ type: 'place', k, val: left[i], from: 'left', lo, hi })
        i++
      } else {
        arr[k] = right[j]
        steps.push({ type: 'place', k, val: right[j], from: 'right', lo, hi })
        j++
      }
      k++
    }
    while (i < left.length) {
      arr[k] = left[i]
      steps.push({ type: 'place', k, val: left[i], from: 'left', lo, hi })
      i++; k++
    }
    while (j < right.length) {
      arr[k] = right[j]
      steps.push({ type: 'place', k, val: right[j], from: 'right', lo, hi })
      j++; k++
    }
    steps.push({ type: 'merge-done', lo, hi })
  }

  mergeSort(0, arr.length - 1)
  return { steps, sortedArr: arr }
}

export default function MergeSort() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')   // intro | challenge | auto | score
  const [arr, setArr] = useState(() => makeArray())
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // Challenge: user merges the first pair of halves
  const [mergeState, setMergeState] = useState(null) // {left, right, merged, leftI, rightI, lo, hi}
  const [challengeDone, setChallengeDone] = useState(false)

  // Auto-animate (reserved for future auto-mode expansion)
  const [autoArr, setAutoArr] = useState(null) // eslint-disable-line no-unused-vars
  const [, setAutoHighlight] = useState(null)
  const [, setAutoMergeRange] = useState(null)
  const [, setSortedRanges] = useState([])
  const autoRef = useRef(null)

  const N = arr.length

  // Start challenge: split entire array and let user merge the first two halves
  useEffect(() => {
    if (phase === 'challenge' && !mergeState) {
      const mid = Math.floor((N - 1) / 2)
      const left = arr.slice(0, mid + 1).sort((a, b) => a - b)
      const right = arr.slice(mid + 1).sort((a, b) => a - b)
      setMergeState({
        left,
        right,
        merged: [],
        leftI: 0,
        rightI: 0,
        lo: 0,
        hi: N - 1,
        mid,
      })
    }
  }, [phase, mergeState, arr, N])

  const handleMergeChoice = useCallback((choice) => {
    if (phase !== 'challenge' || feedback || !mergeState) return
    const { left, right, merged, leftI, rightI } = mergeState

    const leftDone = leftI >= left.length
    const rightDone = rightI >= right.length

    if (leftDone && rightDone) return

    let correctChoice
    if (leftDone) correctChoice = 'right'
    else if (rightDone) correctChoice = 'left'
    else correctChoice = left[leftI] <= right[rightI] ? 'left' : 'right'

    const isCorrect = choice === correctChoice
    setTotal(t => t + 1)
    if (isCorrect) setCorrect(c => c + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    // Always do the correct action
    const newMerged = [...merged]
    let newLeftI = leftI
    let newRightI = rightI

    if (correctChoice === 'left') {
      newMerged.push(left[leftI])
      newLeftI++
    } else {
      newMerged.push(right[rightI])
      newRightI++
    }

    setTimeout(() => {
      setFeedback(null)
      const newState = { ...mergeState, merged: newMerged, leftI: newLeftI, rightI: newRightI }
      setMergeState(newState)

      // Check if merge is complete
      if (newLeftI >= left.length && newRightI >= right.length) {
        // Build the merged array as the new base
        const finalArr = [...newMerged]
        setArr(finalArr)
        setChallengeDone(true)

        setTimeout(() => {
          setAutoArr([...finalArr])
          setPhase('score')
          finishScore(correct + (isCorrect ? 1 : 0), total + 1)
        }, 600)
      }
    }, 350)
  }, [phase, feedback, mergeState, correct, total]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'challenge' || feedback) return
      if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowLeft') handleMergeChoice('left')
      if (e.key === 'r' || e.key === 'R' || e.key === 'ArrowRight') handleMergeChoice('right')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, feedback, handleMergeChoice])

  function finishScore(c, t) {
    const accuracy = t > 0 ? c / t : 1
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1
    const xp = 55 + stars * 18
    setScore({ stars, xp, accuracy: Math.round(accuracy * 100), correct: c, total: t })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  function reset() {
    if (autoRef.current) clearTimeout(autoRef.current)
    const fresh = makeArray()
    setArr(fresh)
    setAutoArr(null)
    setAutoHighlight(null)
    setAutoMergeRange(null)
    setSortedRanges([])
    setMergeState(null)
    setChallengeDone(false)
    setCorrect(0)
    setTotal(0)
    setFeedback(null)
    setScore(null)
    setPhase('intro')
  }

  // Display

  // Build display array for challenge phase
  let displayArr = arr
  if (phase === 'challenge' && mergeState && !challengeDone) {
    const { left, right, merged, leftI, rightI } = mergeState
    // Show: merged items + remaining left items + remaining right items
    displayArr = [...merged, ...left.slice(leftI), ...right.slice(rightI)]
  }

  // Score screen
  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Merge Sort"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct merges', value: `${score.correct}/${score.total}` },
          { label: 'Accuracy', value: `${score.accuracy}%` },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : '/')}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : '\u2190 HOME'}
        onHome={() => navigate(backDest)}
      />
    )
  }

  const displayMax = Math.max(...displayArr)

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
          MERGE SORT
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
            { color: '#3b82f6', label: 'Left half' },
            { color: '#8b5cf6', label: 'Right half' },
            { color: '#d97706', label: 'Comparing' },
            { color: '#22c55e', label: 'Merged' },
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
            const hPct = val / displayMax
            let bgColor = '#2d2d4e'
            let glow = 'none'

            if (phase === 'challenge' && mergeState && !challengeDone) {
              const { merged, left, leftI } = mergeState
              const mergedLen = merged.length
              const remainLeft = left.length - leftI

              if (idx < mergedLen) {
                bgColor = '#22c55e'
              } else if (idx === mergedLen) {
                // Next element to consider
                bgColor = '#d97706'
                glow = '0 0 14px rgba(217,119,6,0.7)'
              } else if (idx < mergedLen + remainLeft) {
                bgColor = '#3b82f6'
              } else {
                bgColor = '#8b5cf6'
              }
            }

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
                    backgroundColor: bgColor,
                    boxShadow: glow,
                  }}
                  transition={{ layout: { type: 'spring', stiffness: 500, damping: 30 }, duration: 0.15 }}
                  style={{ minHeight: '8px' }}
                />
              </div>
            )
          })}
        </div>

        {/* Divider showing left | right split */}
        {phase === 'challenge' && mergeState && !challengeDone && (
          <div className="flex justify-center gap-2">
            <span className="pixel-font text-[0.45rem] text-[#3b82f6]">LEFT</span>
            <span className="pixel-font text-[0.45rem] text-[#6b6b7a]">|</span>
            <span className="pixel-font text-[0.45rem] text-[#8b5cf6]">RIGHT</span>
          </div>
        )}

        {/* Phase UIs */}
        <AnimatePresence mode="wait">

          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="MERGE MAGE"
                onDone={() => setPhase('challenge')}
              />
            </motion.div>
          )}

          {phase === 'challenge' && mergeState && !challengeDone && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">

              <div className="pixel-dialog pointer-events-none">
                <p className="text-sm sm:text-base">
                  {mergeState.leftI < mergeState.left.length && mergeState.rightI < mergeState.right.length ? (
                    <>
                      Merge step: <span className="text-[#3b82f6] font-bold">{mergeState.left[mergeState.leftI]}</span>
                      {' '}(left) vs{' '}
                      <span className="text-[#8b5cf6] font-bold">{mergeState.right[mergeState.rightI]}</span>
                      {' '}(right) &mdash; which is smaller?
                    </>
                  ) : mergeState.leftI < mergeState.left.length ? (
                    <>Only left remains: <span className="text-[#3b82f6] font-bold">{mergeState.left[mergeState.leftI]}</span> &mdash; take from left!</>
                  ) : (
                    <>Only right remains: <span className="text-[#8b5cf6] font-bold">{mergeState.right[mergeState.rightI]}</span> &mdash; take from right!</>
                  )}
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
                  onClick={() => handleMergeChoice('left')}
                  className="pixel-btn pixel-btn-secondary w-full"
                  disabled={!!feedback || mergeState.leftI >= mergeState.left.length}
                  style={{ borderColor: '#3b82f6', color: mergeState.leftI < mergeState.left.length ? '#3b82f6' : '#6b6b7a' }}
                >
                  \u2190 LEFT {mergeState.leftI < mergeState.left.length ? `(${mergeState.left[mergeState.leftI]})` : '(done)'}
                </button>
                <button
                  onClick={() => handleMergeChoice('right')}
                  className="pixel-btn pixel-btn-secondary w-full"
                  disabled={!!feedback || mergeState.rightI >= mergeState.right.length}
                  style={{ borderColor: '#8b5cf6', color: mergeState.rightI < mergeState.right.length ? '#8b5cf6' : '#6b6b7a' }}
                >
                  RIGHT {mergeState.rightI < mergeState.right.length ? `(${mergeState.right[mergeState.rightI]})` : '(done)'} \u2192
                </button>
              </div>

              <p className="text-center text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>
                Press <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">L</kbd> for left,{' '}
                <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">R</kbd> for right
              </p>

              {/* Progress */}
              <div className="flex justify-center gap-1.5 flex-wrap">
                {Array.from({ length: mergeState.left.length + mergeState.right.length }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: i < mergeState.merged.length ? '#22c55e' : i === mergeState.merged.length ? '#d97706' : '#2a2a3a',
                    }}
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
