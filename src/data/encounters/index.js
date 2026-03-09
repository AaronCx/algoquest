// ── Encounter definitions ─────────────────────────────────────────────────────
// Each encounter has:
//   id, title, algorithmName, story
//   steps: [ MCQ step | approach step ]
//   rewards: { xp }
//   isAct1End?: true   (triggers Act 1 cutscene on complete)
//
// MCQ step: { question, options: string[], correct: index, hint }
// Approach step: { type: 'approach', question, options: [{ label, desc, effects }] }
// effects: { correctness?, efficiency?, harmony?, keyDecision?: { key, value } }

export const ENCOUNTERS = {

  // ── Q1: Stack Discipline ──────────────────────────────────────────────────
  stack_discipline: {
    id: 'stack_discipline',
    title: 'The Stack Gate Trial',
    algorithmName: 'Stack — LIFO',
    story: 'The Stack Gate is corrupted. Capt. Stack needs you to prove your knowledge of stack operations before the gate collapses completely.',
    steps: [
      {
        question: 'A stack performs: push(5), push(3), pop(). What value is now on top?',
        options: ['5', '3', 'Empty', '8'],
        correct: 0,
        hint: 'pop() removes the last item pushed. push(5) → push(3) → pop() removes 3. Top is now 5.',
      },
      {
        question: 'Which property best defines a stack?',
        options: ['FIFO — First In, First Out', 'LIFO — Last In, First Out', 'Random access', 'Sorted order'],
        correct: 1,
        hint: 'Stacks are LIFO: the last item pushed is the first item popped.',
      },
      {
        question: 'What is the time complexity of push and pop on a stack?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        correct: 2,
        hint: 'Push and pop only affect the top element — constant time O(1).',
      },
      {
        type: 'approach',
        question: 'The gate corruption is cleared. How do you rebuild the stack order?',
        options: [
          {
            label: 'Recheck every element carefully.',
            desc: '+1 Correctness — verify the full order',
            effects: { correctness: 1 },
          },
          {
            label: 'Use the fastest repair shortcut.',
            desc: '+1 Efficiency — minimize time spent',
            effects: { efficiency: 1 },
          },
          {
            label: 'Ask the guards to help verify.',
            desc: '+1 Harmony — coordinate with others',
            effects: { harmony: 1 },
          },
        ],
      },
    ],
    rewards: { xp: 80 },
  },

  // ── Q2: Linear Search ─────────────────────────────────────────────────────
  linear_search: {
    id: 'linear_search',
    title: "Byte's Lost Data",
    algorithmName: 'Linear Search — O(n)',
    story: "Byte has lost precious data somewhere in the Bazaar's inventory. Help search through each item one by one until the data is found.",
    steps: [
      {
        question: 'Linear search checks elements in what order?',
        options: ['Random order', 'Left to right (sequential)', 'Binary split', 'Highest to lowest'],
        correct: 1,
        hint: 'Linear search goes through each element from left to right, one at a time.',
      },
      {
        question: 'What is the worst-case time complexity of linear search on n elements?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correct: 1,
        hint: 'In the worst case we check every element — O(n) time.',
      },
      {
        question: "When does linear search outperform binary search?",
        options: [
          'Always — linear is faster',
          'When the list is sorted',
          'When the list is small or unsorted',
          'When n > 1000',
        ],
        correct: 2,
        hint: 'Binary search needs a sorted list. For small or unsorted data, linear search wins.',
      },
      {
        type: 'approach',
        question: "You find Byte's data. How do you approach the search?",
        options: [
          {
            label: 'Check every item systematically.',
            desc: '+1 Correctness — leave nothing unchecked',
            effects: { correctness: 1 },
          },
          {
            label: 'Stop searching the moment it is found.',
            desc: '+1 Efficiency — exit early',
            effects: { efficiency: 1 },
          },
          {
            label: 'Ask shopkeepers to help narrow it down.',
            desc: '+1 Harmony — community search',
            effects: { harmony: 1 },
          },
        ],
      },
    ],
    rewards: { xp: 80 },
  },

  // ── Q3: Selection Sort ────────────────────────────────────────────────────
  selection_sort: {
    id: 'selection_sort',
    title: 'The Sorting Yard',
    algorithmName: 'Selection Sort — O(n²)',
    story: 'The Sorting Yard is in chaos. Marshal Thread commands you to sort the scrambled data using Selection Sort — find the minimum, place it, repeat.',
    steps: [
      {
        question: 'Selection sort repeatedly finds what from the unsorted portion?',
        options: ['The maximum element', 'The median element', 'The minimum element', 'A random element'],
        correct: 2,
        hint: 'Each pass finds the minimum of the unsorted portion and swaps it into place.',
      },
      {
        question: 'Is selection sort a stable sorting algorithm?',
        options: ['Yes — equal elements keep original order', 'No — equal elements may be reordered', 'It depends on the data', 'Always stable with linked lists'],
        correct: 1,
        hint: 'Selection sort is NOT stable by default — swaps can reorder equal elements.',
      },
      {
        question: 'How many comparisons does selection sort make for n elements?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correct: 2,
        hint: 'Each pass scans the remaining unsorted portion — O(n²) comparisons total.',
      },
      {
        type: 'approach',
        question: 'What core value guides your sorting strategy?',
        options: [
          {
            label: 'Verify correctness at every step.',
            desc: '+1 Correctness — rigorous verification',
            effects: { correctness: 1, keyDecision: { key: 'coreValue', value: 'correctness' } },
          },
          {
            label: 'Minimize swaps — efficiency is key.',
            desc: '+1 Efficiency — fewest operations',
            effects: { efficiency: 1, keyDecision: { key: 'coreValue', value: 'efficiency' } },
          },
          {
            label: 'Keep neighbors close — preserve relationships.',
            desc: '+1 Harmony — stability matters',
            effects: { harmony: 1, keyDecision: { key: 'coreValue', value: 'harmony' } },
          },
        ],
      },
    ],
    rewards: { xp: 100 },
  },

  // ── Q4: Euclid's GCD ──────────────────────────────────────────────────────
  euclid_gcd: {
    id: 'euclid_gcd',
    title: 'The GCD Shrine Trial',
    algorithmName: "Euclid's GCD — O(log min(a,b))",
    story: "Profiler V demands proof of understanding. The GCD Shrine will only open its gate to those who can trace Euclid's ancient algorithm.",
    steps: [
      {
        question: 'What is GCD(12, 8)?',
        options: ['2', '4', '6', '8'],
        correct: 1,
        hint: 'GCD(12, 8) = GCD(8, 4) = GCD(4, 0) = 4. Factors of 12: 1,2,3,4,6,12. Of 8: 1,2,4,8.',
      },
      {
        question: "Euclid's algorithm computes GCD(a, b) using what operation?",
        options: ['Addition', 'Division quotient', 'Modulo (remainder)', 'Subtraction only'],
        correct: 2,
        hint: 'GCD(a, b) = GCD(b, a mod b). The modulo operation is key.',
      },
      {
        question: 'GCD(0, n) = ?',
        options: ['0', '1', 'n', 'undefined'],
        correct: 2,
        hint: 'GCD(0, n) = n by definition. Every number divides 0.',
      },
      {
        type: 'approach',
        question: 'Profiler V offers you a shortcut algorithm — faster but unverified. Do you accept?',
        options: [
          {
            label: 'Reject it — I trust only verified methods.',
            desc: '+1 Correctness — safety over speed',
            effects: { correctness: 1, keyDecision: { key: 'profilerDeal', value: 'rejected' } },
          },
          {
            label: 'Accept the deal — efficiency wins.',
            desc: '+1 Efficiency — take the shortcut',
            effects: { efficiency: 1, keyDecision: { key: 'profilerDeal', value: 'accepted' } },
          },
          {
            label: 'Negotiate — test it first, then decide.',
            desc: '+1 Harmony — measured approach',
            effects: { harmony: 1, keyDecision: { key: 'profilerDeal', value: 'negotiated' } },
          },
        ],
      },
    ],
    rewards: { xp: 120 },
  },

  // ── Q5: Floyd's Cycle Detection ───────────────────────────────────────────
  floyd_cycle: {
    id: 'floyd_cycle',
    title: 'The Cycle Trial',
    algorithmName: "Floyd's Cycle Detection — O(n)",
    story: 'The Loop Lake hides an infinite cycle threatening the Runtime Kingdom. Use Floyd\'s "tortoise and hare" algorithm to detect and escape the loop.',
    steps: [
      {
        question: "Floyd's cycle detection uses how many pointers?",
        options: ['One pointer', 'Two pointers (slow and fast)', 'Three pointers', 'A pointer array'],
        correct: 1,
        hint: 'Floyd uses a slow pointer (1 step) and a fast pointer (2 steps) simultaneously.',
      },
      {
        question: 'If the slow and fast pointers ever meet, what does that mean?',
        options: ['No cycle exists', 'An error occurred', 'A cycle exists', 'The list is sorted'],
        correct: 2,
        hint: 'If they meet, the fast pointer "lapped" the slow one — proving a cycle.',
      },
      {
        question: 'What is the space complexity of Floyd\'s cycle detection?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correct: 3,
        hint: 'Only two pointers are needed regardless of list size — O(1) space.',
      },
      {
        type: 'approach',
        question: 'You stand at the Pact Stone. The lake offers you a choice.',
        options: [
          {
            label: 'Analyze the cycle fully before acting.',
            desc: '+1 Correctness — understand before you act',
            effects: { correctness: 1, keyDecision: { key: 'loopChoice', value: 'analyze' } },
          },
          {
            label: 'Make the efficiency pact — break the cycle fast.',
            desc: '+1 Efficiency — opens the south gate',
            effects: { efficiency: 1, keyDecision: { key: 'loopChoice', value: 'pact' } },
          },
          {
            label: 'Sit at the lake edge and reflect.',
            desc: '+1 Harmony — wisdom through patience',
            effects: { harmony: 1, keyDecision: { key: 'loopChoice', value: 'reflect' } },
          },
        ],
      },
    ],
    rewards: { xp: 140 },
  },

  // ── Q6: BFS Rescue ────────────────────────────────────────────────────────
  bfs_rescue: {
    id: 'bfs_rescue',
    title: 'The BFS Rescue Mission',
    algorithmName: 'Breadth-First Search — O(V+E)',
    story: 'Nurse Null has detected lost data nodes scattered through the Chapel network. Use BFS to find them all before the Glitch corrupts them permanently. This is the final trial.',
    steps: [
      {
        question: 'BFS explores nodes in what order?',
        options: ['Deepest node first', 'Level by level (breadth-first)', 'Random order', 'Alphabetical order'],
        correct: 1,
        hint: 'BFS explores all neighbors at the current level before going deeper.',
      },
      {
        question: 'What data structure does BFS use to track nodes to visit?',
        options: ['Stack', 'Priority Queue', 'Queue', 'Array'],
        correct: 2,
        hint: 'BFS uses a Queue (FIFO) — matching the Chapel bell\'s teaching.',
      },
      {
        question: 'BFS on a graph with V vertices and E edges has what time complexity?',
        options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V × E)'],
        correct: 2,
        hint: 'BFS visits each vertex once (V) and each edge once (E) — total O(V+E).',
      },
      {
        type: 'approach',
        question: 'The rescue is complete. How did you handle it?',
        options: [
          {
            label: 'Systematic — verify every node found.',
            desc: '+1 Correctness — no node left behind',
            effects: { correctness: 1, keyDecision: { key: 'helpedByte', value: 'systematic' } },
          },
          {
            label: 'Prioritized — rescued critical nodes first.',
            desc: '+1 Efficiency — triage the most important',
            effects: { efficiency: 1, keyDecision: { key: 'helpedByte', value: 'efficient' } },
          },
          {
            label: 'Together — brought everyone along.',
            desc: '+1 Harmony — no one left alone',
            effects: { harmony: 1, keyDecision: { key: 'helpedByte', value: 'together' } },
          },
        ],
      },
    ],
    rewards: { xp: 160 },
    isAct1End: true,
  },
}
