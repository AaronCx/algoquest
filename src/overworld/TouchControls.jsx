import { useRef, useCallback } from 'react'

// ── Individual D-pad button ───────────────────────────────────────────────
function DPadBtn({ label, dx, dy, onMove }) {
  const repeatRef = useRef(null)

  const startRepeat = useCallback(() => {
    onMove(dx, dy)
    repeatRef.current = setInterval(() => onMove(dx, dy), 160)
  }, [dx, dy, onMove])

  const stopRepeat = useCallback(() => {
    clearInterval(repeatRef.current)
    repeatRef.current = null
  }, [])

  return (
    <button
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startRepeat() }}
      onPointerUp={stopRepeat}
      onPointerLeave={stopRepeat}
      onPointerCancel={stopRepeat}
      aria-label={label}
      style={{ touchAction: 'none', WebkitUserSelect: 'none' }}
      className="w-[44px] h-[44px] flex items-center justify-center bg-[#1a1a28] border-2 border-[#2a2a3a] active:bg-[#2a2a3a] pixel-font text-[0.6rem] text-[#6b6b7a] select-none"
    >
      {label === 'up' ? '▲' : label === 'down' ? '▼' : label === 'left' ? '◄' : '►'}
    </button>
  )
}

// ── D-pad (3×3 grid layout) ───────────────────────────────────────────────
function DPad({ onMove }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 44px)',
        gridTemplateRows: 'repeat(3, 44px)',
        gap: '3px',
        touchAction: 'none',
      }}
    >
      {/* Row 0 */}
      <div />
      <DPadBtn label="up"    dx={0}  dy={-1} onMove={onMove} />
      <div />
      {/* Row 1 */}
      <DPadBtn label="left"  dx={-1} dy={0}  onMove={onMove} />
      <div className="bg-[#111120] border-2 border-[#2a2a3a]" />
      <DPadBtn label="right" dx={1}  dy={0}  onMove={onMove} />
      {/* Row 2 */}
      <div />
      <DPadBtn label="down"  dx={0}  dy={1}  onMove={onMove} />
      <div />
    </div>
  )
}

// ── A button ──────────────────────────────────────────────────────────────
function AButton({ onAction }) {
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onAction() }}
      aria-label="Action (A)"
      style={{
        touchAction: 'none',
        WebkitUserSelect: 'none',
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'var(--coral, #e8645a)',
        border: '4px solid #7f1d1d',
        boxShadow: '0 4px 0 #7f1d1d',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      className="pixel-font text-[0.6rem] active:translate-y-1 active:shadow-none transition-transform"
    >
      A
    </button>
  )
}

// ── Full controls bar ─────────────────────────────────────────────────────
export default function TouchControls({ onMove, onAction }) {
  return (
    <div
      className="flex items-center justify-between px-5 bg-[#0a0a0f] border-t-2 border-[#1a1a2a]"
      style={{
        height: 'max(130px, calc(110px + env(safe-area-inset-bottom)))',
        paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <DPad onMove={onMove} />
      <div className="flex flex-col items-center gap-1">
        <AButton onAction={onAction} />
        <span className="pixel-font text-[0.35rem] text-[#6b6b7a]">ACTION</span>
      </div>
    </div>
  )
}
