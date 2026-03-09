// ── Room tile constants ───────────────────────────────────────────────────
export const T = { FLOOR: 0, WALL: 1, DOOR: 2 }

// ── NPC definitions ───────────────────────────────────────────────────────
export const NPCS = {
  mentor:      { name: 'MENTOR',      emoji: '🧙', dialogId: 'mentor_start' },
  gatekeeper:  { name: 'GATEKEEPER',  emoji: '⚔️',  dialogId: 'gatekeeper_start' },
  sage:        { name: 'SAGE',        emoji: '📚', dialogId: 'sage_start' },
}

// ── Room definitions ──────────────────────────────────────────────────────
// Grid: 11 cols × 8 rows (0-indexed, x=col, y=row)
// Tiles listed left→right, top→bottom

export const ROOMS = {
  room1: {
    id: 'room1',
    name: 'The Crossroads',
    cols: 11,
    rows: 8,
    // prettier-ignore
    tiles: [
      1,1,1,1,1,1,1,1,1,1,1,  // row 0  (top wall)
      1,0,0,0,0,0,0,0,0,0,1,  // row 1
      1,0,0,1,1,0,0,0,0,0,1,  // row 2  (pillars)
      1,0,0,1,1,0,0,0,0,0,1,  // row 3
      1,0,0,0,0,0,0,0,0,0,1,  // row 4
      1,0,0,0,0,0,0,0,0,0,1,  // row 5
      1,0,0,0,0,0,0,0,0,0,1,  // row 6
      1,1,1,1,1,2,1,1,1,1,1,  // row 7  (door at col 5)
    ],
    npcs: [
      { id: 'mentor',     x: 7, y: 3 },
      { id: 'gatekeeper', x: 5, y: 6 },
    ],
    doors: [
      {
        x: 5, y: 7,
        toRoom: 'room2', toX: 5, toY: 1,
        condition: (flags) =>
          flags.completedEncounters.includes('mentor_battle') || flags.empathy >= 1,
        lockedText: '* The door is sealed. Prove yourself to the Mentor first.',
      },
    ],
    triggers: [],
    playerStart: { x: 1, y: 4 },
  },

  room2: {
    id: 'room2',
    name: 'Chamber of Reflection',
    cols: 11,
    rows: 8,
    // prettier-ignore
    tiles: [
      1,1,1,1,1,2,1,1,1,1,1,  // row 0  (door at col 5 → back to room1)
      1,0,0,0,0,0,0,0,0,0,1,  // row 1
      1,0,0,0,0,0,0,0,0,0,1,  // row 2
      1,0,1,1,0,0,0,0,0,0,1,  // row 3  (pillars)
      1,0,1,1,0,0,0,0,0,0,1,  // row 4
      1,0,0,0,0,0,0,0,0,0,1,  // row 5
      1,0,0,0,0,0,0,0,0,0,1,  // row 6
      1,1,1,1,1,1,1,1,1,1,1,  // row 7  (bottom wall)
    ],
    npcs: [
      { id: 'sage', x: 6, y: 4 },
    ],
    doors: [
      {
        x: 5, y: 0,
        toRoom: 'room1', toX: 5, toY: 6,
        condition: null,
        lockedText: null,
      },
    ],
    triggers: [
      { x: 9, y: 6, type: 'ending' },
    ],
    playerStart: { x: 5, y: 1 },
  },
}
