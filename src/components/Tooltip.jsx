import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'

export default function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false)

  const posStyles = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
    left:   { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' },
    right:  { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' },
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 pointer-events-none"
            style={{
              ...posStyles[position],
              whiteSpace: 'nowrap',
              maxWidth: '260px',
            }}
          >
            <div
              className="pixel-font"
              style={{
                fontSize: 'clamp(0.32rem, 1.5vw, 0.42rem)',
                background: 'var(--bg-dialog)',
                color: 'var(--gold)',
                border: '2px solid var(--amber-lt)',
                padding: '0.4rem 0.6rem',
                boxShadow: '3px 3px 0 rgba(0,0,0,0.6)',
                lineHeight: 1.6,
                whiteSpace: 'normal',
              }}
            >
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
