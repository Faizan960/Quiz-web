// ─────────────────────────────────────────────────
// Social Mirror — Archetype Definitions
// 12 social archetypes mapped to dimension profiles
// ─────────────────────────────────────────────────

import type { Archetype, Dimension } from '@/types/social-mirror'

export const ARCHETYPES: Archetype[] = [
  {
    name: 'The Visionary',
    emoji: '🔮',
    description: 'A future-focused thinker who sees possibilities others miss. You connect dots across disciplines and inspire people with your bold ideas.',
    primary_dimensions: ['creativity', 'ambition', 'innovation'],
    tagline: 'Sees the future before it arrives',
  },
  {
    name: 'The Protector',
    emoji: '🛡️',
    description: 'The rock everyone leans on. You prioritize loyalty and trust above everything, and your inner circle knows you\'ll always show up.',
    primary_dimensions: ['loyalty', 'trustworthiness', 'empathy'],
    tagline: 'The one who always shows up',
  },
  {
    name: 'The Maverick',
    emoji: '⚡',
    description: 'A bold, unconventional force who refuses to follow the crowd. You challenge norms and aren\'t afraid to stand alone for what you believe.',
    primary_dimensions: ['confidence', 'resilience', 'ambition'],
    tagline: 'Breaks rules and makes new ones',
  },
  {
    name: 'The Diplomat',
    emoji: '🤝',
    description: 'The bridge between people and ideas. You navigate complex social dynamics with grace and bring out the best in every group.',
    primary_dimensions: ['empathy', 'charisma', 'trustworthiness'],
    tagline: 'Turns tension into harmony',
  },
  {
    name: 'The Innovator',
    emoji: '💡',
    description: 'A relentless creator who transforms abstract ideas into reality. You thrive on building, experimenting, and pushing boundaries.',
    primary_dimensions: ['creativity', 'intelligence', 'innovation'],
    tagline: 'Builds what doesn\'t exist yet',
  },
  {
    name: 'The Anchor',
    emoji: '⚓',
    description: 'The steady force that grounds every group. When chaos strikes, people look to you because you stay calm and carry everyone through.',
    primary_dimensions: ['resilience', 'loyalty', 'trustworthiness'],
    tagline: 'Calm in every storm',
  },
  {
    name: 'The Spark',
    emoji: '✨',
    description: 'Pure energy in human form. You light up every room, turn mundane moments into memories, and make everyone feel alive.',
    primary_dimensions: ['humor', 'charisma', 'confidence'],
    tagline: 'Makes every room brighter',
  },
  {
    name: 'The Strategist',
    emoji: '♟️',
    description: 'A calculated mind that sees ten steps ahead. You combine intelligence with ambition to engineer outcomes others can only dream of.',
    primary_dimensions: ['intelligence', 'ambition', 'leadership'],
    tagline: 'Always ten steps ahead',
  },
  {
    name: 'The Empath',
    emoji: '💜',
    description: 'You feel what others feel — deeply. Your emotional intelligence is your superpower, and people trust you with their most vulnerable moments.',
    primary_dimensions: ['empathy', 'loyalty', 'charisma'],
    tagline: 'Feels what words can\'t say',
  },
  {
    name: 'The Rebel',
    emoji: '🔥',
    description: 'A fearless disruptor who questions everything. You don\'t just think outside the box — you set the box on fire and build something better.',
    primary_dimensions: ['confidence', 'creativity', 'humor'],
    tagline: 'Questions everything, fears nothing',
  },
  {
    name: 'The Sage',
    emoji: '📚',
    description: 'The person everyone comes to for wisdom. You combine deep thinking with genuine empathy, offering advice that actually changes lives.',
    primary_dimensions: ['intelligence', 'empathy', 'resilience'],
    tagline: 'Wisdom beyond their years',
  },
  {
    name: 'The Commander',
    emoji: '👑',
    description: 'A natural-born leader who doesn\'t need a title to lead. People follow you because your presence commands respect and your vision inspires action.',
    primary_dimensions: ['leadership', 'confidence', 'ambition'],
    tagline: 'Born to lead, built to inspire',
  },
]

/**
 * Determines the best-matching archetype based on dimension scores.
 *
 * Algorithm:
 * 1. For each archetype, calculate a "fit score" based on how strong
 *    the user's primary dimensions are for that archetype.
 * 2. The archetype with the highest fit score wins.
 * 3. Ties are broken by total score across all dimensions.
 */
export function determineArchetype(scores: Record<string, number>): Archetype {
  let bestArchetype = ARCHETYPES[0]
  let bestFitScore = -1

  for (const archetype of ARCHETYPES) {
    let fitScore = 0
    for (const dim of archetype.primary_dimensions) {
      fitScore += scores[dim] ?? 0
    }
    // Normalize by number of dimensions so archetypes with fewer primary dims aren't penalized
    fitScore = fitScore / archetype.primary_dimensions.length

    if (fitScore > bestFitScore) {
      bestFitScore = fitScore
      bestArchetype = archetype
    }
  }

  return bestArchetype
}

/**
 * Get the top N dimensions from scores
 */
export function getTopDimensions(scores: Record<string, number>, n: number): string[] {
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([dim]) => dim)
}

/**
 * Get the bottom N dimensions from scores
 */
export function getBottomDimensions(scores: Record<string, number>, n: number): string[] {
  return Object.entries(scores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, n)
    .map(([dim]) => dim)
}

// Human-readable dimension labels
export const DIMENSION_LABELS: Record<string, string> = {
  leadership: 'Leadership',
  creativity: 'Creativity',
  empathy: 'Empathy',
  ambition: 'Ambition',
  humor: 'Humor',
  trustworthiness: 'Trustworthiness',
  intelligence: 'Intelligence',
  charisma: 'Charisma',
  resilience: 'Resilience',
  loyalty: 'Loyalty',
  innovation: 'Innovation',
  confidence: 'Confidence',
}
