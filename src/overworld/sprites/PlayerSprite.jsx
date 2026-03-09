// ── Player pixel art sprite — 4 directions + smooth overlay ───────────────
// viewBox="0 0 8 16": each unit = 1 pixel. Hero wears a red tunic (#e8645a)
// to match the brand color, brown hair, dark pants, brown boots.

const SVG_PROPS = {
  viewBox: '0 0 8 16',
  xmlns: 'http://www.w3.org/2000/svg',
  style: { imageRendering: 'pixelated', width: '100%', height: '100%', overflow: 'visible' },
}

// ── Shared leg renders ─────────────────────────────────────────────────────
function LegsDown({ walkFrame }) {
  return walkFrame === 0 ? (
    // Idle: legs side by side
    <>
      <rect x="1" y="10" width="2" height="3" fill="#2a2a3a"/>
      <rect x="5" y="10" width="2" height="3" fill="#2a2a3a"/>
      <rect x="1" y="13" width="2" height="3" fill="#3a2510"/>
      <rect x="5" y="13" width="2" height="3" fill="#3a2510"/>
    </>
  ) : (
    // Stride: legs crossed mid-step
    <>
      <rect x="2" y="10" width="2" height="3" fill="#2a2a3a"/>
      <rect x="4" y="10" width="2" height="3" fill="#1e1e30"/>
      <rect x="1" y="13" width="3" height="3" fill="#3a2510"/>
      <rect x="5" y="13" width="2" height="2" fill="#2a1a08"/>
    </>
  )
}

function LegsUp({ walkFrame }) {
  return walkFrame === 0 ? (
    <>
      <rect x="1" y="10" width="2" height="3" fill="#2a2a3a"/>
      <rect x="5" y="10" width="2" height="3" fill="#2a2a3a"/>
      <rect x="1" y="13" width="2" height="3" fill="#3a2510"/>
      <rect x="5" y="13" width="2" height="3" fill="#3a2510"/>
    </>
  ) : (
    <>
      <rect x="2" y="10" width="2" height="3" fill="#2a2a3a"/>
      <rect x="4" y="10" width="2" height="3" fill="#1e1e30"/>
      <rect x="1" y="13" width="3" height="3" fill="#3a2510"/>
      <rect x="5" y="13" width="2" height="2" fill="#2a1a08"/>
    </>
  )
}

function LegsSide({ walkFrame }) {
  return walkFrame === 0 ? (
    // Neutral side: feet together
    <>
      <rect x="2" y="10" width="4" height="3" fill="#2a2a3a"/>
      <rect x="2" y="13" width="4" height="3" fill="#3a2510"/>
    </>
  ) : (
    <>
      <rect x="3" y="10" width="3" height="3" fill="#2a2a3a"/>
      <rect x="1" y="10" width="2" height="3" fill="#1e1e30"/>
      <rect x="4" y="13" width="3" height="3" fill="#3a2510"/>
      <rect x="1" y="13" width="2" height="2" fill="#2a1a08"/>
    </>
  )
}

// ── Hero Down (front-facing) ──────────────────────────────────────────────
function HeroDown({ walkFrame }) {
  return (
    <svg {...SVG_PROPS}>
      {/* Hair */}
      <rect x="2" y="0" width="4" height="1" fill="#5c3d1e"/>
      <rect x="1" y="1" width="6" height="1" fill="#5c3d1e"/>
      <rect x="1" y="2" width="1" height="3" fill="#5c3d1e"/>
      <rect x="6" y="2" width="1" height="3" fill="#5c3d1e"/>
      {/* Face */}
      <rect x="2" y="2" width="4" height="4" fill="#f5c5a3"/>
      {/* Eyes */}
      <rect x="2" y="3" width="1" height="1" fill="#2a1a0a"/>
      <rect x="5" y="3" width="1" height="1" fill="#2a1a0a"/>
      {/* Eye whites */}
      <rect x="2" y="2" width="1" height="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="5" y="2" width="1" height="1" fill="rgba(255,255,255,0.4)"/>
      {/* Nose */}
      <rect x="3" y="4" width="2" height="1" fill="#d4a080"/>
      {/* Mouth */}
      <rect x="3" y="5" width="2" height="1" fill="#c8826a"/>
      {/* Tunic */}
      <rect x="1" y="6" width="6" height="3" fill="#e8645a"/>
      <rect x="2" y="7" width="4" height="2" fill="#f07060"/>   {/* chest highlight */}
      {/* Belt */}
      <rect x="1" y="9" width="6" height="1" fill="#4a2a10"/>
      {/* Pants waist */}
      <rect x="1" y="10" width="6" height="0" fill="#2a2a3a"/>
      {/* Legs */}
      <LegsDown walkFrame={walkFrame} />
    </svg>
  )
}

// ── Hero Up (back view) ───────────────────────────────────────────────────
function HeroUp({ walkFrame }) {
  return (
    <svg {...SVG_PROPS}>
      {/* Back of head — all hair */}
      <rect x="1" y="0" width="6" height="5" fill="#5c3d1e"/>
      <rect x="2" y="0" width="4" height="1" fill="#7a5330"/>   {/* hair highlight */}
      {/* Neck */}
      <rect x="2" y="5" width="4" height="1" fill="#f5c5a3"/>
      {/* Tunic back */}
      <rect x="1" y="6" width="6" height="3" fill="#e8645a"/>
      <rect x="2" y="6" width="4" height="3" fill="#d05040"/>   {/* back slightly darker */}
      {/* Belt */}
      <rect x="1" y="9" width="6" height="1" fill="#4a2a10"/>
      {/* Legs */}
      <LegsUp walkFrame={walkFrame} />
    </svg>
  )
}

// ── Hero Left (side profile) ──────────────────────────────────────────────
function HeroLeft({ walkFrame }) {
  return (
    <svg {...SVG_PROPS}>
      {/* Hair — overhang to the left */}
      <rect x="2" y="0" width="4" height="1" fill="#5c3d1e"/>
      <rect x="1" y="1" width="5" height="2" fill="#5c3d1e"/>
      <rect x="1" y="3" width="2" height="2" fill="#5c3d1e"/>   {/* back of hair */}
      {/* Face profile — right half of head */}
      <rect x="3" y="2" width="3" height="4" fill="#f5c5a3"/>
      {/* Eye (single, facing left) */}
      <rect x="3" y="3" width="1" height="1" fill="#2a1a0a"/>
      <rect x="3" y="2" width="1" height="1" fill="rgba(255,255,255,0.4)"/> {/* specular */}
      {/* Nose nub */}
      <rect x="5" y="4" width="1" height="1" fill="#c8826a"/>
      {/* Ear */}
      <rect x="2" y="3" width="1" height="2" fill="#e8b090"/>
      {/* Mouth */}
      <rect x="4" y="5" width="2" height="1" fill="#c8826a"/>
      {/* Tunic side */}
      <rect x="2" y="6" width="4" height="3" fill="#e8645a"/>
      {/* Belt */}
      <rect x="2" y="9" width="4" height="1" fill="#4a2a10"/>
      {/* Legs side */}
      <LegsSide walkFrame={walkFrame} />
    </svg>
  )
}

// ── Hero Right — mirror of HeroLeft via CSS scaleX(-1) ───────────────────
function HeroRight({ walkFrame }) {
  return (
    <div style={{ transform: 'scaleX(-1)', width: '100%', height: '100%' }}>
      <HeroLeft walkFrame={walkFrame} />
    </div>
  )
}

// ── Direction map ─────────────────────────────────────────────────────────
const HERO_SPRITES = {
  down:  HeroDown,
  up:    HeroUp,
  left:  HeroLeft,
  right: HeroRight,
}

// ── PlayerSprite — absolutely-positioned overlay on top of the tile grid ──
// pos:       { x, y } in tile coordinates
// facing:    'down' | 'up' | 'left' | 'right'
// walkFrame: 0 (idle) | 1 (stride)
// isMoving:  bool — adds CSS body-bob animation
// room:      { cols, rows }
export default function PlayerSprite({ pos, facing, walkFrame, isMoving, room }) {
  const Sprite = HERO_SPRITES[facing] || HeroDown

  // Percentage positions: center X over tile, feet at tile bottom
  const left = `${((pos.x + 0.5) / room.cols) * 100}%`
  const top  = `${((pos.y + 1.0) / room.rows) * 100}%`

  // Sprite is 65% of tile-width wide, with 1:2 aspect ratio (8:16 px grid)
  const spriteW = `${(1 / room.cols) * 100 * 0.65}%`

  return (
    // Inset overlay covering the entire grid
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* Moving positioner — smooth CSS transition */}
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: spriteW,
          aspectRatio: '1 / 2',
          transform: 'translate(-50%, -100%)',
          transition: 'left 90ms linear, top 90ms linear',
          willChange: 'left, top',
          imageRendering: 'pixelated',
          // Body bob during movement
          animation: isMoving ? 'spriteWalk 160ms steps(2, end) infinite' : 'none',
        }}
      >
        <Sprite walkFrame={walkFrame} />
      </div>
    </div>
  )
}
