// ─────────────────────────────────────────────────
// Quizly — Archetype Classification Engine
// 12 archetypes mapped to dimension score patterns
// ─────────────────────────────────────────────────

import type { Archetype, DimensionScores, DimensionKey } from '@/types/quiz'

export const ARCHETYPES: Archetype[] = [
  {
    id: 'magnetic-connector',
    name: 'The Magnetic Connector',
    description:
      'You draw people in without trying. Your warmth and wit make everyone feel like your best friend within minutes.',
    roast:
      "You have so many \"best friends\" that none of them actually know your WiFi password.",
    primaryDimensions: ['charisma', 'warmth'],
    minScores: { charisma: 75, warmth: 70 },
  },
  {
    id: 'quiet-fortress',
    name: 'The Quiet Fortress',
    description:
      'Unshakeable and fiercely loyal. You are the friend people call at 2am and you actually pick up.',
    roast:
      "You bottle things up so well your friends sometimes forget you have feelings too.",
    primaryDimensions: ['resilience', 'loyalty'],
    minScores: { resilience: 75, loyalty: 70 },
  },
  {
    id: 'creative-wildcard',
    name: 'The Creative Wildcard',
    description:
      'Unpredictable in the best way. Every conversation takes a turn nobody expected.',
    roast:
      "Your ideas are brilliant and 80% of them will never leave your notes app.",
    primaryDimensions: ['innovation', 'wit'],
    minScores: { innovation: 75, wit: 65 },
  },
  {
    id: 'steady-compass',
    name: 'The Steady Compass',
    description:
      'People look to you when things fall apart. You are calm, clear-headed, and weirdly good under pressure.',
    roast:
      'Your chill factor sometimes reads as "do you actually care though?"',
    primaryDimensions: ['resilience', 'confidence'],
    minScores: { resilience: 70, confidence: 70 },
  },
  {
    id: 'social-architect',
    name: 'The Social Architect',
    description:
      'You engineer the vibe. Plans, venues, ideas — the group runs on your energy.',
    roast:
      "You plan everyone's birthday but somehow your own is always low-key.",
    primaryDimensions: ['charisma', 'innovation'],
    minScores: { charisma: 70, innovation: 68 },
  },
  {
    id: 'empathy-engine',
    name: 'The Empathy Engine',
    description:
      "You feel everything and hold space for everyone. People tell you things they've never told anyone.",
    roast: 'You give great advice to everyone except yourself.',
    primaryDimensions: ['warmth', 'loyalty'],
    minScores: { warmth: 78, loyalty: 75 },
  },
  {
    id: 'sharp-wit',
    name: 'The Sharp Wit',
    description:
      'Fast, funny, and always first to find the angle. Conversations get better the moment you arrive.',
    roast:
      "Not everything needs a punchline. (But you'll try anyway.)",
    primaryDimensions: ['wit', 'confidence'],
    minScores: { wit: 75, confidence: 70 },
  },
  {
    id: 'loyal-anchor',
    name: 'The Loyal Anchor',
    description:
      'Dependable to a fault. When everyone else flakes, you show up. Every time.',
    roast:
      'You\'ve said "I\'m fine" at least 40 times this week.',
    primaryDimensions: ['loyalty', 'resilience'],
    minScores: { loyalty: 80, resilience: 65 },
  },
  {
    id: 'bold-pioneer',
    name: 'The Bold Pioneer',
    description:
      'You go first. New restaurants, new ideas, new approaches — the group follows your lead.',
    roast:
      "You've confidently given wrong directions at least twice this year.",
    primaryDimensions: ['confidence', 'innovation'],
    minScores: { confidence: 78, innovation: 72 },
  },
  {
    id: 'warm-realist',
    name: 'The Warm Realist',
    description:
      "You balance care and honesty in a way most people can't. You'll hug them and then tell them the truth.",
    roast:
      'Your "constructive criticism" sometimes arrives with too much construction.',
    primaryDimensions: ['warmth', 'resilience'],
    minScores: { warmth: 72, resilience: 68 },
  },
  {
    id: 'charismatic-strategist',
    name: 'The Charismatic Strategist',
    description:
      'You are three steps ahead and somehow also the most fun person in the room.',
    roast:
      "You've had a \"10-year plan\" since age 17. It's changed 11 times.",
    primaryDimensions: ['charisma', 'confidence', 'innovation'],
    minScores: { charisma: 70, confidence: 68, innovation: 65 },
  },
  {
    id: 'renaissance-soul',
    name: 'The Renaissance Soul',
    description:
      "Genuinely hard to pin down. You're a little bit of everything and somehow it all works.",
    roast:
      'Your personality contains multitudes. So does your browser tab count.',
    primaryDimensions: [],
    minScores: {},
    isDefault: true,
  },
]

/**
 * Classify a profile into one of 12 archetypes based on dimension scores.
 *
 * Algorithm:
 * 1. For each non-default archetype, check if all minScores are met.
 * 2. Among qualifying archetypes, pick the one with the highest "fit" —
 *    the average score across its primary dimensions.
 * 3. If no archetype qualifies, return The Renaissance Soul (default).
 */
export function classifyArchetype(scores: DimensionScores): Archetype {
  let bestArchetype: Archetype | null = null
  let bestFitScore = -1

  for (const archetype of ARCHETYPES) {
    if (archetype.isDefault) continue

    // Check if all minimum scores are met
    let qualifies = true
    for (const [dim, minScore] of Object.entries(archetype.minScores)) {
      if ((scores[dim as DimensionKey] ?? 0) < (minScore ?? 0)) {
        qualifies = false
        break
      }
    }

    if (!qualifies) continue

    // Calculate fit score: average of primary dimension scores
    const fitScore =
      archetype.primaryDimensions.length > 0
        ? archetype.primaryDimensions.reduce(
            (sum, dim) => sum + (scores[dim] ?? 0),
            0
          ) / archetype.primaryDimensions.length
        : 0

    if (fitScore > bestFitScore) {
      bestFitScore = fitScore
      bestArchetype = archetype
    }
  }

  // Fall back to Renaissance Soul
  return bestArchetype ?? ARCHETYPES.find((a) => a.isDefault)!
}
