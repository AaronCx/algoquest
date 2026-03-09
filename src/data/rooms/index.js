// ── Tile constants ──────────────────────────────────────────────────────────
export const T = {
  FLOOR:  0,   // basic dark floor (fallback)
  WALL:   1,   // solid stone wall
  DOOR:   2,   // door / passage (walkable)
  GRASS:  3,   // outdoor grass (walkable)
  TREE:   4,   // dense tree / foliage (solid)
  WATER:  5,   // lake / river water (solid)
  STONE:  6,   // cobblestone path / courtyard (walkable)
  WOOD:   7,   // warm plank floor (walkable)
  PILLAR: 8,   // stone pillar / column (solid)
  CARPET: 9,   // woven carpet / rug (walkable)
  SHRINE: 10,  // mystical shrine tile (walkable)
  CLIFF:  11,  // sheer cliff drop-off (solid)
}

// ── Tile character map ───────────────────────────────────────────────────────
const TILE_CHARS = {
  '.': T.FLOOR,  '#': T.WALL,  'D': T.DOOR,
  'g': T.GRASS,  'T': T.TREE,  '~': T.WATER,
  's': T.STONE,  'w': T.WOOD,  'p': T.PILLAR,
  'c': T.CARPET, 'M': T.SHRINE,'^': T.CLIFF,
}

function tiles(str) {
  return str.trim().split('\n').flatMap(row =>
    row.trim().split('').map(c => TILE_CHARS[c] ?? T.FLOOR)
  )
}

// ── NPC registry ────────────────────────────────────────────────────────────
export const NPCS = {
  wanderer:   { id: 'wanderer',   emoji: '🧙', name: 'Old Wanderer',    dialogId: 'wanderer_intro'   },
  invariant:  { id: 'invariant',  emoji: '📜', name: 'Prof. Invariant', dialogId: 'invariant_intro'  },
  stack:      { id: 'stack',      emoji: '🗡️',  name: 'Capt. Stack',    dialogId: 'stack_intro'      },
  byte:       { id: 'byte',       emoji: '🐣', name: 'Byte',            dialogId: 'byte_intro'       },
  thread:     { id: 'thread',     emoji: '⚔️',  name: 'Marshal Thread', dialogId: 'thread_intro'     },
  profiler:   { id: 'profiler',   emoji: '⚖️',  name: 'Profiler V',     dialogId: 'profiler_intro'   },
  null_nurse: { id: 'null_nurse', emoji: '🌿', name: 'Nurse Null',      dialogId: 'null_nurse_intro' },
}

// ── Room definitions ─────────────────────────────────────────────────────────
// Grid: 11 cols × 8 rows
// Canonical door positions: N=(5,0), S=(5,7), E=(10,y), W=(0,y)
//
// Faction zones:
//   Wanderer Meadow  (r1, r9)  — GRASS + TREE + STONE paths
//   Scholar Camp     (r2, r8)  — WOOD floor + CARPET + PILLARs
//   Garrison Citadel (r3, r5)  — STONE courtyard + PILLARs + WALLs
//   Merchant Bazaar  (r4, r10) — WOOD market + PILLAR stalls + CARPET
//   Mystic Shrine    (r6)      — STONE + SHRINE + PILLAR altars
//   Loop Lake        (r7)      — GRASS + STONE + WATER (non-walkable)
//   Cliff Overlook   (r9)      — CLIFF + GRASS platform + STONE path

export const ROOMS = {

  // ── R1: Heap Meadow ─────────────────────────────────────────────────────
  // Lush forest clearing — the player's starting ground.
  // Tree canopy frames the space; a stone path winds south toward the gate.
  r1: {
    id: 'r1', name: 'Heap Meadow',
    cols: 11, rows: 8,
    tiles: tiles(`
TTTTTTTTTTT
TgggggggggT
TgggggggggT
TgggggggggT
TgggggggggT
TgggsssgggT
TggggsggggT
TTTTTDTTTTT`),
    playerStart: { x: 5, y: 3 },
    npcs: [
      { id: 'wanderer', x: 3, y: 3 },
    ],
    interactables: [
      { id: 'sign_meadow', x: 8, y: 2, emoji: '📋', dialogId: 'sign_meadow' },
    ],
    doors: [
      { x: 5, y: 7, toRoom: 'r2', toX: 5, toY: 1 },
    ],
    triggers: [],
  },

  // ── R2: Proof Camp ──────────────────────────────────────────────────────
  // The scholars' study hall — warm wood floors, stone pillars, carpet alcoves.
  // Prof. Invariant holds court at the central reading table.
  r2: {
    id: 'r2', name: 'Proof Camp',
    cols: 11, rows: 8,
    tiles: tiles(`
#####D#####
#wwwwwwwww#
#wwpwwwpww#
#wwwcccwww#
#wwwcccwww#
#wwpwwwpww#
#wwwwwwwww#
#####D#####`),
    playerStart: { x: 5, y: 1 },
    npcs: [
      { id: 'invariant', x: 4, y: 3 },
    ],
    interactables: [
      { id: 'sign_proof', x: 8, y: 5, emoji: '📌', dialogId: 'sign_proof' },
    ],
    doors: [
      { x: 5, y: 0, toRoom: 'r1', toX: 5, toY: 6 },
      { x: 5, y: 7, toRoom: 'r3', toX: 5, toY: 1 },
    ],
    triggers: [],
  },

  // ── R3: Stack Gate ──────────────────────────────────────────────────────
  // The garrison gatehouse — dark cobblestone, guard pillars, portcullis feel.
  // Capt. Stack holds the crossing; two locked gates guard the deeper world.
  r3: {
    id: 'r3', name: 'Stack Gate',
    cols: 11, rows: 8,
    tiles: tiles(`
#####D#####
#sssssssss#
#spsssspss#
#sssssssss#
#sssssssssD
#spsssspss#
#sssssssss#
#####D#####`),
    playerStart: { x: 5, y: 1 },
    npcs: [
      { id: 'stack', x: 7, y: 3 },
    ],
    interactables: [],
    doors: [
      { x: 5, y: 0, toRoom: 'r2', toX: 5, toY: 6 },
      {
        x: 10, y: 4, toRoom: 'r4', toX: 1, toY: 4,
        condition: flags => flags.completedEncounters.includes('stack_discipline'),
        lockedText: '* The east gate holds firm. Face Capt. Stack first.',
      },
      {
        x: 5, y: 7, toRoom: 'r5', toX: 5, toY: 1,
        condition: flags => flags.completedEncounters.includes('stack_discipline'),
        lockedText: '* The south path is blocked. Clear the Stack Gate first.',
      },
    ],
    triggers: [],
  },

  // ── R4: Lost & Found Bazaar ─────────────────────────────────────────────
  // The merchant quarter — warm wood stalls divided by stone pillars.
  // Byte the data-chick has wandered in looking for something lost.
  r4: {
    id: 'r4', name: "Lost & Found Bazaar",
    cols: 11, rows: 8,
    tiles: tiles(`
###########
#wwwwwwwww#
#wwpwwwpww#
#wwwwwwwww#
Dwwwwwwwww#
#wwwwwwwww#
#wwpwwwpww#
#####D#####`),
    playerStart: { x: 1, y: 4 },
    npcs: [
      { id: 'byte', x: 5, y: 3 },
    ],
    interactables: [
      { id: 'sign_bazaar', x: 8, y: 2, emoji: '🏪', dialogId: 'sign_bazaar' },
      { id: 'lost_item',   x: 2, y: 5, emoji: '✨', dialogId: 'lost_item'   },
    ],
    doors: [
      { x: 0, y: 4, toRoom: 'r3', toX: 9, toY: 4 },
      { x: 5, y: 7, toRoom: 'r6', toX: 5, toY: 1 },
    ],
    triggers: [],
  },

  // ── R5: Sorting Yard ────────────────────────────────────────────────────
  // The training ground — open stone courtyard with guard post pillars.
  // Marshal Thread drills recruits here; the east gate opens to the overlook.
  r5: {
    id: 'r5', name: 'Sorting Yard',
    cols: 11, rows: 8,
    tiles: tiles(`
#####D#####
#sssssssss#
#sssssssss#
#spsssspss#
#sssssssssD
#spsssspss#
#sssssssss#
###########`),
    playerStart: { x: 5, y: 1 },
    npcs: [
      { id: 'thread', x: 5, y: 4 },
    ],
    interactables: [
      { id: 'sign_yard', x: 1, y: 2, emoji: '⚡', dialogId: 'sign_yard' },
    ],
    doors: [
      { x: 5, y: 0, toRoom: 'r3', toX: 5, toY: 6 },
      { x: 10, y: 4, toRoom: 'r9', toX: 1, toY: 4 },
    ],
    triggers: [],
  },

  // ── R6: GCD Shrine ──────────────────────────────────────────────────────
  // Ancient mystical chamber — a cross of glowing shrine stones marks the altar.
  // Profiler V tends the trial; the east gate unlocks after the GCD blessing.
  r6: {
    id: 'r6', name: 'GCD Shrine',
    cols: 11, rows: 8,
    tiles: tiles(`
#####D#####
#sssssssss#
#ssssMssss#
#sssMMMsss#
#ssssMssssD
#ssssMssss#
#sssssssss#
###########`),
    playerStart: { x: 5, y: 1 },
    npcs: [
      { id: 'profiler', x: 8, y: 5 },
    ],
    interactables: [
      { id: 'shrine_gcd', x: 5, y: 3, emoji: '🔮', dialogId: 'shrine_gcd' },
    ],
    doors: [
      { x: 5, y: 0, toRoom: 'r4', toX: 5, toY: 6 },
      {
        x: 10, y: 4, toRoom: 'r7', toX: 1, toY: 4,
        condition: flags => flags.completedEncounters.includes('euclid_gcd'),
        lockedText: '* The eastern gate requires the GCD Blessing. Speak with Profiler V.',
      },
    ],
    triggers: [],
  },

  // ── R7: Loop Lake ───────────────────────────────────────────────────────
  // A haunted lakeside — dark water fills the eastern half; grass and stone
  // hug the western shore. The pact stone sits on a jutting promontory.
  r7: {
    id: 'r7', name: 'Loop Lake',
    cols: 11, rows: 8,
    tiles: tiles(`
#####D#####
#ggss~~~~~#
#ggss~~~~~#
#gssss~~~~#
Dggssss~~~#
#ggss~~~~~#
#ggsssgggg#
#####D#####`),
    playerStart: { x: 1, y: 4 },
    npcs: [],
    interactables: [
      { id: 'pact_stone', x: 5, y: 3, emoji: '💎', dialogId: 'pact_stone' },
      { id: 'sign_lake',  x: 8, y: 6, emoji: '📋', dialogId: 'sign_lake'  },
    ],
    doors: [
      { x: 0, y: 4, toRoom: 'r6', toX: 9, toY: 4 },
      {
        x: 5, y: 0, toRoom: 'r8', toX: 5, toY: 6,
        condition: flags => flags.completedEncounters.includes('floyd_cycle'),
        lockedText: '* The chapel path is sealed. Complete the Cycle Trial first.',
      },
      {
        x: 5, y: 7, toRoom: 'r10', toX: 5, toY: 1,
        condition: flags => flags.keyDecisions?.loopChoice === 'pact',
        lockedText: '* The pact gate is closed. The stone awaits your vow.',
      },
    ],
    triggers: [],
  },

  // ── R8: Queue Chapel ────────────────────────────────────────────────────
  // A peaceful healing hall — warm wood, a central carpet aisle, and twin
  // stone pillars frame the nave. Nurse Null tends the altar.
  r8: {
    id: 'r8', name: 'Queue Chapel',
    cols: 11, rows: 8,
    tiles: tiles(`
###########
#wwpwwwpww#
#wwwwcwwww#
#wwwwcwwww#
#wwwwcwwww#
#wwpwcwpww#
#wwwwcwwww#
#####D#####`),
    playerStart: { x: 5, y: 6 },
    npcs: [
      { id: 'null_nurse', x: 6, y: 3 },
    ],
    interactables: [
      { id: 'chapel_bell', x: 2, y: 2, emoji: '🔔', dialogId: 'chapel_bell' },
    ],
    doors: [
      { x: 5, y: 7, toRoom: 'r7', toX: 5, toY: 1 },
    ],
    triggers: [],
  },

  // ── R9: Shortcut Overlook ───────────────────────────────────────────────
  // A cliff-edge platform high above the valley — sheer drops on three sides,
  // a stone viewing path through the center. Breathtaking views east.
  r9: {
    id: 'r9', name: 'Shortcut Overlook',
    cols: 11, rows: 8,
    tiles: tiles(`
^^^^^^^^^^^
^gggggg^^^^
^gggggg^^^^
^gssssg^^^^
Dgssssg^^^^
^gssssg^^^^
^gggggg^^^^
^^^^^^^^^^^`),
    playerStart: { x: 1, y: 4 },
    npcs: [],
    interactables: [
      { id: 'vista_sign',    x: 5, y: 2, emoji: '🌄', dialogId: 'vista_sign'    },
      { id: 'shortcut_sign', x: 5, y: 5, emoji: '⚡', dialogId: 'shortcut_sign' },
    ],
    doors: [
      { x: 0, y: 4, toRoom: 'r5', toX: 9, toY: 4 },
    ],
    triggers: [],
  },

  // ── R10: Pact Aid Station ───────────────────────────────────────────────
  // A field hospital reached only through the pact — warm wood, healing
  // carpets, and pillar cots. Byte reappears here, reunited with their data.
  r10: {
    id: 'r10', name: 'Pact Aid Station',
    cols: 11, rows: 8,
    tiles: tiles(`
#####D#####
#wwwwwwwww#
#wpwcccwpw#
#wwwcccwww#
#wwwcccwww#
#wwwwwwwww#
#wpwwwwwpw#
###########`),
    playerStart: { x: 5, y: 1 },
    npcs: [
      { id: 'byte', x: 4, y: 5, dialogId: 'byte_r10' },
    ],
    interactables: [
      { id: 'aid_crate', x: 7, y: 5, emoji: '📦', dialogId: 'aid_crate' },
    ],
    doors: [
      { x: 5, y: 0, toRoom: 'r7', toX: 5, toY: 6 },
    ],
    triggers: [],
  },
}
