import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../store/GameContext.jsx'
import { resolveEnding } from '../data/endings.js'

export default function EndingScreen() {
  const navigate = useNavigate()
  const { state, resetGame } = useGame()
  const flags = state.rpgFlags
  const ending = resolveEnding(flags)

  function handleReset() {
    resetGame()
    navigate('/')
  }

  return (
    <div
      className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-6"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
    >
      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="pixel-font text-[0.5rem] text-[#6b6b7a] mb-3 tracking-widest">
          ─── JOURNEY COMPLETE ───
        </div>
        <div
          className="pixel-font text-[1rem] sm:text-[1.3rem] text-center leading-relaxed"
          style={{ color: ending.color }}
        >
          {ending.title}
        </div>
        <div className="pixel-font text-[0.5rem] text-[#6b6b7a] mt-2 italic">
          {ending.subtitle}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="w-16 border-t-2" style={{ borderColor: ending.color }} />

      {/* Story text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pixel-dialog max-w-sm w-full"
      >
        <p className="text-sm leading-relaxed">{ending.body}</p>
      </motion.div>

      {/* Flag summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm card-bg border border-[#2a2a3a] p-4"
      >
        <div className="pixel-font text-[0.45rem] text-[#6b6b7a] mb-3">── YOUR JOURNEY ──</div>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Harmony',     val: flags.harmony,     color: '#22c55e' },
            { label: 'Efficiency',  val: flags.efficiency,  color: '#f59e0b' },
            { label: 'Correctness', val: flags.correctness, color: '#e8645a' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[#6b6b7a] text-xs w-24">{label}</span>
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <div
                    key={i}
                    className="w-4 h-4 border"
                    style={{
                      borderColor: color,
                      background: i <= val ? color : 'transparent',
                    }}
                  />
                ))}
              </div>
              <span className="pixel-font text-[0.4rem]" style={{ color }}>{val}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-[#2a2a3a]">
            <span className="pixel-font text-[0.4rem] text-[#6b6b7a]">
              Encounters: {flags.completedEncounters.length > 0
                ? flags.completedEncounters.join(', ')
                : 'none'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
      >
        <button
          onClick={() => navigate('/')}
          className="pixel-btn pixel-btn-secondary flex-1"
          style={{ fontSize: '0.5rem' }}
        >
          ← HOME
        </button>
        <button
          onClick={() => navigate('/rpg')}
          className="pixel-btn pixel-btn-primary flex-1"
          style={{ fontSize: '0.5rem' }}
        >
          ↺ EXPLORE AGAIN
        </button>
        <button
          onClick={handleReset}
          className="pixel-btn pixel-btn-coral flex-1"
          style={{ fontSize: '0.5rem' }}
          aria-label="Reset save and start over"
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
