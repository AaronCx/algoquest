import { useNavigate } from 'react-router-dom'
import { isUnlocked } from '../store/gameStore.js'
import { useGame } from '../store/GameContext.jsx'

export default function LevelCard({ level, index, focused = false }) {
  const navigate = useNavigate()
  const { state } = useGame()
  const unlocked = isUnlocked(level.id, state.completedLevels, state.storyUnlockedLevels)
  const completed = state.completedLevels.includes(level.id)
  const stars = state.levelStars[level.id] || 0

  const statusClass = completed
    ? 'level-card-completed'
    : unlocked
    ? 'level-card-unlocked'
    : 'level-card-locked'

  function handleClick() {
    if (unlocked) navigate(level.route)
  }

  return (
    <div
      className={`level-card ${statusClass}`}
      onClick={handleClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      tabIndex={unlocked ? 0 : -1}
      role={unlocked ? 'button' : 'presentation'}
      aria-label={`${level.name} — ${completed ? 'completed' : unlocked ? 'play' : 'locked'}`}
      style={focused ? {
        outline: '3px solid #f59e0b',
        outlineOffset: '2px',
        boxShadow: '0 0 16px rgba(245,158,11,0.4)',
      } : undefined}
    >
      {/* Number badge */}
      <div className="absolute top-2 right-2 pixel-font text-[0.45rem] text-[#6b6b7a]">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Emoji icon */}
      <div className="text-2xl sm:text-3xl mb-1">{unlocked ? level.emoji : '🔒'}</div>

      {/* Title */}
      <div className={`pixel-font text-[0.55rem] sm:text-[0.7rem] leading-relaxed ${
        completed ? 'text-[#22c55e]' : unlocked ? 'text-[#f59e0b]' : 'text-[#4a4a5a]'
      }`}>
        {level.name}
      </div>

      {/* Type badge */}
      <div className="text-xs text-[#6b6b7a]">{level.type}</div>

      {/* Stars */}
      <div className="flex gap-1 mt-auto pt-1">
        {[1, 2, 3].map(s => (
          <span key={s} className={`text-sm ${s <= stars ? 'text-[#fbbf24]' : 'text-[#2a2a3a]'}`}>
            ★
          </span>
        ))}
      </div>

      {/* XP badge / locked hint */}
      {unlocked ? (
        <div className="pixel-font text-[0.4rem] text-[#6b6b7a] mt-1">
          +{level.xpReward} XP
        </div>
      ) : level.lockedHint ? (
        <div className="text-[0.6rem] text-[#4a4a5a] mt-1 leading-tight">
          {level.lockedHint}
        </div>
      ) : null}

      {/* Animated glow for unlocked/completed */}
      {unlocked && !completed && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(217,119,6,0.12) 0%, transparent 70%)' }}
        />
      )}
    </div>
  )
}
