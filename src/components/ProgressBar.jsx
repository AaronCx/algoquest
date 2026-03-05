export default function ProgressBar({
  current,
  max,
  label = 'HP',
  color = '#ff6b6b',
  showNumbers = true,
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0

  return (
    <div className="hp-bar-wrap">
      <span className="pixel-font text-[0.5rem] sm:text-[0.6rem] text-[#f0e6d3] shrink-0 w-6 sm:w-8">
        {label}
      </span>
      <div className="hp-bar-track flex-1">
        <div
          className="hp-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showNumbers && (
        <span className="pixel-font text-[0.45rem] sm:text-[0.55rem] text-[#f0e6d3] shrink-0 tabular-nums">
          {current}/{max}
        </span>
      )}
    </div>
  )
}
