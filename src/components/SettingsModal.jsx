import { motion, AnimatePresence } from 'framer-motion'
import { useTheme, THEMES } from '../store/ThemeContext.jsx'
import { useGame } from '../store/GameContext.jsx'

export default function SettingsModal({ open, onClose }) {
  const { theme, setTheme } = useTheme()
  const { resetGame } = useGame()

  function handleReset() {
    if (window.confirm('Reset ALL save data? This cannot be undone.')) {
      resetGame()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={onClose}
          />

          {/* Slide-up panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ maxWidth: '520px', margin: '0 auto' }}
          >
            <div
              className="pixel-border"
              style={{
                background: 'var(--bg-dialog)',
                padding: 'clamp(1rem, 4vw, 1.5rem)',
                borderTop: '4px solid var(--amber-lt)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span
                  className="pixel-font"
                  style={{ fontSize: 'clamp(0.55rem, 2.5vw, 0.75rem)', color: 'var(--amber-lt)' }}
                >
                  ⚙ SETTINGS
                </span>
                <button
                  onClick={onClose}
                  className="pixel-btn pixel-btn-secondary"
                  style={{ fontSize: '0.5rem', padding: '0.4rem 0.75rem', minHeight: '40px' }}
                  aria-label="Close settings"
                >
                  ✕ CLOSE
                </button>
              </div>

              {/* Themes section */}
              <div>
                <div
                  className="pixel-font mb-3"
                  style={{ fontSize: 'clamp(0.4rem, 1.8vw, 0.55rem)', color: 'var(--text-dim)' }}
                >
                  ─── THEMES ───
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {Object.values(THEMES).map(t => {
                    const active = theme === t.id
                    return (
                      <motion.button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        whileTap={{ scale: 0.97 }}
                        className="text-left p-3 border-2 transition-all"
                        style={{
                          background: t.swatches[0],
                          borderColor: active ? 'var(--amber-lt)' : 'var(--text-dim)',
                          opacity: active ? 1 : 0.65,
                          boxShadow: active
                            ? '4px 4px 0 rgba(0,0,0,0.5), 0 0 16px rgba(245,158,11,0.3)'
                            : '4px 4px 0 rgba(0,0,0,0.4)',
                          minHeight: '44px',
                          cursor: 'pointer',
                        }}
                        aria-pressed={active}
                        aria-label={`Select ${t.name} theme`}
                      >
                        {/* Color swatches */}
                        <div className="flex gap-1 mb-2">
                          {t.swatches.map((c, i) => (
                            <div
                              key={i}
                              style={{
                                width: '14px', height: '14px',
                                background: c,
                                border: '1px solid rgba(255,255,255,0.15)',
                              }}
                            />
                          ))}
                        </div>

                        {/* Name */}
                        <div
                          className="pixel-font"
                          style={{
                            fontSize: 'clamp(0.38rem, 1.8vw, 0.52rem)',
                            color: t.swatches[1],
                            lineHeight: 1.8,
                          }}
                        >
                          {t.name}
                        </div>

                        {/* Desc */}
                        <div style={{ fontSize: 'clamp(0.55rem, 2vw, 0.65rem)', color: t.swatches[3], marginTop: '2px' }}>
                          {t.desc}
                        </div>

                        {/* Active badge */}
                        {active && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="pixel-font mt-2"
                            style={{ fontSize: '0.4rem', color: 'var(--amber-lt)' }}
                          >
                            ★ ACTIVE
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Danger zone */}
              <div className="mt-5 pt-4 border-t border-[#2a2a3a]">
                <div
                  className="pixel-font mb-3"
                  style={{ fontSize: 'clamp(0.4rem, 1.8vw, 0.55rem)', color: 'var(--text-dim)' }}
                >
                  ─── DANGER ZONE ───
                </div>
                <button
                  onClick={handleReset}
                  className="pixel-btn pixel-btn-coral w-full"
                  style={{ fontSize: '0.5rem' }}
                  aria-label="Reset save data"
                >
                  ✕ RESET SAVE DATA
                </button>
                <p className="pixel-font mt-2 text-center" style={{ fontSize: '0.38rem', color: 'var(--text-dim)' }}>
                  Clears all levels, XP, and RPG progress
                </p>
              </div>

              {/* Safe area spacer for mobile */}
              <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
