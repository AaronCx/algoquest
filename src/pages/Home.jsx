import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../store/GameContext.jsx'
import { LEVELS } from '../store/gameStore.js'
import LevelCard from '../components/LevelCard.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import SettingsModal from '../components/SettingsModal.jsx'

const MAX_XP = LEVELS.reduce((sum, l) => sum + (l.xpReward || 0), 0)

const TITLE_LINES = ['ALGO', 'QUEST']

export default function Home() {
  const navigate = useNavigate()
  const { state } = useGame()
  const completedCount = state.completedLevels.length
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-dvh page-bg flex flex-col overflow-x-hidden">

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* ── Header / Title ── */}
      <header className="flex flex-col items-center pt-8 pb-4 px-4 gap-3">
        {/* Top-right actions */}
        <div className="self-end mb-1 flex gap-2">
          <button
            onClick={() => navigate(state.hasSeenIntro ? '/rpg' : '/intro')}
            className="pixel-btn pixel-btn-coral"
            style={{ fontSize: '0.45rem', padding: '0.4rem 0.7rem', minHeight: '36px' }}
            aria-label="RPG Mode"
          >
            ♥ RPG MODE
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="pixel-btn pixel-btn-secondary"
            style={{ fontSize: '0.45rem', padding: '0.4rem 0.7rem', minHeight: '36px' }}
            aria-label="Open settings"
          >
            ⚙ SETTINGS
          </button>
        </div>
        {/* Pixel art title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
        >
          <div
            className="pixel-font text-glow-amber title-algo select-none text-center leading-loose"
            style={{ fontSize: 'clamp(1.4rem, 8vw, 3rem)' }}
          >
            ALGO
          </div>
          <div
            className="pixel-font text-glow-coral title-quest select-none text-center leading-loose -mt-2"
            style={{ fontSize: 'clamp(1.4rem, 8vw, 3rem)' }}
          >
            QUEST
          </div>

          {/* Decorative pixel corners */}
          <div className="absolute -top-2 -left-4 w-3 h-3 bg-[#f59e0b] opacity-60" />
          <div className="absolute -top-2 -right-4 w-3 h-3 bg-[#f59e0b] opacity-60" />
          <div className="absolute -bottom-2 -left-4 w-3 h-3 bg-[#e8645a] opacity-60" />
          <div className="absolute -bottom-2 -right-4 w-3 h-3 bg-[#e8645a] opacity-60" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pixel-font text-center text-[#6b6b7a]"
          style={{ fontSize: 'clamp(0.38rem, 2vw, 0.55rem)' }}
        >
          LEARN ALGORITHMS THROUGH ADVENTURE
        </motion.p>
      </header>

      {/* ── Player status panel ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-auto w-full max-w-md px-4 mb-2"
      >
        <div className="pixel-border-amber card-bg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="pixel-font text-[0.5rem] sm:text-[0.6rem] text-[#d97706]">
              ♥ PLAYER
            </div>
            <div className="pixel-font text-[0.4rem] sm:text-[0.5rem] text-[#6b6b7a]">
              {completedCount}/{LEVELS.length} CLEARED
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <ProgressBar
              current={state.xp}
              max={MAX_XP}
              label="XP"
              color="#d97706"
            />
            <ProgressBar
              current={completedCount}
              max={LEVELS.length}
              label="LV"
              color="#22c55e"
              showNumbers={false}
            />
          </div>

          {/* XP number big display */}
          <div className="flex justify-end mt-2">
            <span className="pixel-font text-[0.6rem] text-[#fbbf24]">
              {state.xp} XP TOTAL
            </span>
          </div>
        </div>
      </motion.section>

      {/* ── Marquee divider ── */}
      <div className="overflow-hidden whitespace-nowrap py-2 border-y border-[#1a1a2a] mb-2">
        <div
          className="pixel-font text-[0.4rem] text-[#2a2a4a] inline-block"
          style={{ animation: 'marquee 20s linear infinite' }}
        >
          {'  ★ SORT ★ SEARCH ★ TRAVERSE ★ CONQUER ★ SORT ★ SEARCH ★ TRAVERSE ★ CONQUER ★ SORT ★ SEARCH ★ TRAVERSE ★ CONQUER  '}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }`}</style>
      </div>

      {/* ── Level Select ── */}
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="pixel-font text-[0.5rem] sm:text-[0.6rem] text-[#6b6b7a] mb-3 text-center">
            ─── SELECT LEVEL ───
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {LEVELS.map((level, i) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
              >
                <LevelCard level={level} index={i} />
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-4 mt-6 flex-wrap"
          >
            {[
              { color: '#f59e0b', label: 'Unlocked' },
              { color: '#22c55e', label: 'Completed' },
              { color: '#2a2a3a', label: 'Locked' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 border-2" style={{ borderColor: color }} />
                <span className="text-[#6b6b7a] text-xs">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-3 border-t border-[#1a1a2a]">
        <p className="pixel-font text-[0.38rem] text-[#2a2a3a]">
          ALGOQUEST v1.0 — BUILT WITH ♥ AND REACT
        </p>
      </footer>
    </div>
  )
}
