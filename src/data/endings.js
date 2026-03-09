// ── Ending definitions ────────────────────────────────────────────────────
// Evaluated in order — first matching condition wins.

export const ENDINGS = [
  {
    id: 'mentor',
    title: 'THE MENTOR\'S PATH',
    subtitle: 'You walked in others\' shoes.',
    color: '#22c55e',
    body: 'Your journey was guided by harmony. You understood that every algorithm has a human behind it — someone who needs to learn, not just a machine to optimize. The Sage nods: "True mastery is teaching others to see what you see."',
    condition: (flags) => flags.harmony >= 2,
  },
  {
    id: 'optimizer',
    title: 'THE OPTIMIZER\'S PATH',
    subtitle: 'You found the shortest route.',
    color: '#f59e0b',
    body: 'Your journey was guided by efficiency. Where others hesitated, you acted. Where others explained, you demonstrated. The Sage nods: "Speed is a virtue — but only when you know which destination is worth reaching."',
    condition: (flags) => flags.efficiency >= 2,
  },
  {
    id: 'proofkeeper',
    title: 'THE PROOFKEEPER\'S PATH',
    subtitle: 'You left no edge case unexamined.',
    color: '#e8645a',
    body: 'Your journey was guided by correctness. Every claim you made, you could verify. Every step you took, you could justify. The Sage nods: "A program that is correct but slow is honest. A program that is fast but wrong is a lie."',
    condition: (flags) => flags.correctness >= 2,
  },
  {
    id: 'neutral',
    title: 'THE WANDERER\'S PATH',
    subtitle: 'You walked your own road.',
    color: '#6b6b7a',
    body: 'Your journey balanced all things — empathy, efficiency, and correctness in equal measure. You made no grand declarations, yet arrived at the same destination as all the others. The Sage nods: "Balance is its own kind of mastery."',
    condition: () => true,  // always matches as fallback
  },
]

export function resolveEnding(flags) {
  return ENDINGS.find(e => e.condition(flags)) ?? ENDINGS[ENDINGS.length - 1]
}
