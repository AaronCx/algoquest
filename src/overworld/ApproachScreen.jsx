import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../store/GameContext.jsx'
import { ENCOUNTERS } from '../data/encounters/index.js'

export default function ApproachScreen() {
  const navigate = useNavigate()
  const { state, completeEncounterWithEffects } = useGame()

  const encounterId = state.returnToRPG?.encounterId
  const encounter = ENCOUNTERS[encounterId]

  const [approachIdx, setApproachIdx] = useState(null)
  const [phase, setPhase] = useState('approach') // approach | results

  const approachStep = encounter ? (encounter.steps || []).find(s => s.type === 'approach') : null
  const didAutoComplete = useRef(false)

  // If no approach step, complete and redirect on mount
  useEffect(() => {
    if (!encounter || !encounterId) return
    if (!approachStep && !didAutoComplete.current) {
      didAutoComplete.current = true
      completeEncounterWithEffects(encounterId, {})
      navigate(encounter.isAct1End ? '/act1cutscene' : '/rpg', { replace: true })
    }
  }, [approachStep, encounterId, encounter, navigate, completeEncounterWithEffects])

  if (!encounter || !encounterId) {
    return (
      <div className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-4">
        <div className="pixel-font text-[0.55rem] text-[#e8645a]">NO ENCOUNTER CONTEXT</div>
        <button onClick={() => navigate('/rpg')} className="pixel-btn pixel-btn-secondary" style={{ fontSize: '0.5rem' }}>
          \u2190 BACK TO ADVENTURE
        </button>
      </div>
    )
  }

  if (!approachStep) return null

  function handleApproachSelect(idx) {
    setApproachIdx(idx)
    const effects = approachStep.options[idx].effects || {}
    completeEncounterWithEffects(encounterId, effects)
    setPhase('results')
  }

  function finishBattle() {
    if (encounter.isAct1End) {
      navigate('/act1cutscene')
    } else {
      navigate('/rpg')
    }
  }

  // APPROACH CHOICE
  if (phase === 'approach') {
    return (
      <div className="min-h-dvh page-bg flex flex-col p-4 gap-4"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="pixel-font text-[0.55rem] text-[#f59e0b] text-center mb-1">
            {encounter.title}
          </div>
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a] text-center">APPROACH CHOICE</div>
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
              <span>\u25B6 {opt.label}</span>
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
  const chosenApproach = approachStep.options[approachIdx]
  const effects = chosenApproach?.effects || {}

  return (
    <div className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-5"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
    >
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-2">TRIAL COMPLETE</div>
        <div className="pixel-font text-[0.8rem] sm:text-[1rem]" style={{ color: '#22c55e' }}>
          {encounter.title}
        </div>
        <div className="flex gap-2 justify-center mt-2">
          {[1,2,3].map(s => (
            <span key={s} style={{ fontSize: '1.2rem', color: '#fbbf24' }}>\u2605</span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="w-full max-w-sm card-bg border border-[#2a2a3a] p-4 flex flex-col gap-3"
      >
        <div className="pixel-font text-[0.4rem] text-[#6b6b7a]">\u2500\u2500 RESULTS \u2500\u2500</div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-[#6b6b7a]">XP earned</span>
          <span className="pixel-font text-[0.5rem] text-[#22c55e]">+{encounter.rewards?.xp || 0}</span>
        </div>

        <div className="border-t border-[#2a2a3a] pt-3 flex flex-col gap-1">
          <div className="pixel-font text-[0.38rem] text-[#6b6b7a]">APPROACH</div>
          <div className="text-xs leading-relaxed">{chosenApproach.label}</div>
          {Object.entries(effects)
            .filter(([k]) => ['correctness','efficiency','harmony'].includes(k))
            .map(([k, v]) => (
              <div key={k} className="pixel-font text-[0.4rem]" style={{ color: '#f59e0b' }}>
                {k.toUpperCase()} +{v}
              </div>
            ))
          }
          {effects.keyDecision && (
            <div className="pixel-font text-[0.38rem] text-[#6b6b7a] mt-1">
              Decision recorded: {effects.keyDecision.key}
            </div>
          )}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        onClick={finishBattle}
        className="pixel-btn pixel-btn-primary w-full max-w-sm"
        style={{ fontSize: '0.5rem' }}
      >
        {encounter.isAct1End ? '\u2605 VIEW ENDING' : '\u2190 RETURN TO ADVENTURE'}
      </motion.button>
    </div>
  )
}
