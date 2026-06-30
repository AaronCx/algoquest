import { motion } from 'framer-motion'
import { useGame } from '../store/GameContext.jsx'
import { LEVELS } from '../store/gameStore.js'

export default function ProgressTracker() {
  const { state } = useGame()
  const completedCount = state.completedLevels.length
  const totalLevels = LEVELS.length
  const pct = totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0

  const totalStars = Object.values(state.levelStars).reduce((sum, s) => sum + s, 0)
  const maxStars = totalLevels * 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mx-auto w-full max-w-md px-4 mb-2"
    >
      <div className="pixel-border card-bg p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="pixel-font text-[0.5rem] sm:text-[0.6rem] text-[#d97706]">
            ★ PROGRESS
          </div>
          <div className="pixel-font text-[0.4rem] sm:text-[0.5rem] text-[#fbbf24]">
            {totalStars}/{maxStars} STARS
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="pixel-font text-[0.4rem] text-[#6b6b7a]">
              ALGORITHMS CLEARED
            </span>
            <span className="pixel-font text-[0.4rem] text-[#f0e6d3] tabular-nums">
              {completedCount}/{totalLevels} ({pct}%)
            </span>
          </div>
          <div className="h-3 bg-[#1a1a2a] border border-[#2a2a3a] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)' }}
            />
          </div>
        </div>

        {/* Level list */}
        <div className="grid grid-cols-1 gap-1.5">
          {LEVELS.map(level => {
            const completed = state.completedLevels.includes(level.id)
            const stars = state.levelStars[level.id] || 0

            return (
              <div
                key={level.id}
                className="flex items-center gap-2 px-2 py-1.5 border border-[#1a1a2a]"
                style={{ background: completed ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.2)' }}
              >
                {/* Status icon */}
                <span className="text-sm shrink-0" style={{ width: '1.2rem', textAlign: 'center' }}>
                  {completed ? '\u2714' : '\u2500'}
                </span>

                {/* Emoji + Name */}
                <span className="text-sm shrink-0">{level.emoji}</span>
                <span
                  className="pixel-font flex-1 truncate"
                  style={{
                    fontSize: 'clamp(0.35rem, 1.5vw, 0.45rem)',
                    color: completed ? '#22c55e' : '#6b6b7a',
                  }}
                >
                  {level.name}
                </span>

                {/* Stars */}
                <div className="flex gap-0.5 shrink-0">
                  {[1, 2, 3].map(s => (
                    <span
                      key={s}
                      className="text-xs"
                      style={{ color: s <= stars ? '#fbbf24' : '#2a2a3a' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
