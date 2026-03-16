import PixelButton from './PixelButton.jsx'

const STAR_COLORS = ['#fbbf24', '#f59e0b', '#d97706']

function Star({ filled, delay }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30, opacity: 0 }}
      animate={filled ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0.6, opacity: 0.2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15, delay }}
      className="text-4xl sm:text-5xl"
    >
      {filled ? '★' : '☆'}
    </motion.div>
  )
}

function Soul({ delay }) {
  return (
    <motion.div
      initial={{ scale: 0, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15, delay }}
      className="text-2xl text-[#e8645a]"
    >
      ♥
    </motion.div>
  )
}

export default function ScoreScreen({
  levelName,
  stars,
  xp,
  stats = [],
  onRetry,
  onNext,
  onHome,
  nextLabel = 'NEXT LEVEL →',
  hasNext = true,
}) {
  const safeStars = Math.min(3, Math.max(1, stars))

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col items-center justify-center p-4 gap-6">

      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="pixel-font text-[0.55rem] sm:text-[0.7rem] text-[#6b6b7a] mb-2">
          LEVEL COMPLETE
        </div>
        <div className="pixel-font text-[0.9rem] sm:text-[1.1rem] text-[#f59e0b] text-glow-amber">
          {levelName}
        </div>
      </motion.div>

      {/* Stars */}
      <div className="flex gap-3 sm:gap-5">
        {[1, 2, 3].map((s, i) => (
          <Star key={s} filled={s <= safeStars} delay={0.3 + i * 0.15} />
        ))}
      </div>

      {/* Souls for perfect score */}
      {safeStars === 3 && (
        <div className="flex gap-2">
          {[0, 0.1, 0.2, 0.3, 0.4].map((d, i) => (
            <Soul key={i} delay={0.8 + d} />
          ))}
        </div>
      )}

      {/* XP gained */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.6 }}
        className="pixel-border-amber bg-[#12121a] px-6 py-3 text-center"
      >
        <div className="pixel-font text-[0.5rem] text-[#6b6b7a] mb-1">XP EARNED</div>
        <div className="pixel-font text-[1.2rem] sm:text-[1.5rem] text-[#fbbf24] text-glow-amber">
          +{xp}
        </div>
      </motion.div>

      {/* Stats */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-sm bg-[#12121a] border border-[#2a2a3a] p-4 flex flex-col gap-2"
        >
          {stats.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[#6b6b7a] text-sm">{label}</span>
              <span className="pixel-font text-[0.55rem] text-[#f0e6d3]">{value}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Rating message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="pixel-font text-[0.5rem] sm:text-[0.6rem] text-center text-[#d97706]"
      >
        {safeStars === 3 ? '* PERFECT RUN! DETERMINED!' :
         safeStars === 2 ? '* GOOD WORK, KEEP GOING!' :
         '* YOU CAN DO BETTER! TRY AGAIN!'}
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
      >
        <PixelButton variant="secondary" onClick={onHome} className="flex-1">
          ← HOME
        </PixelButton>
        <PixelButton variant="coral" onClick={onRetry} className="flex-1">
          ↺ RETRY
        </PixelButton>
        {hasNext && (
          <PixelButton variant="primary" onClick={onNext} className="flex-1">
            {nextLabel}
          </PixelButton>
        )}
      </motion.div>
    </div>
  )
}
