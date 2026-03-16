import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'floyd-cycle'

const DIALOG_LINES = [
  "* The Loop Lake hides an infinite cycle...",
  "* Floyd's algorithm uses TWO pointers: a slow tortoise and a fast hare.",
  '* Tortoise moves 1 step. Hare moves 2 steps.',
  '* Click STEP to advance both pointers. When they meet, the cycle is detected!',
  '* Find the cycle in as few steps as possible!',
]

// Generate a linked list with a cycle
// Nodes: 0..n-1, with a cycle starting at cycleStart
function generateList() {
  const tailLen = 3 + Math.floor(Math.random() * 3) // 3-5 nodes before cycle
  const cycleLen = 3 + Math.floor(Math.random() * 4) // 3-6 nodes in cycle
  const total = tailLen + cycleLen
  const nodes = []
  for (let i = 0; i < total; i++) {
    nodes.push({ id: i, next: i + 1 < total ? i + 1 : tailLen, label: String.fromCharCode(65 + i) })
  }
  // Last node points back to cycleStart (= tailLen)
  nodes[total - 1].next = tailLen

  // Precompute when tortoise & hare meet
  let slow = 0, fast = 0, meetStep = 0
  do {
    slow = nodes[slow].next
    fast = nodes[nodes[fast].next].next
    meetStep++
  } while (slow !== fast)

  return { nodes, cycleStart: tailLen, meetStep, tailLen, cycleLen }
}

export default function FloydCycle() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')
  const [list] = useState(() => generateList())
  const [slow, setSlow] = useState(0)
  const [fast, setFast] = useState(0)
  const [steps, setSteps] = useState(0)
  const [met, setMet] = useState(false)
  const [score, setScore] = useState(null)
  const [trail, setTrail] = useState([])

  const handleStep = useCallback(() => {
    if (phase !== 'explore' || met) return

    const newSlow = list.nodes[slow].next
    const newFast = list.nodes[list.nodes[fast].next].next
    const newSteps = steps + 1

    setSlow(newSlow)
    setFast(newFast)
    setSteps(newSteps)
    setTrail(t => [...t, { step: newSteps, slow: newSlow, fast: newFast }])

    if (newSlow === newFast) {
      setMet(true)
      const stars = newSteps <= list.meetStep ? 3 : newSteps <= list.meetStep + 2 ? 2 : 1
      const xp = 55 + stars * 22
      setScore({ stars, xp, steps: newSteps })
      completeLevel(LEVEL_ID, stars, xp)
      setTimeout(() => setPhase('score'), 1500)
    }
  }, [phase, met, slow, fast, steps, list, completeLevel])

  // Keyboard: Space or Enter to step
  useEffect(() => {
    if (phase !== 'explore') return
    const handler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleStep()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, handleStep])

  function reset() {
    setSlow(0)
    setFast(0)
    setSteps(0)
    setMet(false)
    setScore(null)
    setTrail([])
    setPhase('intro')
  }

  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Floyd Cycle"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Steps to detect', value: score.steps },
          { label: 'Optimal steps', value: list.meetStep },
          { label: 'Cycle length', value: list.cycleLen },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : '/')}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : '\u2190 HOME'}
        onHome={() => navigate(backDest)}
      />
    )
  }

  // Node layout: arrange nodes in a line + loop shape
  const { nodes, cycleStart, tailLen, cycleLen } = list

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a2a]">
        <button
          onClick={() => navigate(backDest)}
          className="pixel-btn pixel-btn-secondary"
          style={{ fontSize: '0.5rem', padding: '0.45rem 0.7rem', minHeight: '36px' }}
        >
          {state.returnToRPG ? '\u2190 ADVENTURE' : '\u2190 HOME'}
        </button>
        <div className="pixel-font text-center" style={{ fontSize: 'clamp(0.4rem, 2vw, 0.6rem)', color: '#d97706' }}>
          FLOYD CYCLE DETECTION
        </div>
        {steps > 0 ? (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">STEP {steps}</div>
        ) : <div className="w-16" />}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Legend */}
        {phase === 'explore' && (
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { color: '#22c55e', label: '\uD83D\uDC22 Tortoise (slow)' },
              { color: '#e8645a', label: '\uD83D\uDC07 Hare (fast)' },
              { color: '#d97706', label: 'Both meet' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[#6b6b7a]" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Node visualization */}
        {phase !== 'intro' && (
          <div className="flex flex-col items-center gap-2">
            {/* Tail nodes (linear) */}
            <div className="flex items-center gap-1">
              {nodes.slice(0, tailLen).map((node, i) => {
                const isSlow = slow === node.id
                const isFast = fast === node.id
                const isBoth = isSlow && isFast

                let bg = '#1a1a2a'
                let border = '#2a2a3a'
                if (isBoth) { bg = '#d97706'; border = '#f59e0b' }
                else if (isSlow) { bg = '#1a2a1a'; border = '#22c55e' }
                else if (isFast) { bg = '#2a1a1a'; border = '#e8645a' }

                return (
                  <div key={node.id} className="flex items-center">
                    <motion.div
                      animate={{ backgroundColor: bg, borderColor: border, scale: isBoth && met ? [1, 1.2, 1] : 1 }}
                      className="flex items-center justify-center border-2 rounded"
                      style={{ width: '38px', height: '38px' }}
                    >
                      <span className="pixel-font text-[0.5rem]" style={{ color: isBoth ? '#000' : isSlow ? '#22c55e' : isFast ? '#e8645a' : '#6b6b7a' }}>
                        {node.label}
                      </span>
                    </motion.div>
                    {i < tailLen - 1 && <span className="text-[#3a3a4a] mx-0.5">\u2192</span>}
                  </div>
                )
              })}
              <span className="text-[#3a3a4a] mx-0.5">\u2192</span>
            </div>

            {/* Cycle nodes (loop-like display) */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <span className="text-[#d97706] text-xs">\u21B3</span>
              {nodes.slice(tailLen).map((node, i) => {
                const isSlow = slow === node.id
                const isFast = fast === node.id
                const isBoth = isSlow && isFast

                let bg = '#1a1a2a'
                let border = '#2a2a3a'
                if (isBoth) { bg = '#d97706'; border = '#f59e0b' }
                else if (isSlow) { bg = '#1a2a1a'; border = '#22c55e' }
                else if (isFast) { bg = '#2a1a1a'; border = '#e8645a' }

                return (
                  <div key={node.id} className="flex items-center">
                    <motion.div
                      animate={{ backgroundColor: bg, borderColor: border, scale: isBoth && met ? [1, 1.3, 1] : 1 }}
                      className="flex items-center justify-center border-2 rounded"
                      style={{ width: '38px', height: '38px' }}
                    >
                      <span className="pixel-font text-[0.5rem]" style={{ color: isBoth ? '#000' : isSlow ? '#22c55e' : isFast ? '#e8645a' : '#6b6b7a' }}>
                        {node.label}
                      </span>
                    </motion.div>
                    {i < cycleLen - 1 && <span className="text-[#3a3a4a] mx-0.5">\u2192</span>}
                  </div>
                )
              })}
              <span className="text-[#d97706] text-xs">\u21B0</span>
            </div>

            {/* Cycle indicator */}
            <div className="pixel-font text-[0.4rem] text-[#4a4a5a]">
              (last node \u2192 {nodes[cycleStart].label}, forming a cycle)
            </div>
          </div>
        )}

        {/* Met celebration */}
        {met && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="pixel-font text-[#d97706] text-glow-amber" style={{ fontSize: 'clamp(0.6rem, 3vw, 0.9rem)' }}>
              \u2605 CYCLE DETECTED AT NODE {nodes[slow].label}! \u2605
            </div>
          </motion.div>
        )}

        {/* Step button */}
        {phase === 'explore' && !met && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleStep}
              className="pixel-btn pixel-btn-primary w-full max-w-xs"
              style={{ fontSize: '0.55rem' }}
            >
              \u25B6 STEP (Tortoise +1, Hare +2)
            </button>
            <p className="text-center text-[#4a4a5a]" style={{ fontSize: 'clamp(0.45rem, 2vw, 0.6rem)' }}>
              Press <kbd className="bg-[#2a2a3a] px-1 rounded text-[#f0e6d3]">Space</kbd> to step
            </p>
          </div>
        )}

        {/* Pointer status */}
        {phase === 'explore' && (
          <div className="flex justify-center gap-6">
            <div className="text-xs">
              <span className="text-[#22c55e]">\uD83D\uDC22</span> Tortoise: <span className="pixel-font text-[0.45rem] text-[#22c55e]">{nodes[slow].label}</span>
            </div>
            <div className="text-xs">
              <span className="text-[#e8645a]">\uD83D\uDC07</span> Hare: <span className="pixel-font text-[0.45rem] text-[#e8645a]">{nodes[fast].label}</span>
            </div>
          </div>
        )}

        {/* Trail history */}
        {trail.length > 0 && (
          <div className="flex flex-col gap-0.5 max-h-20 overflow-y-auto">
            {trail.slice(-5).map((t, i) => (
              <div key={i} className="flex justify-between text-xs text-[#4a4a5a] px-1">
                <span>Step {t.step}</span>
                <span>\uD83D\uDC22 {nodes[t.slow].label}</span>
                <span>\uD83D\uDC07 {nodes[t.fast].label}</span>
                <span>{t.slow === t.fast ? '\uD83D\uDCA5 MET!' : ''}</span>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="PACT STONE"
                onDone={() => setPhase('explore')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
