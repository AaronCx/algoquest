import { useNavigate } from 'react-router-dom'
import { useGame } from '../../store/GameContext.jsx'

export default function QuickSort() {
  const navigate = useNavigate()
  const { state } = useGame()
  const returnDest = state.returnToRPG ? '/rpg' : '/'

  return (
    <div className="min-h-dvh page-bg flex flex-col items-center justify-center p-6 gap-6">
      <div className="pixel-font text-[0.55rem] text-[#6b6b7a] text-center">LV.4 — QUICK SORT</div>
      <div
        className="pixel-font text-[1rem] sm:text-[1.3rem] text-glow-amber text-center"
        style={{ color: '#f59e0b' }}
      >
        COMING SOON
      </div>
      <div className="pixel-dialog max-w-sm w-full text-center">
        <p className="text-sm leading-relaxed text-[#f0e6d3]">
          * The Partition Sage stirs in their slumber...
        </p>
        <p className="text-sm leading-relaxed text-[#6b6b7a] mt-2">
          Quick Sort is under construction. Check back in a future update!
        </p>
      </div>
      <button
        onClick={() => navigate(returnDest)}
        className="pixel-btn pixel-btn-secondary"
        style={{ fontSize: '0.5rem' }}
      >
        {state.returnToRPG ? '← BACK TO ADVENTURE' : '← HOME'}
      </button>
    </div>
  )
}
