import { useState, useEffect, useRef } from 'react'

export default function DialogBox({
  lines = [],
  onDone,
  speaker = 'MENTOR',
  speed = 28,
}) {
  const [lineIdx, setLineIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [lineComplete, setLineComplete] = useState(false)
  const timerRef = useRef(null)

  const currentLine = lines[lineIdx] ?? ''

  // Typewriter effect
  useEffect(() => {
    setDisplayed('')
    setLineComplete(false)
    let i = 0
    timerRef.current = setInterval(() => {
      i++
      setDisplayed(currentLine.slice(0, i))
      if (i >= currentLine.length) {
        clearInterval(timerRef.current)
        setLineComplete(true)
      }
    }, speed)
    return () => clearInterval(timerRef.current)
  }, [lineIdx, currentLine, speed])

  function handleAdvance() {
    if (!lineComplete) {
      // Skip to end of current line
      clearInterval(timerRef.current)
      setDisplayed(currentLine)
      setLineComplete(true)
      return
    }
    const next = lineIdx + 1
    if (next >= lines.length) {
      onDone?.()
    } else {
      setLineIdx(next)
    }
  }

  const isLast = lineIdx === lines.length - 1

  return (
    <div
      className="pixel-dialog select-none"
      onClick={handleAdvance}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleAdvance()}
      tabIndex={0}
      role="button"
      aria-label="Advance dialog"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="pixel-font text-[#d97706] text-[0.5rem] sm:text-[0.6rem]">
          ★ {speaker}
        </span>
        <span className="text-[#6b6b7a] text-[0.5rem]">[{lineIdx + 1}/{lines.length}]</span>
      </div>

      <p className="text-sm sm:text-base leading-relaxed min-h-[3em]">
        {displayed}
        {!lineComplete && (
          <span className="animate-blink text-[#d97706] ml-0.5">█</span>
        )}
      </p>

      {lineComplete && (
        <div className="flex justify-end mt-2">
          <span className="animate-blink text-[#d97706] text-sm">
            {isLast ? '[ TAP TO START ]' : '▼'}
          </span>
        </div>
      )}
    </div>
  )
}
