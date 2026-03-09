// ── Opening intro cinematic — shown once before first RPG session ─────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../store/GameContext.jsx'

const SLIDES = [
  {
    id: 'slide_0',
    art: `
    T T T T T T T T T
    T · · · · · · · T
    T · · 🧙 · · · · T
    T · · · · ♥ · · T
    T · · · · · · · T
    T T T T D T T T T
    `,
    speaker: 'NARRATOR',
    text: 'Long before algorithms had names, the land was lawless — data lost, loops unending, complexity ungoverned.',
    color: '#6b6b7a',
  },
  {
    id: 'slide_1',
    art: `
    # # # # # # # # #
    # · · · 📜 · · · #
    # · · · · · · · #
    # · ⚖ · · · ⚔ · #
    # · · · · · · · #
    # # # # D # # # #
    `,
    speaker: 'OLD WANDERER',
    text: 'Four factions guard four truths: correctness, efficiency, harmony, and balance. But a shadow has fallen — the old ways are breaking.',
    color: '#22c55e',
  },
  {
    id: 'slide_2',
    art: `
    ^ ^ ^ ^ ^ ^ ^ ^ ^
    ^ g g · · · · ^ ^
    ^ g · · ♥ · · ^ ^
    ^ · · · · · · ^ ^
    ^ · · · · · · ^ ^
    ^ ^ ^ ^ ^ ^ ^ ^ ^
    `,
    speaker: 'OLD WANDERER',
    text: 'You arrive at the Heap Meadow — a traveller with sharp eyes and a sharper mind. The factions need a champion. Will you answer the call?',
    color: '#22c55e',
  },
]

// Simple pixel art text grid renderer
function ArtGrid({ art }) {
  const lines = art.trim().split('\n').map(l => l.trim())
  return (
    <div
      style={{
        fontFamily: "'Press Start 2P', cursive",
        fontSize: 'min(2.8vw, 11px)',
        lineHeight: 1.8,
        color: '#2a2a3a',
        letterSpacing: '0.1em',
        userSelect: 'none',
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre' }}>{line}</div>
      ))}
    </div>
  )
}

export default function IntroCutscene() {
  const navigate = useNavigate()
  const { markIntroSeen } = useGame()
  const [idx, setIdx]         = useState(0)
  const [leaving, setLeaving] = useState(false)

  const slide = SLIDES[idx]

  function advance() {
    if (idx < SLIDES.length - 1) {
      setIdx(i => i + 1)
    } else {
      finish()
    }
  }

  function finish() {
    if (leaving) return
    setLeaving(true)
    markIntroSeen()
    setTimeout(() => navigate('/rpg'), 350)
  }

  return (
    <div
      className="min-h-dvh page-bg flex flex-col items-center justify-center p-4 gap-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      onClick={advance}
    >
      {/* Title badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="pixel-font text-[0.38rem] text-[#2a2a4a] tracking-widest"
      >
        ─── ACT I: HEAP MEADOW ───
      </motion.div>

      {/* Art panel */}
      <motion.div
        key={slide.id + '-art'}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm card-bg p-4 flex items-center justify-center"
        style={{ border: '2px solid #1a1a2a', minHeight: 120 }}
      >
        <ArtGrid art={slide.art} />
      </motion.div>

      {/* Text box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id + '-text'}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="pixel-dialog w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="pixel-font text-[0.42rem]" style={{ color: slide.color }}>
              ★ {slide.speaker}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{slide.text}</p>
          <div className="flex justify-between items-center mt-3">
            <span className="pixel-font text-[0.35rem] text-[#2a2a3a]">
              {idx + 1} / {SLIDES.length}
            </span>
            <span className="animate-blink text-[#d97706]" style={{ fontSize: '0.75rem' }}>
              {idx < SLIDES.length - 1 ? '▼ tap to continue' : '▶ begin adventure'}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            style={{
              width: 6, height: 6,
              background: i === idx ? '#d97706' : '#2a2a3a',
              borderRadius: 1,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Skip link */}
      <button
        onClick={(e) => { e.stopPropagation(); finish() }}
        className="pixel-font text-[0.35rem] text-[#2a2a3a] hover:text-[#6b6b7a] transition-colors"
        style={{ position: 'absolute', bottom: 'max(env(safe-area-inset-bottom), 16px)', right: 16 }}
      >
        SKIP ▶▶
      </button>
    </div>
  )
}
