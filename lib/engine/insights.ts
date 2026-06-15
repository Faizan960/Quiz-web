// ─────────────────────────────────────────────────
// Quizly — Insight Generation
// Deterministic insights based on score patterns
// ─────────────────────────────────────────────────

import type { DimensionScores, DimensionKey, InsightCard, Archetype } from '@/types/quiz'
import { DIMENSION_KEYS, DIMENSION_LABELS } from '@/types/quiz'

/**
 * Get the top N dimensions from scores.
 */
function getTopDimensions(scores: DimensionScores, n: number): DimensionKey[] {
  return [...DIMENSION_KEYS]
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, n)
}

/**
 * Get the bottom N dimensions from scores.
 */
function getBottomDimensions(scores: DimensionScores, n: number): DimensionKey[] {
  return [...DIMENSION_KEYS]
    .sort((a, b) => scores[a] - scores[b])
    .slice(0, n)
}

// ─── Strength Insights ─────────────────────────

const STRENGTH_TEMPLATES: Record<DimensionKey, { title: string; description: string }> = {
  charisma: {
    title: 'Natural Presence',
    description: 'People gravitate toward you. Your energy shifts the room the moment you walk in — and everyone notices.',
  },
  resilience: {
    title: 'Unbreakable Core',
    description: 'When things collapse, you rebuild. Your friends see someone who bends but never breaks.',
  },
  loyalty: {
    title: 'Iron Bond',
    description: 'Your loyalty isn\'t just a trait — it\'s a promise. The people in your life know they can count on you, always.',
  },
  innovation: {
    title: 'Original Thinker',
    description: 'You see solutions nobody else imagines. Your mind works in patterns that surprise even you.',
  },
  confidence: {
    title: 'Steady Conviction',
    description: 'You back yourself quietly but firmly. That self-assurance gives others permission to believe in themselves too.',
  },
  warmth: {
    title: 'Emotional Magnet',
    description: 'People open up to you instinctively. You create safety without even trying — and that\'s rare.',
  },
  wit: {
    title: 'Quick Mind',
    description: 'Your timing is impeccable. You find humor and insight in moments others miss entirely.',
  },
}

// ─── Blindspot Insights ────────────────────────

const BLINDSPOT_TEMPLATES: Record<DimensionKey, { title: string; description: string }> = {
  charisma: {
    title: 'The Quiet Presence',
    description: 'You might hold back when a room needs your energy. Sometimes stepping forward is the kindest thing you can do.',
  },
  resilience: {
    title: 'The Soft Spot',
    description: 'You feel things deeply and that\'s a strength — but it can also slow your recovery when things go sideways.',
  },
  loyalty: {
    title: 'The Flexible Boundary',
    description: 'Your independence is admirable, but sometimes your friends might wish you showed up more consistently.',
  },
  innovation: {
    title: 'The Comfort Zone',
    description: 'You value what works — but occasionally taking a creative risk could unlock something unexpected.',
  },
  confidence: {
    title: 'The Second Guess',
    description: 'You have more capability than you give yourself credit for. Trust yourself a little more.',
  },
  warmth: {
    title: 'The Guarded Heart',
    description: 'Your walls protect you, but they also prevent some people from reaching the real you.',
  },
  wit: {
    title: 'The Straight Face',
    description: 'Your seriousness has power — but a well-timed laugh can connect you to people faster than any insight.',
  },
}

// ─── Surprising Insights ───────────────────────

const SURPRISING_COMBOS: Array<{
  dims: [DimensionKey, DimensionKey]
  title: string
  description: string
}> = [
  {
    dims: ['warmth', 'wit'],
    title: 'The Comedic Empath',
    description: 'You can make someone cry laughing and then hold them while they actually cry. That range is extraordinary.',
  },
  {
    dims: ['confidence', 'warmth'],
    title: 'The Gentle Authority',
    description: 'You command respect without demanding it. People follow you because you make them feel seen.',
  },
  {
    dims: ['innovation', 'loyalty'],
    title: 'The Creative Anchor',
    description: 'You push boundaries while staying grounded. Your friends get wild ideas AND follow-through from the same person.',
  },
  {
    dims: ['resilience', 'wit'],
    title: 'The Laughing Phoenix',
    description: 'You turn setbacks into stories and pain into punchlines. It\'s not denial — it\'s your superpower.',
  },
  {
    dims: ['charisma', 'resilience'],
    title: 'The Unshakeable Star',
    description: 'You\'re magnetic AND tough. That combination makes people both admire you and feel safe around you.',
  },
  {
    dims: ['loyalty', 'confidence'],
    title: 'The Protective Force',
    description: 'You defend the people you love with a certainty that\'s both comforting and slightly terrifying.',
  },
]

/**
 * Generate 3 insight cards based on dimension scores and archetype.
 */
export function generateInsights(
  scores: DimensionScores,
  _archetype: Archetype
): InsightCard[] {
  const insights: InsightCard[] = []

  // 1. Strength — based on top dimension
  const topDims = getTopDimensions(scores, 2)
  const topDim = topDims[0]
  const strengthTemplate = STRENGTH_TEMPLATES[topDim]
  insights.push({
    type: 'strength',
    title: strengthTemplate.title,
    description: strengthTemplate.description,
    emoji: '💪',
  })

  // 2. Blindspot — based on lowest dimension
  const bottomDims = getBottomDimensions(scores, 2)
  const bottomDim = bottomDims[0]
  const blindspotTemplate = BLINDSPOT_TEMPLATES[bottomDim]
  insights.push({
    type: 'blindspot',
    title: blindspotTemplate.title,
    description: blindspotTemplate.description,
    emoji: '🔍',
  })

  // 3. Surprising — find the best matching combo in top 4 dimensions
  const top4 = new Set(getTopDimensions(scores, 4))
  let bestCombo = SURPRISING_COMBOS[0]
  let bestOverlap = 0

  for (const combo of SURPRISING_COMBOS) {
    const overlap = combo.dims.filter((d) => top4.has(d)).length
    if (overlap > bestOverlap) {
      bestOverlap = overlap
      bestCombo = combo
    }
  }

  insights.push({
    type: 'surprising',
    title: bestCombo.title,
    description: bestCombo.description,
    emoji: '✨',
  })

  return insights
}

export { getTopDimensions, getBottomDimensions, DIMENSION_LABELS }
