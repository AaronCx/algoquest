import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../store/GameContext.jsx'
import { useAudio } from '../audio/AudioContext.jsx'
import { ENCOUNTERS } from '../data/encounters/index.js'

// ── Phase constants ────────────────────────────────────────────────────────────
const PHASE = {
  INTRO:    'intro',
  QUESTION: 'question',
  FEEDBACK: 'feedback',
  APPROACH: 'approach',
  RESULTS:  'results',
}

export default function PlaceholderBattle() {
  const { battleId } = useParams()
  const navigate = useNavigate()
  const { state, completeEncounterWithEffects } = useGame()
  const audio = useAudio()

  const encounter = ENCOUNTERS[battleId]
  const encounterId = state.returnToRPG?.encounterId || battleId

  // ── Derive MCQ steps and approach step ────────────────────────────────────
  const mcqSteps     = (encounter?.steps || []).filter(s => s.type !== 'approach')
  const approachStep = (encounter?.steps || []).find(s => s.type === 'approach')

  // ── State machine ─────────────────────────────────────────────────────────
  const [phase, setPhase]               = useState(PHASE.INTRO)
  const [questionIdx, setQuestionIdx]   = useState(0)
  const [selected, setSelected]         = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [approachIdx, setApproachIdx]   = useState(null)
  const [earnedEffects, setEarnedEffects] = useState({})
  const [shaking, setShaking]           = useState(false)

  // ── Unknown encounter guard ────────────────────────────────────────────────
  if (!encounter) {
    return (
      <div className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-4">
        <div className="pixel-font text-[0.55rem] text-[#e8645a]">ENCOUNTER NOT FOUND</div>
        <div className="pixel-dialog max-w-sm w-full text-center">
          <p className="text-sm text-[#6b6b7a]">battleId: {battleId}</p>
        </div>
        <button onClick={() => navigate('/rpg')} className="pixel-btn pixel-btn-secondary" style={{ fontSize: '0.5rem' }}>
          ← BACK
        </button>
      </div>
    )
  }

  const currentStep = mcqSteps[questionIdx]

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleAnswerSelect(idx) {
    if (selected !== null) return
    setSelected(idx)
    const isCorrect = idx === currentStep.correct
    if (isCorrect) {
      setCorrectCount(c => c + 1)
      audio?.sfx('correct')
    } else {
      audio?.sfx('wrong')
      // Trigger screen shake
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
    }
    setPhase(PHASE.FEEDBACK)
  }

  function handleNextQuestion() {
    const nextIdx = questionIdx + 1
    if (nextIdx < mcqSteps.length) {
      setQuestionIdx(nextIdx)
      setSelected(null)
      setPhase(PHASE.QUESTION)
    } else if (approachStep) {
      setPhase(PHASE.APPROACH)
    } else {
      completeEncounterWithEffects(encounterId, {})
      finishBattle({})
    }
  }

  function handleApproachSelect(idx) {
    setApproachIdx(idx)
    const effects = approachStep.options[idx].effects || {}
    setEarnedEffects(effects)
    completeEncounterWithEffects(encounterId, effects)
    setPhase(PHASE.RESULTS)
  }

  function finishBattle() {
    if (encounter.isAct1End) {
      navigate('/act1cutscene')
    } else {
      navigate('/rpg')
    }
  }

  const totalQ   = mcqSteps.length
  const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 100
  const stars    = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1

  // ── Stars display ─────────────────────────────────────────────────────────
  function Stars({ count }) {
    return (
      <div className="flex gap-2 justify-center mt-2">
        {[1,2,3].map(s => (
          <span key={s} style={{ fontSize: '1.2rem', color: s <= count ? '#fbbf24' : '#2a2a3a' }}>★</span>
        ))}
      </div>
    )
  }

  // ── Render phases ─────────────────────────────────────────────────────────

  // INTRO
  if (phase === PHASE.INTRO) {
    return (
      <div className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-5"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
      >
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-2 tracking-widest">ENCOUNTER</div>
          <div className="pixel-font text-[0.8rem] sm:text-[1rem] text-[#f59e0b] leading-relaxed">
            {encounter.title}
          </div>
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mt-2">{encounter.algorithmName}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="pixel-dialog max-w-sm w-full"
        >
          <p className="text-sm leading-relaxed">{encounter.story}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <div className="pixel-font text-[0.4rem] text-[#6b6b7a]">
            {mcqSteps.length} questions + approach choice
          </div>
          <button
            onClick={() => setPhase(PHASE.QUESTION)}
            className="pixel-btn pixel-btn-primary w-full"
            style={{ fontSize: '0.5rem' }}
          >
            ▶ BEGIN TRIAL
          </button>
          <button
            onClick={() => navigate('/rpg')}
            className="pixel-btn pixel-btn-secondary w-full"
            style={{ fontSize: '0.5rem' }}
          >
            ← RETREAT
          </button>
        </motion.div>
      </div>
    )
  }

  // QUESTION / FEEDBACK
  if (phase === PHASE.QUESTION || phase === PHASE.FEEDBACK) {
    const isCorrect = selected === currentStep?.correct

    return (
      <div
        className="min-h-dvh page-bg flex flex-col p-4 gap-4"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
          animation: shaking ? 'screenShake 0.42s ease-in-out' : 'none',
        }}
      >
        {/* Progress */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 bg-[#1a1a2a] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d97706] transition-all duration-500"
              style={{ width: `${((questionIdx) / mcqSteps.length) * 100}%` }}
            />
          </div>
          <span className="pixel-font text-[0.4rem] text-[#6b6b7a] shrink-0">
            {questionIdx + 1} / {mcqSteps.length}
          </span>
        </div>

        {/* Algorithm label */}
        <div className="pixel-font text-[0.4rem] text-[#6b6b7a]">{encounter.algorithmName}</div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIdx}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="pixel-dialog flex-shrink-0"
          >
            <p className="text-sm leading-relaxed">{currentStep.question}</p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="flex flex-col gap-2 flex-1">
          {currentStep.options.map((opt, i) => {
            let borderColor = '#2a2a3a'
            let bg = 'transparent'
            if (selected !== null) {
              if (i === currentStep.correct) { borderColor = '#22c55e'; bg = 'rgba(34,197,94,0.08)' }
              else if (i === selected)       { borderColor = '#e8645a'; bg = 'rgba(232,100,90,0.08)' }
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswerSelect(i)}
                disabled={selected !== null}
                className="pixel-btn text-left w-full"
                style={{
                  fontSize: '0.48rem',
                  minHeight: 44,
                  justifyContent: 'flex-start',
                  border: `2px solid ${borderColor}`,
                  background: bg,
                  opacity: selected !== null && i !== currentStep.correct && i !== selected ? 0.45 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {i === currentStep.correct && selected !== null && '✓ '}
                {i === selected && i !== currentStep.correct && '✗ '}
                {opt}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {phase === PHASE.FEEDBACK && (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3"
          >
            <div
              className="pixel-dialog"
              style={{ borderColor: isCorrect ? '#22c55e' : '#e8645a' }}
            >
              <div className="pixel-font text-[0.5rem] mb-1" style={{ color: isCorrect ? '#22c55e' : '#e8645a' }}>
                {isCorrect ? '★ CORRECT!' : '✗ INCORRECT'}
              </div>
              <p className="text-xs leading-relaxed text-[#a0a0b0]">{currentStep.hint}</p>
            </div>
            <button
              onClick={handleNextQuestion}
              className="pixel-btn pixel-btn-primary w-full"
              style={{ fontSize: '0.5rem' }}
            >
              {questionIdx + 1 < mcqSteps.length ? 'NEXT QUESTION ▶' : approachStep ? 'APPROACH CHOICE ▶' : 'COMPLETE ▶'}
            </button>
          </motion.div>
        )}
      </div>
    )
  }

  // APPROACH
  if (phase === PHASE.APPROACH) {
    return (
      <div className="min-h-dvh page-bg flex flex-col p-4 gap-4"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-2">APPROACH CHOICE</div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pixel-dialog flex-shrink-0"
        >
          <p className="text-sm leading-relaxed">{approachStep.question}</p>
          <p className="pixel-font text-[0.38rem] text-[#6b6b7a] mt-2">
            * This choice shapes your character. There is no wrong answer.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3 flex-1">
          {approachStep.options.map((opt, i) => (
            <motion.button
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleApproachSelect(i)}
              className="pixel-btn pixel-btn-secondary text-left w-full"
              style={{ fontSize: '0.48rem', minHeight: 56, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
            >
              <span>▶ {opt.label}</span>
              <span style={{ color: '#6b6b7a', fontSize: '0.4rem', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                {opt.desc}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // RESULTS
  if (phase === PHASE.RESULTS) {
    const chosenApproach = approachStep?.options[approachIdx]
    const statGains = earnedEffects

    return (
      <div className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-5"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
      >
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-2">TRIAL COMPLETE</div>
          <div className="pixel-font text-[0.8rem] sm:text-[1rem]" style={{ color: '#22c55e' }}>
            {encounter.title}
          </div>
          <Stars count={stars} />
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-full max-w-sm card-bg border border-[#2a2a3a] p-4 flex flex-col gap-3"
        >
          <div className="pixel-font text-[0.4rem] text-[#6b6b7a]">── RESULTS ──</div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-[#6b6b7a]">Accuracy</span>
            <span className="pixel-font text-[0.5rem] text-[#f59e0b]">{correctCount}/{totalQ} ({accuracy}%)</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-[#6b6b7a]">XP earned</span>
            <span className="pixel-font text-[0.5rem] text-[#22c55e]">+{encounter.rewards?.xp || 0}</span>
          </div>

          {chosenApproach && (
            <div className="border-t border-[#2a2a3a] pt-3 flex flex-col gap-1">
              <div className="pixel-font text-[0.38rem] text-[#6b6b7a]">APPROACH</div>
              <div className="text-xs leading-relaxed">{chosenApproach.label}</div>
              {Object.entries(statGains)
                .filter(([k]) => ['correctness','efficiency','harmony'].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="pixel-font text-[0.4rem]" style={{ color: '#f59e0b' }}>
                    {k.toUpperCase()} +{v}
                  </div>
                ))
              }
              {statGains.keyDecision && (
                <div className="pixel-font text-[0.38rem] text-[#6b6b7a] mt-1">
                  Decision recorded: {statGains.keyDecision.key}
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          onClick={finishBattle}
          className="pixel-btn pixel-btn-primary w-full max-w-sm"
          style={{ fontSize: '0.5rem' }}
        >
          {encounter.isAct1End ? '★ VIEW ENDING' : '← RETURN TO ADVENTURE'}
        </motion.button>
      </div>
    )
  }

  return null
}
