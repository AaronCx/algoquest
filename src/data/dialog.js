// ── Dialogue node system ──────────────────────────────────────────────────
// Each entry is a plain object OR a function(flags) => object.
// Node shape:
//   { speaker, text, choices?, next?, effects? }
// choices item: { label, next, effects? }
// effects: { empathy?, efficiency?, correctness?, startBattle?, closeOnDone? }

export const DIALOG = {
  // ── Mentor (room 1, col 7 row 3) ─────────────────────────────────────
  mentor_start: (flags) =>
    flags.completedEncounters.includes('mentor_battle')
      ? {
          speaker: 'MENTOR',
          text: '* You mastered Bubble Sort! You\'ve proven your worth. Seek the Gatekeeper to the south of this room.',
          next: null,
        }
      : {
          speaker: 'MENTOR',
          text: '* Ah, a seeker of knowledge! I guard the ancient art of sorting. Only those who pass my trial may venture deeper.',
          choices: [
            { label: 'I accept your challenge!', next: 'mentor_pre_battle', effects: { efficiency: 1 } },
            { label: 'Tell me more first.',       next: 'mentor_explain',    effects: { empathy: 1 } },
          ],
        },

  mentor_explain: {
    speaker: 'MENTOR',
    text: '* Bubble Sort compares adjacent elements and swaps them when they\'re out of order. Each pass "bubbles" the largest value to its final position. Are you ready to try?',
    choices: [
      { label: 'Let\'s do this!', next: 'mentor_pre_battle', effects: { correctness: 1 } },
      { label: 'I need more time.', next: null },
    ],
  },

  mentor_pre_battle: {
    speaker: 'MENTOR',
    text: '* Then face the Sorting Trial! Prove your understanding!',
    next: null,
    effects: { startBattle: { levelId: 'bubble-sort', encounterId: 'mentor_battle' } },
  },

  // ── Gatekeeper (room 1, col 5 row 6) ─────────────────────────────────
  gatekeeper_start: (flags) =>
    !flags.completedEncounters.includes('mentor_battle') && flags.empathy < 1
      ? {
          speaker: 'GATEKEEPER',
          text: '* Halt! Only those who have proven themselves to the Mentor — or shown great empathy — may pass through this door.',
          next: null,
        }
      : flags.completedEncounters.includes('gatekeeper_passed')
      ? {
          speaker: 'GATEKEEPER',
          text: '* The Chamber of Reflection awaits you. Return whenever you wish.',
          next: null,
        }
      : {
          speaker: 'GATEKEEPER',
          text: '* I sense you are ready. The Chamber of Reflection lies beyond. Many truths await you there.',
          choices: [
            { label: 'I\'m ready. Open the door.', next: 'gatekeeper_open', effects: { efficiency: 1 } },
            { label: 'Tell me what I\'ll find.',    next: 'gatekeeper_hint' },
          ],
        },

  gatekeeper_hint: {
    speaker: 'GATEKEEPER',
    text: '* A Sage dwells in the Chamber. They will ask you what you seek. Choose wisely — your answer shapes your ending.',
    choices: [
      { label: 'I\'m ready now.', next: 'gatekeeper_open', effects: { empathy: 1 } },
    ],
  },

  gatekeeper_open: {
    speaker: 'GATEKEEPER',
    text: '* Then go forth! The door is open. Remember — what you seek, you will find.',
    next: null,
    effects: { completeEncounter: 'gatekeeper_passed' },
  },

  // ── Sage (room 2, col 6 row 4) ────────────────────────────────────────
  sage_start: (flags) =>
    flags.completedEncounters.includes('sage_spoken')
      ? {
          speaker: 'SAGE',
          text: '* The crystal glows to the east. You know what you must do.',
          next: null,
        }
      : {
          speaker: 'SAGE',
          text: '* Welcome, seeker. Many have come to this chamber. I ask each one the same question: what do you seek?',
          choices: [
            { label: 'I seek efficiency.', next: 'sage_efficiency', effects: { efficiency: 1 } },
            { label: 'I seek empathy.',    next: 'sage_empathy',    effects: { empathy: 1 } },
            { label: 'I seek truth.',      next: 'sage_correctness', effects: { correctness: 1 } },
          ],
        },

  sage_efficiency: {
    speaker: 'SAGE',
    text: '* An optimizer\'s mind. You see the fastest path through any problem. The crystal lies to the east — touch it to complete your journey.',
    next: null,
    effects: { completeEncounter: 'sage_spoken' },
  },

  sage_empathy: {
    speaker: 'SAGE',
    text: '* A mentor\'s heart. You understand that algorithms serve people, not the reverse. The crystal lies to the east — touch it to complete your journey.',
    next: null,
    effects: { completeEncounter: 'sage_spoken' },
  },

  sage_correctness: {
    speaker: 'SAGE',
    text: '* A scholar\'s eye. You see every edge case, every proof. The crystal lies to the east — touch it to complete your journey.',
    next: null,
    effects: { completeEncounter: 'sage_spoken' },
  },
}

// Resolve a node (handle function or plain object)
export function getDialogNode(nodeId, flags) {
  const node = DIALOG[nodeId]
  if (!node) return null
  return typeof node === 'function' ? node(flags) : node
}
