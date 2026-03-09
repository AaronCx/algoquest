// ── Act 1 Cutscene Data ───────────────────────────────────────────────────────
// Slides shown sequentially in Act1Cutscene.jsx

export const ACT1_CUTSCENE_TITLE = 'HEAP MEADOW — THE FIRST GLITCH'
export const ACT1_CUTSCENE_SUBTITLE = 'Act I Complete'

export const ACT1_SLIDES = [
  {
    heading: null,
    text: 'The corrupted Stack Gate stands repaired.\n\nThe Sorting Yard is ordered once more.\n\nThe GCD Shrine glows with ancient blessing.',
  },
  {
    heading: null,
    text: 'Loop Lake grows still.\n\nThe cycle — that endless, treacherous loop — has been detected and broken.',
  },
  {
    heading: null,
    text: 'In the Queue Chapel, the last data nodes are found.\n\nNurse Null rings the chapel bell.\n\nFIFO. First come, first served.',
  },
  {
    heading: 'THE FIRST GLITCH — DEFEATED',
    text: 'Heap Meadow breathes again.\n\nBut somewhere deeper in the Runtime Kingdom...\n\nthe source of the Glitch remains.',
  },
  {
    heading: null,
    text: 'You close your eyes and listen to the Heap.\n\nThe data flows freely now.\n\nFor the first time — it feels like home.',
  },
  {
    heading: 'TO BE CONTINUED',
    text: 'Act II: The Runtime Kingdom\n\nComing in a future update.',
    isFinal: true,
  },
]

// ── Ending flavour based on key decisions ─────────────────────────────────────
export function getAct1Epilogue(flags) {
  const { keyDecisions = {}, correctness, efficiency, harmony } = flags

  const lines = []

  // coreValue
  if (keyDecisions.coreValue === 'correctness') {
    lines.push('Your core value: Correctness. Every step verified.')
  } else if (keyDecisions.coreValue === 'efficiency') {
    lines.push('Your core value: Efficiency. Speed with purpose.')
  } else if (keyDecisions.coreValue === 'harmony') {
    lines.push('Your core value: Harmony. Relationships preserved.')
  }

  // profilerDeal
  if (keyDecisions.profilerDeal === 'rejected') {
    lines.push('You rejected the Profiler\'s shortcut. Integrity intact.')
  } else if (keyDecisions.profilerDeal === 'accepted') {
    lines.push('You took the Profiler\'s deal. Was it worth it?')
  } else if (keyDecisions.profilerDeal === 'negotiated') {
    lines.push('You negotiated with the Profiler. Wisdom in balance.')
  }

  // loopChoice
  if (keyDecisions.loopChoice === 'pact') {
    lines.push('You made the efficiency pact at Loop Lake.')
  } else if (keyDecisions.loopChoice === 'analyze') {
    lines.push('You analyzed the cycle fully before acting.')
  } else if (keyDecisions.loopChoice === 'reflect') {
    lines.push('You chose reflection at the lake edge.')
  }

  // helpedByte
  if (keyDecisions.helpedByte === 'systematic') {
    lines.push('The BFS rescue: systematic. No node overlooked.')
  } else if (keyDecisions.helpedByte === 'efficient') {
    lines.push('The BFS rescue: critical nodes prioritized.')
  } else if (keyDecisions.helpedByte === 'together') {
    lines.push('The BFS rescue: everyone came home together.')
  }

  // Dominant stat
  const dominant = correctness >= efficiency && correctness >= harmony
    ? 'correctness'
    : efficiency >= harmony
    ? 'efficiency'
    : 'harmony'

  const domMsg = {
    correctness: `Dominant trait: CORRECTNESS [${correctness}]`,
    efficiency:  `Dominant trait: EFFICIENCY  [${efficiency}]`,
    harmony:     `Dominant trait: HARMONY     [${harmony}]`,
  }[dominant]

  lines.push(domMsg)

  return lines
}
