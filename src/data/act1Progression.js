// ── Act 1 Progression Helpers ─────────────────────────────────────────────────
// Quest completion is tracked via completedEncounters in rpgFlags.

export const QUESTS = [
  {
    id: 'q0',
    name: 'Awakening',
    desc: 'Speak with the Old Wanderer in Heap Meadow.',
    done: () => true, // always considered started
  },
  {
    id: 'q1',
    name: 'Stack Gate',
    desc: 'Prove stack discipline to Capt. Stack.',
    done: flags => flags.completedEncounters.includes('stack_discipline'),
  },
  {
    id: 'q2',
    name: "Byte's Search",
    desc: "Help Byte find lost data using Linear Search.",
    done: flags => flags.completedEncounters.includes('linear_search'),
  },
  {
    id: 'q3',
    name: 'Sorting Yard',
    desc: 'Restore order for Marshal Thread.',
    done: flags => flags.completedEncounters.includes('selection_sort'),
  },
  {
    id: 'q4',
    name: 'GCD Shrine',
    desc: "Pass Profiler V's Euclid trial.",
    done: flags => flags.completedEncounters.includes('euclid_gcd'),
  },
  {
    id: 'q5',
    name: 'Cycle Trial',
    desc: 'Face the Loop Lake with Floyd\'s algorithm.',
    done: flags => flags.completedEncounters.includes('floyd_cycle'),
  },
  {
    id: 'q6',
    name: 'BFS Rescue',
    desc: 'Complete the final rescue in the Queue Chapel.',
    done: flags => flags.completedEncounters.includes('bfs_rescue'),
  },
]

export function getQuestProgress(flags) {
  return QUESTS.map(q => ({ ...q, completed: q.done(flags) }))
}

export function isAct1Complete(flags) {
  return flags.completedEncounters.includes('bfs_rescue')
}

// ── Encounter → Story level unlocks (driven by shared registry) ──────────────
import { ENCOUNTER_LEVEL_UNLOCKS } from './levels/index.js'
export const ENCOUNTER_UNLOCKS = {
  ...ENCOUNTER_LEVEL_UNLOCKS,
  mentor_battle: ['quick-sort'], // legacy v2 unlock
}
