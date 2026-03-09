import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'euclid-gcd'

const DIALOG_LINES = [
  '* I am Profiler V. Efficiency is everything.',
  "* Euclid's algorithm: GCD(a, b) = GCD(b, a mod b).",
  '* Repeat until the remainder is 0. The last non-zero value is the GCD.',
  '* I will show you (a, b). You compute a mod b and choose the correct remainder.',
  '* Prove your understanding!',
]

function generateProblem() {
  const a = 20 + Math.floor(Math.random() * 80)
  const b = 10 + Math.floor(Math.random() * (a - 5))
  // Compute all steps
  const steps = []
  let x = a, y = b
  while (y !== 0) {
    const rem = x % y
    steps.push({ a: x, b: y, remainder: rem })
    x = y
    y = rem
  }
  return { a, b, gcd: x, steps }
}

function makeOptions(correctRemainder, a, b) {
  const opts = new Set([correctRemainder])
  // Add plausible distractors
  const distractors = [
    Math.abs(a - b),
    Math.floor(a / b),
    b % (correctRemainder || 1) || 1,
    correctRemainder + 1,
    Math.max(0, correctRemainder - 1),
    Math.floor(a / 2),
  ].filter(d => d !== correctRemainder && d >= 0 && d < a)

  for (const d of distractors) {
    if (opts.size >= 4) break
    opts.add(d)
  }
  while (opts.size < 4) opts.add(Math.floor(Math.random() * b))

  const arr = Array.from(opts).map(String)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function EuclidGCD() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')
  const [problem, setProblem] = useState(() => generateProblem())
  const [stepIdx, setStepIdx] = useState(0)
  const [options, setOptions] = useState([])
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [history, setHistory] = useState([])
  const [score, setScore] = useState(null)

  function startChallenge() {
    const step = problem.steps[0]
    setOptions(makeOptions(step.remainder, step.a, step.b))
    setPhase('challenge')
  }

  const handleAnswer = useCallback((answer) => {
    if (phase !== 'challenge' || feedback) return
    const step = problem.steps[stepIdx]
    const correctAnswer = String(step.remainder)
    const isCorrect = answer === correctAnswer

    setTotal(t => t + 1)
    if (isCorrect) setCorrect(c => c + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setHistory(h => [...h, { ...step, wasCorrect: isCorrect }])

    setTimeout(() => {
      setFeedback(null)
      if (stepIdx + 1 >= problem.steps.length) {
        finishScore(correct + (isCorrect ? 1 : 0), total + 1)
      } else {
        const nextIdx = stepIdx + 1
        const nextStep = problem.steps[nextIdx]
        setStepIdx(nextIdx)
        setOptions(makeOptions(nextStep.remainder, nextStep.a, nextStep.b))
      }
    }, 700)
  }, [phase, feedback, stepIdx, problem, correct, total])

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
    const xp = 50 + stars * 23
    setScore({ stars, xp, accuracy: Math.round(accuracy * 100), correct: c, total: t })
    completeLevel(LEVEL_ID, stars, xp)
    setPhase('score')
  }

  function reset() {
    const fresh = generateProblem()
    setProblem(fresh)
    setStepIdx(0)
    setOptions([])
    setCorrect(0)
    setTotal(0)
    setFeedback(null)
    setHistory([])
    setScore(null)
    setPhase('intro')
  }

  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Euclid's GCD"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Correct steps', value: `${score.correct}/${score.total}` },
          { label: 'GCD found', value: problem.gcd },
          { label: 'Algorithm steps', value: problem.steps.length },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : '/')}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : '\u2190 HOME'}
        onHome={() => navigate(backDest)}
      />
    )
  }

  const currentStep = problem.steps[stepIdx]

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
          EUCLID'S GCD
        </div>
        {total > 0 ? (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">{correct}/{total}</div>
        ) : <div className="w-16" />}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Problem display */}
        {phase !== 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-2"
          >
            <div className="pixel-font text-[0.5rem] text-[#6b6b7a] mb-1">
              FIND GCD({problem.a}, {problem.b})
            </div>
          </motion.div>
        )}

        {/* Current step */}
        {phase === 'challenge' && currentStep && (
          <motion.div
            key={stepIdx}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="pixel-dialog"
          >
            <div className="text-center mb-2">
              <span className="pixel-font text-[0.6rem] text-[#f59e0b]">
                GCD(<span className="text-[#fbbf24]">{currentStep.a}</span>, <span className="text-[#fbbf24]">{currentStep.b}</span>)
              </span>
            </div>
            <p className="text-sm text-center">
              What is <span className="text-[#d97706] font-bold">{currentStep.a} mod {currentStep.b}</span>?
            </p>
            <p className="text-[#6b6b7a] text-xs text-center mt-1">
              Step {stepIdx + 1} of {problem.steps.length}
            </p>
            <AnimatePresence>
              {feedback && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`mt-2 pixel-font text-[0.55rem] text-center ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}
                >
                  {feedback === 'correct'
                    ? `\u2605 CORRECT! ${currentStep.a} mod ${currentStep.b} = ${currentStep.remainder}`
                    : `\u2717 WRONG! ${currentStep.a} mod ${currentStep.b} = ${currentStep.remainder}`}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Answer buttons */}
        {phase === 'challenge' && (
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt, i) => {
              let borderColor = '#2a2a3a'
              let bg = 'transparent'
              if (feedback) {
                if (opt === String(currentStep.remainder)) { borderColor = '#22c55e'; bg = 'rgba(34,197,94,0.08)' }
                else if (feedback === 'wrong') { borderColor = '#2a2a3a' }
              }
              return (
                <button
                  key={`${stepIdx}-${i}`}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!feedback}
                  className="pixel-btn pixel-btn-secondary w-full"
                  style={{
                    border: `2px solid ${borderColor}`,
                    background: bg,
                    fontSize: '0.6rem',
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* History trail */}
        {history.length > 0 && (
          <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between text-xs px-1" style={{ color: h.wasCorrect ? '#4a6a4a' : '#6a4a4a' }}>
                <span>GCD({h.a}, {h.b})</span>
                <span>{h.a} mod {h.b} = {h.remainder}</span>
                <span>{h.wasCorrect ? '\u2713' : '\u2717'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress dots */}
        {phase === 'challenge' && (
          <div className="flex justify-center gap-1.5 flex-wrap">
            {problem.steps.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: i < stepIdx ? '#22c55e' : i === stepIdx ? '#d97706' : '#2a2a3a' }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="PROFILER V"
                onDone={startChallenge}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
