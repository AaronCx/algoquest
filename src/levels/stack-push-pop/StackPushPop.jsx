import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'stack-push-pop'

const DIALOG_LINES = [
  '* I am Capt. Stack, guardian of the Stack Gate.',
  '* A stack is LIFO — Last In, First Out.',
  '* PUSH adds to the top. POP removes from the top.',
  "* I'll show you operations one at a time. Predict what's on top of the stack!",
  '* Choose the correct top value after each operation. Good luck!',
]

function generateOps() {
  const ops = []
  const values = [3, 7, 1, 5, 9, 2, 8, 4]
  const stack = []
  let vi = 0

  // Generate 8-10 operations with a mix of push/pop
  const count = 8 + Math.floor(Math.random() * 3)
  for (let i = 0; i < count; i++) {
    if (stack.length === 0 || (vi < values.length && Math.random() > 0.35)) {
      const val = values[vi++ % values.length]
      stack.push(val)
      ops.push({ type: 'push', value: val, topAfter: val, stackAfter: [...stack] })
    } else {
      stack.pop()
      const top = stack.length > 0 ? stack[stack.length - 1] : null
      ops.push({ type: 'pop', value: null, topAfter: top, stackAfter: [...stack] })
    }
  }
  return ops
}

function makeOptions(correctTop) {
  if (correctTop === null) return ['EMPTY', '0', '1', '???']
  const opts = new Set([correctTop])
  while (opts.size < 4) {
    const r = Math.floor(Math.random() * 10) + 1
    if (r !== correctTop) opts.add(r)
  }
  const arr = Array.from(opts).map(v => String(v))
  // Shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function StackPushPop() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')
  const [ops] = useState(() => generateOps())
  const [opIdx, setOpIdx] = useState(0)
  const [options, setOptions] = useState([])
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(null)
  const [displayStack, setDisplayStack] = useState([])

  function startChallenge() {
    const op = ops[0]
    setOptions(makeOptions(op.topAfter))
    setDisplayStack(op.type === 'push' ? op.stackAfter.slice(0, -1) : []) // show before state
    setPhase('challenge')
  }

  const handleAnswer = useCallback((answer) => {
    if (phase !== 'challenge' || feedback) return
    const op = ops[opIdx]
    const correctAnswer = op.topAfter === null ? 'EMPTY' : String(op.topAfter)
    const isCorrect = answer === correctAnswer

    setTotal(t => t + 1)
    if (isCorrect) setCorrect(c => c + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setDisplayStack(op.stackAfter)

    setTimeout(() => {
      setFeedback(null)
      if (opIdx + 1 >= ops.length) {
        finishScore(correct + (isCorrect ? 1 : 0), total + 1)
      } else {
        const nextIdx = opIdx + 1
        const nextOp = ops[nextIdx]
        setOpIdx(nextIdx)
        setOptions(makeOptions(nextOp.topAfter))
        // Show stack state BEFORE this operation
        if (nextIdx > 0) {
          setDisplayStack(ops[nextIdx - 1].stackAfter)
        }
      }
    }, 600)
  }, [phase, feedback, opIdx, ops, correct, total])

  useEffect(() => {
    if (phase !== 'challenge') return
    const handler = (e) => {
      if (feedback) return
      const num = parseInt(e.key)
      if (num >= 1 && num <= 4 && options[num - 1]) {
        handleAnswer(options[num - 1])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, feedback, options, handleAnswer])

  function finishScore(c, t) {
    const accuracy = t > 0 ? c / t : 1
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1
    const xp = 30 + stars * 17
    setScore({ stars, xp, accuracy: Math.round(accuracy * 100), correct: c, total: t })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  function reset() {
    setOpIdx(0)
    setCorrect(0)
    setTotal(0)
    setFeedback(null)
    setScore(null)
    setDisplayStack([])
    setPhase('intro')
  }

  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Stack Push/Pop"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct predictions', value: `${score.correct}/${score.total}` },
          { label: 'Accuracy', value: `${score.accuracy}%` },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : '/')}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : '\u2190 HOME'}
        onHome={() => navigate(backDest)}
      />
    )
  }

  const currentOp = ops[opIdx]

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
          STACK PUSH/POP
        </div>
        {total > 0 ? (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">{correct}/{total}</div>
        ) : <div className="w-16" />}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Stack visualization */}
        {phase !== 'intro' && (
          <div className="flex flex-col items-center gap-1">
            <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-1">STACK (top \u2191)</div>
            <div className="flex flex-col-reverse items-center gap-0.5" style={{ minHeight: '120px' }}>
              {displayStack.length === 0 ? (
                <div className="pixel-font text-[0.5rem] text-[#3a3a4a]">[ EMPTY ]</div>
              ) : displayStack.map((val, i) => (
                <motion.div
                  key={`${i}-${val}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center border-2"
                  style={{
                    width: 'clamp(50px, 15vw, 80px)',
                    height: '32px',
                    background: i === displayStack.length - 1 ? '#2a1f0a' : '#1a1a2a',
                    borderColor: i === displayStack.length - 1 ? '#d97706' : '#2a2a3a',
                  }}
                >
                  <span className="pixel-font text-[0.6rem]" style={{
                    color: i === displayStack.length - 1 ? '#fbbf24' : '#a0a0b0',
                  }}>{val}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Operation display */}
        {phase === 'challenge' && currentOp && (
          <motion.div
            key={opIdx}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="pixel-dialog"
          >
            <p className="text-sm">
              Operation {opIdx + 1}/{ops.length}:{' '}
              <span className="font-bold" style={{ color: currentOp.type === 'push' ? '#22c55e' : '#e8645a' }}>
                {currentOp.type === 'push' ? `PUSH(${currentOp.value})` : 'POP()'}
              </span>
            </p>
            <p className="text-[#6b6b7a] text-xs mt-1">
              What is on top of the stack after this operation?
            </p>
            <AnimatePresence>
              {feedback && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`mt-1 pixel-font text-[0.55rem] ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}
                >
                  {feedback === 'correct' ? '\u2605 CORRECT!' : '\u2717 WRONG! Top is ' + (currentOp.topAfter === null ? 'EMPTY' : currentOp.topAfter)}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Answer buttons */}
        {phase === 'challenge' && (
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt, i) => (
              <button
                key={`${opIdx}-${i}`}
                onClick={() => handleAnswer(opt)}
                disabled={!!feedback}
                className="pixel-btn pixel-btn-secondary w-full"
                style={{ opacity: feedback && opt !== (currentOp?.topAfter === null ? 'EMPTY' : String(currentOp?.topAfter)) && feedback === 'wrong' ? 0.4 : 1 }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Progress dots */}
        {phase === 'challenge' && (
          <div className="flex justify-center gap-1 flex-wrap">
            {ops.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: i < opIdx ? '#22c55e' : i === opIdx ? '#d97706' : '#2a2a3a' }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="CAPT. STACK"
                onDone={startChallenge}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
