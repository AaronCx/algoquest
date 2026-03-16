import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'

const SECTIONS = [
  {
    title: 'GETTING STARTED',
    icon: '\u2694\uFE0F',
    items: [
      'Pick a level from the grid to begin an algorithm challenge.',
      'Complete levels to earn XP and unlock new algorithms.',
      'Aim for 3 stars by making correct decisions quickly.',
    ],
  },
  {
    title: 'ALGORITHM LEVELS',
    icon: '\uD83E\uDDEA',
    items: [
      'Each level teaches one algorithm through interactive gameplay.',
      'Follow the NPC dialog to learn the concept, then solve the challenge.',
      'Watch the auto-complete phase to see the full algorithm in action.',
    ],
  },
  {
    title: 'RPG MODE',
    icon: '\u2665',
    items: [
      'Explore a pixel-art overworld and meet NPCs.',
      'Algorithm challenges appear as battles in the story.',
      'Your choices affect story stats: Correctness, Efficiency, and Harmony.',
      'Complete Act I to unlock the ending sequence.',
    ],
  },
  {
    title: 'CONTROLS',
    icon: '\uD83C\uDFAE',
    shortcuts: [
      { keys: 'Arrow Keys', desc: 'Navigate level grid / move in RPG' },
      { keys: 'Enter / Space', desc: 'Select level / advance dialog' },
      { keys: 'Esc', desc: 'Go back / deselect' },
      { keys: 'S / K', desc: 'Swap / Keep (Bubble Sort)' },
      { keys: '\u2190 / \u2192', desc: 'Left / Right half (Binary Search)' },
      { keys: 'Space', desc: 'Pause / Resume auto-complete' },
    ],
  },
]

export default function HowToPlayModal({ open, onClose }) {
  // Close on ESC
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

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
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-4 z-50 overflow-y-auto"
            style={{ maxWidth: '540px', margin: '2rem auto' }}
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
                  style={{ fontSize: 'clamp(0.5rem, 2.5vw, 0.7rem)', color: 'var(--amber-lt)' }}
                >
                  ? HOW TO PLAY
                </span>
                <button
                  onClick={onClose}
                  className="pixel-btn pixel-btn-secondary"
                  style={{ fontSize: '0.5rem', padding: '0.4rem 0.75rem', minHeight: '44px' }}
                  aria-label="Close how to play"
                >
                  X CLOSE
                </button>
              </div>

              {/* Sections */}
              {SECTIONS.map((section, si) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * si }}
                  className="mb-5"
                >
                  <div
                    className="pixel-font mb-2 flex items-center gap-2"
                    style={{ fontSize: 'clamp(0.38rem, 1.8vw, 0.5rem)', color: 'var(--amber-lt)' }}
                  >
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </div>

                  {section.items && (
                    <ul className="flex flex-col gap-1.5 pl-1">
                      {section.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2"
                          style={{ fontSize: 'clamp(0.65rem, 2vw, 0.8rem)', color: 'var(--text-main)' }}
                        >
                          <span className="text-[var(--text-dim)] shrink-0 mt-0.5" style={{ fontSize: '0.5rem' }}>
                            *
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.shortcuts && (
                    <div className="flex flex-col gap-1.5 pl-1">
                      {section.shortcuts.map((sc, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2"
                          style={{ fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}
                        >
                          <kbd
                            className="pixel-font shrink-0 px-1.5 py-0.5"
                            style={{
                              fontSize: 'clamp(0.35rem, 1.5vw, 0.45rem)',
                              background: '#1a1a2a',
                              color: 'var(--gold)',
                              border: '1px solid #2a2a3a',
                            }}
                          >
                            {sc.keys}
                          </kbd>
                          <span style={{ color: 'var(--text-dim)' }}>{sc.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Footer hint */}
              <div
                className="pixel-font text-center mt-4 pt-3 border-t border-[#2a2a3a]"
                style={{ fontSize: 'clamp(0.35rem, 1.5vw, 0.45rem)', color: 'var(--text-dim)' }}
              >
                Press ESC or tap outside to close
              </div>

              <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
