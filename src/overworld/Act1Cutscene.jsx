import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../store/GameContext.jsx'
import {
  ACT1_CUTSCENE_TITLE,
  ACT1_CUTSCENE_SUBTITLE,
  ACT1_SLIDES,
  getAct1Epilogue,
} from '../data/act1Cutscene.js'

export default function Act1Cutscene() {
  const navigate = useNavigate()
  const { state, resetGame } = useGame()
  const [slideIdx, setSlideIdx] = useState(0)
  const [showEpilogue, setShowEpilogue] = useState(false)

  const flags    = state.rpgFlags
  const slide    = ACT1_SLIDES[slideIdx]
  const isLast   = slide?.isFinal
  const epilogue = getAct1Epilogue(flags)

  function nextSlide() {
    if (isLast) {
      setShowEpilogue(true)
      return
    }
    setSlideIdx(i => Math.min(i + 1, ACT1_SLIDES.length - 1))
  }

  function handleNewGame() {
    resetGame()
    navigate('/')
  }

  // ── Epilogue / stats screen ───────────────────────────────────────────────
  if (showEpilogue) {
    return (
      <div
        className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-5"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
      >
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-3 tracking-widest">── ACT I COMPLETE ──</div>
          <div className="pixel-font text-[0.8rem] sm:text-[1rem] text-[#f59e0b] leading-relaxed">
            {ACT1_CUTSCENE_TITLE}
          </div>
        </motion.div>

        {/* Faction stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="w-full max-w-sm card-bg border border-[#2a2a3a] p-4"
        >
          <div className="pixel-font text-[0.4rem] text-[#6b6b7a] mb-3">── YOUR JOURNEY ──</div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Correctness', val: flags.correctness, color: '#e8645a' },
              { label: 'Efficiency',  val: flags.efficiency,  color: '#f59e0b' },
              { label: 'Harmony',     val: flags.harmony,     color: '#22c55e' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[#6b6b7a] text-xs w-24">{label}</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      style={{
                        width: 12, height: 12,
                        border: `1px solid ${color}`,
                        background: i <= val ? color : 'transparent',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
                <span className="pixel-font text-[0.4rem]" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Key decisions */}
          <div className="border-t border-[#2a2a3a] mt-3 pt-3">
            <div className="pixel-font text-[0.38rem] text-[#6b6b7a] mb-2">── KEY DECISIONS ──</div>
            {epilogue.map((line, i) => (
              <div key={i} className="pixel-font text-[0.38rem] text-[#a0a0b0] mb-1 leading-relaxed">
                {line}
              </div>
            ))}
          </div>

          {/* Encounters completed */}
          <div className="border-t border-[#2a2a3a] mt-3 pt-3">
            <div className="pixel-font text-[0.38rem] text-[#6b6b7a]">
              Trials: {flags.completedEncounters.length}/6
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
        >
          <button
            onClick={() => navigate('/rpg')}
            className="pixel-btn pixel-btn-secondary flex-1"
            style={{ fontSize: '0.5rem' }}
          >
            ↺ KEEP EXPLORING
          </button>
          <button
            onClick={handleNewGame}
            className="pixel-btn pixel-btn-coral flex-1"
            style={{ fontSize: '0.5rem' }}
          >
            ✕ NEW GAME
          </button>
        </motion.div>
        <p className="pixel-font text-[0.38rem] text-[#2a2a3a] text-center">
          NEW GAME clears all progress and returns to title
        </p>
      </div>
    )
  }

  // ── Cutscene slides ───────────────────────────────────────────────────────
  return (
    <div
      className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-6"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
    >
      {/* Title (first slide only) */}
      {slideIdx === 0 && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-2 tracking-widest">
            ─── {ACT1_CUTSCENE_SUBTITLE} ───
          </div>
          <div className="pixel-font text-[0.65rem] sm:text-[0.85rem] text-[#f59e0b] leading-relaxed text-center">
            {ACT1_CUTSCENE_TITLE}
          </div>
        </motion.div>
      )}

      {/* Divider */}
      <div className="w-16 border-t-2 border-[#d97706]" />

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slideIdx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
          className="pixel-dialog max-w-sm w-full"
        >
          {slide.heading && (
            <div className="pixel-font text-[0.5rem] text-[#f59e0b] mb-3">{slide.heading}</div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-line">{slide.text}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2">
        {ACT1_SLIDES.map((_, i) => (
          <div
            key={i}
            style={{
              width: 6, height: 6,
              background: i === slideIdx ? '#d97706' : '#2a2a3a',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Next / finish */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        onClick={nextSlide}
        className="pixel-btn pixel-btn-primary w-full max-w-sm"
        style={{ fontSize: '0.5rem' }}
      >
        {isLast ? '★ SEE YOUR STATS' : 'CONTINUE ▶'}
      </motion.button>

      {/* Skip */}
      <button
        onClick={() => setShowEpilogue(true)}
        className="pixel-font text-[0.38rem] text-[#2a2a3a] hover:text-[#6b6b7a] transition-colors"
      >
        SKIP TO STATS →
      </button>
    </div>
  )
}
