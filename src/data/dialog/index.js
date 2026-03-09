// ── Dialog node registry ─────────────────────────────────────────────────────
// Nodes are objects OR (flags) => object for conditional text.
// Node shape: { speaker, text, choices?, next?, effects? }
// effects: { correctness?, efficiency?, harmony?, startBattle?, completeEncounter? }

const NODES = {

  // ── R1: Heap Meadow ────────────────────────────────────────────────────────

  wanderer_intro: flags => {
    if (flags.completedEncounters.includes('bfs_rescue')) return {
      speaker: 'Old Wanderer',
      text: '* You have done it.\n  * The Runtime Kingdom breathes again.\n  * Safe travels, young programmer.',
      next: null,
    }
    if (flags.completedEncounters.includes('stack_discipline')) return {
      speaker: 'Old Wanderer',
      text: '* You passed the Stack Gate! Brave work.\n  * Keep following the path. The Kingdom needs you.',
      next: null,
    }
    return {
      speaker: 'Old Wanderer',
      text: '* Welcome to Heap Meadow.\n  * A terrible Glitch has corrupted the Runtime Kingdom.\n  * Speak with Prof. Invariant to the south.',
      next: null,
    }
  },

  sign_meadow: {
    speaker: 'SIGN',
    text: '* HEAP MEADOW\n  * Gateway to the Runtime Kingdom.\n  * THE FIRST GLITCH has struck the Stack Gate.\n  * Find Prof. Invariant at the Proof Camp — south.',
    next: null,
  },

  // ── R2: Proof Camp ─────────────────────────────────────────────────────────

  invariant_intro: flags => {
    if (flags.completedEncounters.includes('stack_discipline')) return {
      speaker: 'Prof. Invariant',
      text: '* Excellent! The Stack Gate holds again.\n  * Head east to the Bazaar, or south to the Sorting Yard.\n  * Many still need your help.',
      next: null,
    }
    return {
      speaker: 'Prof. Invariant',
      text: '* The Stack Gate to the south is corrupted.\n  * Capt. Stack holds the line — but not for long.',
      choices: [
        { label: 'Tell me more.', next: 'invariant_explain' },
        { label: 'I am ready to help.', next: 'invariant_ready' },
      ],
    }
  },

  invariant_explain: {
    speaker: 'Prof. Invariant',
    text: '* A stack: LIFO — Last In, First Out.\n  * The Glitch has scrambled the order.\n  * Capt. Stack will test your discipline.',
    next: null,
  },

  invariant_ready: {
    speaker: 'Prof. Invariant',
    text: '* Then go south. May your invariants hold.',
    next: null,
  },

  sign_proof: {
    speaker: 'NOTICE BOARD',
    text: '* PROOF CAMP RULES\n  * I — Every invariant must be maintained.\n  * II — Test before trusting.\n  * III — Correctness before speed.',
    next: null,
  },

  // ── R3: Stack Gate ─────────────────────────────────────────────────────────

  stack_intro: flags => {
    if (flags.completedEncounters.includes('stack_discipline')) return {
      speaker: 'Capt. Stack',
      text: '* The Stack Gate is restored. Well done.\n  * East path: the Bazaar.\n  * South path: the Sorting Yard.',
      next: null,
    }
    return {
      speaker: 'Capt. Stack',
      text: '* HALT! The Stack Gate is corrupted.\n  * Prove your stack discipline to pass.',
      choices: [
        {
          label: 'Face the challenge!',
          effects: { startBattle: { levelId: 'stack-push-pop', encounterId: 'stack_discipline' } },
        },
        { label: 'Not yet.', next: 'stack_retreat' },
      ],
    }
  },

  stack_retreat: {
    speaker: 'Capt. Stack',
    text: '* Very well. Prepare yourself and return.',
    next: null,
  },

  // ── R4: Lost & Found Bazaar ────────────────────────────────────────────────

  byte_intro: flags => {
    if (flags.completedEncounters.includes('linear_search')) return {
      speaker: 'Byte',
      text: '* You found my data! You are incredible!\n  * I owe you everything, friend. ♥',
      next: null,
    }
    if (flags.completedEncounters.includes('stack_discipline')) return {
      speaker: 'Byte',
      text: '* Oh! Are you the one who fixed the Stack Gate?\n  * I lost my data somewhere here...\n  * Can you help me find it using Linear Search?',
      choices: [
        {
          label: 'Of course! I will help.',
          effects: {
            harmony: 1,
            startBattle: { levelId: 'linear-search', encounterId: 'linear_search' },
          },
        },
        { label: 'Maybe later.', next: 'byte_later' },
      ],
    }
    return {
      speaker: 'Byte',
      text: '* I am... lost.\n  * I lost my data somewhere here.\n  * I do not know what to do.',
      next: null,
    }
  },

  byte_later: {
    speaker: 'Byte',
    text: '* Oh... okay. I will keep looking.\n  * Please come back when you can. 🐣',
    next: null,
  },

  sign_bazaar: {
    speaker: 'BAZAAR SIGN',
    text: '* LOST & FOUND BAZAAR\n  * All data is precious.\n  * Linear Search: examine each item,\n    one by one, until found.',
    next: null,
  },

  lost_item: flags => {
    if (flags.completedEncounters.includes('linear_search')) return {
      speaker: 'GLOWING DATA',
      text: '* ✓ Returned to its owner.',
      next: null,
    }
    return {
      speaker: 'GLOWING DATA',
      text: '* Something valuable pulses here...\n  * Maybe Byte is looking for this?',
      next: null,
    }
  },

  // ── R5: Sorting Yard ───────────────────────────────────────────────────────

  thread_intro: flags => {
    if (flags.completedEncounters.includes('selection_sort')) return {
      speaker: 'Marshal Thread',
      text: '* The yard is sorted at last. Discipline.\n  * Head south through the Bazaar to the GCD Shrine.',
      next: null,
    }
    return {
      speaker: 'Marshal Thread',
      text: '* The Sorting Yard is in chaos!\n  * The data must be sorted before the Kingdom falls.',
      choices: [
        {
          label: 'I will sort it!',
          effects: { startBattle: { levelId: 'selection-sort', encounterId: 'selection_sort' } },
        },
        { label: 'Tell me more first.', next: 'thread_explain' },
      ],
    }
  },

  thread_explain: {
    speaker: 'Marshal Thread',
    text: '* Selection sort: find the smallest, place it first, repeat.\n  * Steady. Methodical. Reliable.',
    next: 'thread_intro',
  },

  sign_yard: {
    speaker: 'YARD SIGN',
    text: '* SORTING YARD\n  * East path → Shortcut Overlook (theory)\n  * North → Stack Gate\n  * Sort the data to restore order.',
    next: null,
  },

  // ── R6: GCD Shrine ─────────────────────────────────────────────────────────

  profiler_intro: flags => {
    if (flags.completedEncounters.includes('euclid_gcd')) return {
      speaker: 'Profiler V',
      text: '* The shrine is satisfied. You understand GCD.\n  * The east gate to Loop Lake is open.',
      next: null,
    }
    return {
      speaker: 'Profiler V',
      text: '* I am Profiler V. I measure the cost of all.\n  * The GCD Shrine demands understanding.',
      choices: [
        {
          label: 'I will prove it.',
          effects: { startBattle: { levelId: 'euclid-gcd', encounterId: 'euclid_gcd' } },
        },
        { label: 'What is GCD?', next: 'profiler_explain' },
      ],
    }
  },

  profiler_explain: {
    speaker: 'Profiler V',
    text: '* GCD — Greatest Common Divisor.\n  * Euclid discovered: GCD(a,b) = GCD(b, a mod b)\n  * Repeat until b = 0. Elegant and efficient.',
    next: 'profiler_intro',
  },

  shrine_gcd: flags => {
    if (flags.completedEncounters.includes('euclid_gcd')) return {
      speaker: 'GCD SHRINE',
      text: '* ✓ BLESSED\n  * The ancient arithmetic is satisfied.\n  * The east gate is open.',
      next: null,
    }
    return {
      speaker: 'GCD SHRINE',
      text: '* The shrine pulses with ancient arithmetic.\n  * Speak with Profiler V to begin the GCD Trial.',
      next: null,
    }
  },

  // ── R7: Loop Lake ──────────────────────────────────────────────────────────

  pact_stone: flags => {
    if (flags.keyDecisions?.loopChoice) {
      const msg = flags.keyDecisions.loopChoice === 'pact'
        ? '* The pact is sealed. ♦\n  * The south gate to the Aid Station is open.'
        : '* The stone glows softly.\n  * Your choice has been recorded.'
      return { speaker: 'PACT STONE', text: msg, next: null }
    }
    if (flags.completedEncounters.includes('euclid_gcd')) return {
      speaker: 'PACT STONE',
      text: '* The Lake of Loops calls to you.\n  * Cycles hide in all programs.\n  * Will you face the Cycle Trial?',
      choices: [
        {
          label: 'Begin the Cycle Trial.',
          effects: { startBattle: { levelId: 'floyd-cycle', encounterId: 'floyd_cycle' } },
        },
        { label: 'Not yet.', next: 'pact_stone_wait' },
      ],
    }
    return {
      speaker: 'PACT STONE',
      text: '* The stone is dormant.\n  * Earn the GCD Blessing before approaching.',
      next: null,
    }
  },

  pact_stone_wait: {
    speaker: 'PACT STONE',
    text: '* The lake ripples quietly.\n  * Return when you are ready.',
    next: null,
  },

  sign_lake: {
    speaker: 'LAKESIDE SIGN',
    text: '* LOOP LAKE\n  * Cycles lurk in all programs.\n  * Floyd\'s tortoise and hare:\n    two speeds — one truth.',
    next: null,
  },

  // ── R8: Queue Chapel ───────────────────────────────────────────────────────

  null_nurse_intro: flags => {
    if (flags.completedEncounters.includes('bfs_rescue')) return {
      speaker: 'Nurse Null',
      text: '* The Runtime Kingdom breathes again.\n  * You have done it. Act I is complete. ♥\n  * Rest now, hero.',
      next: null,
    }
    if (flags.completedEncounters.includes('floyd_cycle')) return {
      speaker: 'Nurse Null',
      text: '* You made it to the Chapel.\n  * One last trial: a BFS Rescue Mission.\n  * Lost data nodes need to be found.\n  * Are you ready?',
      choices: [
        {
          label: 'I am ready. Begin.',
          effects: { startBattle: { levelId: 'bfs-maze', encounterId: 'bfs_rescue' } },
        },
        { label: 'Rest first.', next: 'null_nurse_rest' },
      ],
    }
    return {
      speaker: 'Nurse Null',
      text: '* Welcome, weary traveler.\n  * The Chapel welcomes the disciplined.\n  * Complete the Lake\'s trial first.',
      next: null,
    }
  },

  null_nurse_rest: {
    speaker: 'Nurse Null',
    text: '* Of course. Rest here a moment.\n  * The data will wait for you. 🌿',
    next: null,
  },

  chapel_bell: {
    speaker: 'CHAPEL BELL',
    text: '* *DING*\n  * A queue: FIFO — First In, First Out.\n  * Every request processed in order.\n  * Fair and patient.',
    next: null,
  },

  // ── R9: Shortcut Overlook ──────────────────────────────────────────────────

  vista_sign: {
    speaker: 'VISTA STONE',
    text: '* From here you can see all of Heap Meadow.\n  * Different algorithms take different paths.\n  * There is no single right way.',
    next: null,
  },

  shortcut_sign: {
    speaker: 'SHORTCUT STONE',
    text: '* Big-O Complexity:\n  * O(1) → O(log n) → O(n)\n    → O(n log n) → O(n²)\n  * Sometimes the slow path teaches more.',
    next: null,
  },

  // ── R10: Pact Aid Station ──────────────────────────────────────────────────

  byte_r10: flags => {
    if (flags.completedEncounters.includes('linear_search')) return {
      speaker: 'Byte',
      text: '* You found my data AND made the pact!\n  * You are the best friend ever. ♥♥♥',
      next: null,
    }
    return {
      speaker: 'Byte',
      text: '* The pact stone brought me here too.\n  * I am still looking for my lost data...\n  * Will you help me?',
      next: null,
    }
  },

  aid_crate: {
    speaker: 'AID CRATE',
    text: '* EMERGENCY SUPPLIES\n  * Reserved for those who help others\n    without hesitation.',
    next: null,
  },
}

// ── Lookup ───────────────────────────────────────────────────────────────────
export function getDialogNode(nodeId, flags) {
  const node = NODES[nodeId]
  if (!node) return null
  return typeof node === 'function' ? node(flags) : node
}
