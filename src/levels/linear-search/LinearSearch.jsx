import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'linear-search'
const ARR_SIZE = 12

const DIALOG_LINES = [
  "* Byte has lost precious data in the Bazaar!",
  '* Linear Search checks each item from left to right, one at a time.',
  '* Click each box to reveal it. Find the target item!',
  '* The fewer unnecessary checks, the better your score.',
  '* Ready? Begin the search!',
]

function makeArray(n = ARR_SIZE) {
  const set = new Set()
  while (set.size < n) set.add(Math.floor(Math.random() * 50) + 1)
  return Array.from(set)
}

export default function LinearSearch() {
  const navigate = useNavigate()
  const { completeLevel, state } = useGame()
  const backDest = state.returnToRPG ? '/rpg' : '/'

  const [phase, setPhase] = useState('intro')
  const [arr, setArr] = useState(() => makeArray())
  const [target, setTarget] = useState(null)
  const [revealed, setRevealed] = useState(new Set())
  const [foundIdx, setFoundIdx] = useState(null)
  const [checks, setChecks] = useState(0)
  const [score, setScore] = useState(null)
  const [wrongFlash, setWrongFlash] = useState(null)

  function startChallenge(freshArr) {
    const a = freshArr ?? arr
    const targetIdx = Math.floor(Math.random() * a.length)
    setArr(a)
    setTarget(a[targetIdx])
    setRevealed(new Set())
    setFoundIdx(null)
    setChecks(0)
    setPhase('search')
  }

  const handleCheck = useCallback((idx) => {
    if (phase !== 'search' || revealed.has(idx) || foundIdx !== null) return

    const newRevealed = new Set(revealed)
    newRevealed.add(idx)
    setRevealed(newRevealed)
    setChecks(c => c + 1)

    if (arr[idx] === target) {
      setFoundIdx(idx)
      const targetPos = arr.indexOf(target)
      // Optimal is checking left-to-right up to targetPos+1 checks
      const optimal = targetPos + 1
      const newChecks = checks + 1
      const stars = newChecks <= optimal ? 3 : newChecks <= optimal + 2 ? 2 : 1
      const xp = 30 + stars * 17
      setScore({ stars, xp, checks: newChecks, optimal })
      completeLevel(LEVEL_ID, stars, xp)
      setTimeout(() => setPhase('score'), 1200)
    } else {
      setWrongFlash(idx)
      setTimeout(() => setWrongFlash(null), 400)
    }
  }, [phase, revealed, foundIdx, arr, target, checks, completeLevel])

  useEffect(() => {
    if (phase !== 'search') return
    const handler = (e) => {
      const num = parseInt(e.key)
      if (num >= 0 && num <= 9) {
        const idx = num === 0 ? 9 : num - 1
        if (idx < arr.length) handleCheck(idx)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, handleCheck, arr.length])

  function reset() {
    const fresh = makeArray()
    setArr(fresh)
    setTarget(null)
    setRevealed(new Set())
    setFoundIdx(null)
    setChecks(0)
    setScore(null)
    setWrongFlash(null)
    setPhase('intro')
  }

  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Linear Search"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Items checked', value: score.checks },
          { label: 'Optimal checks', value: score.optimal },
          { label: 'Array size', value: ARR_SIZE },
        ]}
        onRetry={reset}
        onNext={() => navigate(state.returnToRPG ? '/approach' : '/')}
        nextLabel={state.returnToRPG ? 'APPROACH \u25B6' : '\u2190 HOME'}
        onHome={() => navigate(backDest)}
      />
    )
  }

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
          LINEAR SEARCH
        </div>
        {checks > 0 ? (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">CHECKS {checks}</div>
        ) : <div className="w-16" />}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-2xl mx-auto w-full">

        {/* Target display */}
        {target !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 py-2"
          >
            <span className="text-[#6b6b7a]" style={{ fontSize: 'clamp(0.6rem, 2.5vw, 0.85rem)' }}>
              Find:
            </span>
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="pixel-font text-[#e8645a] text-glow-coral"
              style={{ fontSize: 'clamp(0.8rem, 4vw, 1.2rem)' }}
            >
              {target}
            </motion.span>
          </motion.div>
        )}

        {/* Array boxes */}
        {phase !== 'intro' && (
          <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
            {arr.map((val, idx) => {
              const isRevealed = revealed.has(idx)
              const isFound = idx === foundIdx
              const isWrong = wrongFlash === idx

              let bg = '#1a1a2a'
              let border = '#2a2a3a'
              let textColor = 'transparent'

              if (isFound) { bg = '#22c55e'; border = '#22c55e'; textColor = '#000' }
              else if (isWrong) { bg = '#3a1a1a'; border = '#e8645a'; textColor = '#e8645a' }
              else if (isRevealed) { bg = '#1e1e3a'; border = '#3a3a5c'; textColor = '#6b6b7a' }
              else { bg = '#1a1a2a'; border = '#3a3a5c'; textColor = 'transparent' }

              const clickable = !isRevealed && foundIdx === null && phase === 'search'

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleCheck(idx)}
                  disabled={!clickable}
                  animate={{
                    scale: isFound ? [1, 1.25, 1] : isWrong ? [1, 0.9, 1] : 1,
                    backgroundColor: bg,
                    borderColor: border,
                  }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center border-2"
                  style={{
                    width: 'clamp(36px, 7vw, 52px)',
                    height: 'clamp(42px, 8vw, 58px)',
                    cursor: clickable ? 'pointer' : 'default',
                  }}
                >
                  {isRevealed || isFound ? (
                    <span className="font-bold tabular-nums" style={{ color: textColor, fontSize: 'clamp(0.6rem, 2.5vw, 0.9rem)' }}>
                      {val}
                    </span>
                  ) : (
                    <span style={{ fontSize: 'clamp(0.6rem, 2.5vw, 0.9rem)' }}>?</span>
                  )}
                  <span className="tabular-nums" style={{ color: '#4a4a5a', fontSize: 'clamp(0.3rem, 1.2vw, 0.4rem)' }}>
                    {idx}
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Found celebration */}
        {foundIdx !== null && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="pixel-font text-[#22c55e] text-glow-green" style={{ fontSize: 'clamp(0.6rem, 3vw, 0.9rem)' }}>
              \u2605 FOUND IN {checks} CHECK{checks !== 1 ? 'S' : ''}! \u2605
            </div>
          </motion.div>
        )}

        {/* Instruction */}
        {phase === 'search' && foundIdx === null && (
          <div className="pixel-dialog pointer-events-none">
            <p className="text-sm">
              Click boxes to reveal them. Search for{' '}
              <span className="text-[#e8645a] font-bold">{target}</span> from left to right!
            </p>
            <p className="text-[#6b6b7a] text-xs mt-1">
              Tip: Linear search checks sequentially — fewer skips = better score.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="BYTE"
                onDone={() => startChallenge()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
