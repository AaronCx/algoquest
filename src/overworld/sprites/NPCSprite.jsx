import {
  WandererSprite,
  InvariantSprite,
  StackSprite,
  ByteSprite,
  ThreadSprite,
  ProfilerSprite,
  NullNurseSprite,
} from './npcShapes.jsx'

const NPC_SPRITE_MAP = {
  wanderer:   WandererSprite,
  invariant:  InvariantSprite,
  stack:      StackSprite,
  byte:       ByteSprite,
  thread:     ThreadSprite,
  profiler:   ProfilerSprite,
  null_nurse: NullNurseSprite,
}

// Stagger delays so NPCs don't all bob in sync
const IDLE_DELAYS = {
  wanderer:   '0s',
  invariant:  '0.4s',
  stack:      '0.8s',
  byte:       '1.2s',
  thread:     '0.2s',
  profiler:   '0.6s',
  null_nurse: '1.0s',
}

export default function NPCSprite({ npcId, isAdjacent }) {
  const Sprite = NPC_SPRITE_MAP[npcId]
  if (!Sprite) return null

  // width: 45% + aspectRatio 1:2 → height = 90% of tile height (tile is square)
  // Keeps NPC within the tile so CSS Grid rows don't expand beyond column width.
  return (
    <div
      style={{
        width: '45%',
        aspectRatio: '1 / 2',
        imageRendering: 'pixelated',
        filter: isAdjacent
          ? 'brightness(1.4) drop-shadow(0 0 2px #f59e0b)'
          : 'none',
        transition: 'filter 0.2s',
        animation: `npcIdle ${npcId === 'byte' ? '1.2s' : '2s'} ease-in-out infinite`,
        animationDelay: IDLE_DELAYS[npcId] || '0s',
      }}
    >
      <Sprite />
    </div>
  )
}
