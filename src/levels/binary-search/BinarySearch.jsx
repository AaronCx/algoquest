import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DialogBox from '../../components/DialogBox.jsx'
import ScoreScreen from '../../components/ScoreScreen.jsx'
import { useGame } from '../../store/GameContext.jsx'

const LEVEL_ID = 'binary-search'
const ARR_SIZE = 15

const DIALOG_LINES = [
  '* Greetings! I am the Library Sphinx, keeper of sorted knowledge.',
  '* Binary Search cuts the search space in HALF with each step.',
  '* We compare the middle element to our target.',
  '* If target is smaller — search LEFT half. If larger — search RIGHT half.',
  '* Find the target number in as few steps as possible!',
]

function makeSortedArray(n = ARR_SIZE) {
  const set = new Set()
  while (set.size < n) set.add(Math.floor(Math.random() * 99) + 1)
  return Array.from(set).sort((a, b) => a - b)
}

function calcStars(steps, optimal) {
  if (steps <= optimal) return 3
  if (steps <= optimal + 1) return 2
  return 1
}

export default function BinarySearch() {
  const navigate = useNavigate()
  const { completeLevel } = useGame()

  const [phase, setPhase] = useState('intro')
  const [arr, setArr] = useState(() => makeSortedArray())
  const [target, setTarget] = useState(null)
  const [low, setLow] = useState(0)
  const [high, setHigh] = useState(ARR_SIZE - 1)
  const [steps, setSteps] = useState(0)
  const [foundIdx, setFoundIdx] = useState(null)
  const [wrongAnim, setWrongAnim] = useState(false)
  const [score, setScore] = useState(null)
  const [midFlash, setMidFlash] = useState(false)
  const [history, setHistory] = useState([])

  const optimalSteps = Math.ceil(Math.log2(ARR_SIZE))
  const mid = Math.floor((low + high) / 2)

  function startChallenge(freshArr) {
    const a = freshArr ?? arr
    const targetIdx = Math.floor(Math.random() * a.length)
    setArr(a)
    setTarget(a[targetIdx])
    setLow(0)
    setHigh(a.length - 1)
    setSteps(0)
    setFoundIdx(null)
    setHistory([])
    setPhase('challenge')
  }

  // ── Handle player choice ───────────────────────────────────────────
  const handleChoice = useCallback((dir) => {
    if (phase !== 'challenge') return

    const currentMid = Math.floor((low + high) / 2)
    const midVal = arr[currentMid]

    setMidFlash(true)
    setTimeout(() => setMidFlash(false), 300)
    setSteps(s => s + 1)

    if (midVal === target) {
      setFoundIdx(currentMid)
      const s = calcStars(steps + 1, optimalSteps)
      const xp = 60 + s * 20
      setScore({ stars: s, xp, steps: steps + 1 })
      completeLevel(LEVEL_ID, s, xp)
      setTimeout(() => setPhase('score'), 1200)
      return
    }

    const correct = midVal < target ? 'right' : 'left'

    if (dir === 'check') {
      // Check mid first
      if (midVal === target) {
        setFoundIdx(currentMid)
      } else {
        setWrongAnim(false)
        setHistory(h => [...h, { low, high, mid: currentMid, midVal, dir: correct }])
        if (midVal < target) setLow(currentMid + 1)
        else setHigh(currentMid - 1)
      }
      return
    }

    const isCorrect = dir === correct

    if (!isCorrect) {
      setWrongAnim(true)
      setTimeout(() => setWrongAnim(false), 400)
    }

    setHistory(h => [...h, { low, high, mid: currentMid, midVal, dir, correct, wasCorrect: isCorrect }])

    // Always apply correct direction regardless
    if (midVal < target) setLow(currentMid + 1)
    else setHigh(currentMid - 1)
  }, [phase, low, high, arr, target, steps, optimalSteps, completeLevel])

  // Check if found after bounds update
  useEffect(() => {
    if (phase !== 'challenge' || target === null) return
    if (low > high) {
      // Target not found (shouldn't happen, but safety)
      const s = 1
      const xp = 60
      setScore({ stars: s, xp, steps })
      completeLevel(LEVEL_ID, s, xp)
      setTimeout(() => setPhase('score'), 800)
    }
  }, [low, high, phase, target])

  // Check if mid is the target after bounds update
  useEffect(() => {
    if (phase !== 'challenge' || target === null) return
    const currentMid = Math.floor((low + high) / 2)
    if (arr[currentMid] === target && low <= high) {
      setFoundIdx(currentMid)
      const s = calcStars(steps, optimalSteps)
      const xp = 60 + s * 20
      setScore({ stars: s, xp, steps })
      completeLevel(LEVEL_ID, s, xp)
      setTimeout(() => setPhase('score'), 1200)
    }
  }, [low, high])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'challenge') return
      if (e.key === 'ArrowLeft') handleChoice('left')
      if (e.key === 'ArrowRight') handleChoice('right')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, handleChoice])

  function reset() {
    const fresh = makeSortedArray()
    setArr(fresh)
    setTarget(null)
    setLow(0)
    setHigh(ARR_SIZE - 1)
    setSteps(0)
    setFoundIdx(null)
    setWrongAnim(false)
    setScore(null)
    setHistory([])
    setPhase('intro')
  }

  if (phase === 'score' && score) {
    return (
      <ScoreScreen
        levelName="Binary Search"
        stars={score.stars}
        xp={score.xp}
        stats={[
          { label: 'Steps taken',    value: score.steps },
          { label: 'Optimal steps',  value: optimalSteps },
          { label: 'Array size',     value: ARR_SIZE },
        ]}
        onRetry={reset}
        onNext={() => navigate('/level/bfs-maze')}
        onHome={() => navigate('/')}
      />
    )
  }

  const currentMid = Math.floor((low + high) / 2)

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a2a]">
        <button
          onClick={() => navigate('/')}
          className="pixel-btn pixel-btn-secondary"
          style={{ fontSize: '0.5rem', padding: '0.45rem 0.7rem', minHeight: '36px' }}
        >
          ← HOME
        </button>
        <div className="pixel-font text-center" style={{ fontSize: 'clamp(0.4rem, 2vw, 0.6rem)', color: '#d97706' }}>
          LV.2 — BINARY SEARCH
        </div>
        {steps > 0 && (
          <div className="pixel-font text-[0.45rem] text-[#6b6b7a]">
            STEP {steps}
          </div>
        )}
        {steps === 0 && <div className="w-16" />}
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
              Searching for:
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

        {/* Array visualization */}
        {phase !== 'intro' && (
          <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1">
            {arr.map((val, idx) => {
              const isInRange = idx >= low && idx <= high
              const isMid = idx === currentMid && foundIdx === null
              const isFound = idx === foundIdx
              const isEliminated = !isInRange && foundIdx === null

              let bg = '#1a1a2a'
              let border = '#2a2a3a'
              let textColor = '#3a3a4a'

              if (isFound) { bg = '#22c55e'; border = '#22c55e'; textColor = '#000' }
              else if (isMid && midFlash) { bg = '#e8645a'; border = '#e8645a'; textColor = '#fff' }
              else if (isMid) { bg = '#d97706'; border = '#f59e0b'; textColor = '#0a0a0f' }
              else if (isInRange) { bg = '#1e1e3a'; border = '#3a3a5c'; textColor = '#f0e6d3' }

              return (
                <motion.div
                  key={idx}
                  animate={{ scale: isFound ? [1, 1.25, 1] : 1, opacity: isEliminated ? 0.3 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                  style={{
                    width: 'clamp(28px, 6vw, 42px)',
                    height: 'clamp(34px, 7vw, 50px)',
                  }}
                >
                  <div
                    className="w-full flex-1 flex items-center justify-center border-2 transition-colors"
                    style={{ background: bg, borderColor: border }}
                  >
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: textColor, fontSize: 'clamp(0.5rem, 2.5vw, 0.8rem)' }}
                    >
                      {val}
                    </span>
                  </div>
                  <span
                    className="text-center tabular-nums"
                    style={{ color: '#4a4a5a', fontSize: 'clamp(0.35rem, 1.5vw, 0.5rem)' }}
                  >
                    {idx}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Range indicator */}
        {phase === 'challenge' && foundIdx === null && (
          <div className="flex justify-between px-1">
            <div className="pixel-font text-[0.45rem] text-[#4a4a6a]">
              LOW={low}
            </div>
            <div className="pixel-font text-[0.5rem] text-[#d97706]">
              MID={currentMid} → val={arr[currentMid]}
            </div>
            <div className="pixel-font text-[0.45rem] text-[#4a4a6a]">
              HIGH={high}
            </div>
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
              ★ FOUND IN {steps} STEP{steps !== 1 ? 'S' : ''}! ★
            </div>
          </motion.div>
        )}

        {/* Phase UIs */}
        <AnimatePresence mode="wait">

          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogBox
                lines={DIALOG_LINES}
                speaker="LIBRARY SPHINX"
                onDone={() => startChallenge()}
              />
            </motion.div>
          )}

          {phase === 'challenge' && foundIdx === null && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex flex-col gap-3 ${wrongAnim ? 'animate-shake' : ''}`}
            >
              {/* Status box */}
              <div className="pixel-dialog pointer-events-none">
                <p className="text-sm">
                  Middle element is{' '}
                  <span className="text-[#d97706] font-bold">{arr[currentMid]}</span>.
                  {' '}Target is{' '}
                  <span className="text-[#e8645a] font-bold">{target}</span>.
                </p>
                <p className="text-[#6b6b7a] text-xs mt-1">
                  Which half contains{' '}
                  <span className="text-[#fbbf24]">{target}</span>?
                </p>
              </div>

              {/* Direction buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChoice('left')}
                  className="pixel-btn pixel-btn-secondary w-full"
                >
                  ← LEFT HALF
                </button>
                <button
                  onClick={() => handleChoice('right')}
                  className="pixel-btn pixel-btn-primary w-full"
                >
                  RIGHT HALF →
                </button>
              </div>

              <p className="text-center text-[#4a4a5a]" style={{ fontSize: 'clamp(0.45rem, 2vw, 0.6rem)' }}>
                Arrow keys: ← left &nbsp;|&nbsp; right →
              </p>

              {/* History */}
              {history.length > 0 && (
                <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                  {history.slice(-3).map((h, i) => (
                    <div key={i} className="flex justify-between text-xs text-[#4a4a5a] px-1">
                      <span>Step {history.length - (history.slice(-3).length - 1 - i)}</span>
                      <span>mid[{h.mid}]={h.midVal}</span>
                      <span className={h.wasCorrect === false ? 'text-red-500' : 'text-[#22c55e]'}>
                        → {h.dir}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
