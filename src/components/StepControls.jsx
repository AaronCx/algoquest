import { useGame } from '../store/GameContext.jsx'

/**
 * StepControls — overlay for step-by-step algorithm mode.
 *
 * Props:
 *   isPlaying      — whether the auto-animation is running
 *   onPlayPause    — toggle play/pause
 *   onNextStep     — advance one step (only when paused)
 *   currentStep    — current step number (1-based)
 *   totalSteps     — total number of steps (0 if unknown)
 *   stepDescription — text describing the current step (optional)
 */
export default function StepControls({
  isPlaying = false,
  onPlayPause,
  onNextStep,
  currentStep = 0,
  totalSteps = 0,
  stepDescription = '',
}) {
  const { stepMode, animationSpeed } = useGame()

  // Only render when step mode is enabled
  if (!stepMode) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pixel-border card-bg p-3"
      style={{ borderColor: '#d97706' }}
    >
      {/* Step description */}
      {stepDescription && (
        <div
          className="pixel-font mb-2 text-center"
          style={{ fontSize: 'clamp(0.38rem, 1.8vw, 0.5rem)', color: '#f0e6d3', lineHeight: 1.6 }}
        >
          {stepDescription}
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center justify-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          className="pixel-btn pixel-btn-secondary"
          style={{ fontSize: '0.5rem', padding: '0.4rem 0.75rem', minHeight: '40px' }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
        </button>

        {/* Next Step — only when paused */}
        <button
          onClick={onNextStep}
          disabled={isPlaying}
          className="pixel-btn pixel-btn-coral"
          style={{
            fontSize: '0.5rem',
            padding: '0.4rem 0.75rem',
            minHeight: '40px',
            opacity: isPlaying ? 0.4 : 1,
            cursor: isPlaying ? 'not-allowed' : 'pointer',
          }}
          aria-label="Next step"
        >
          ▶▶ NEXT
        </button>
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span
          className="pixel-font tabular-nums"
          style={{ fontSize: 'clamp(0.35rem, 1.5vw, 0.45rem)', color: '#d97706' }}
        >
          STEP {currentStep}{totalSteps > 0 ? ` OF ${totalSteps}` : ''}
        </span>

        <span
          className="pixel-font"
          style={{ fontSize: 'clamp(0.35rem, 1.5vw, 0.45rem)', color: '#6b6b7a' }}
        >
          SPEED: {animationSpeed}x
        </span>
      </div>
    </motion.div>
  )
}
