// ─────────────────────────────────────────────────
// Social Mirror — Roast & Compliment Templates
// Template-based generation with variable substitution
// ─────────────────────────────────────────────────

import { DIMENSION_LABELS, getTopDimensions, getBottomDimensions } from './archetypes'

// ─── Strength Descriptions ─────────────────────
// Maps top dimensions to natural-language strength descriptions

const STRENGTH_MAP: Record<string, string[]> = {
  leadership: [
    'Natural ability to take charge and rally people',
    'Commands respect without demanding it',
    'People naturally look to them for direction',
  ],
  creativity: [
    'Thinks in colors others can\'t see',
    'Turns boring ideas into something extraordinary',
    'Has an imagination that refuses to stay inside the box',
  ],
  empathy: [
    'Understands people on a level most can\'t reach',
    'Makes everyone feel genuinely heard',
    'Emotional intelligence that\'s off the charts',
  ],
  ambition: [
    'Has a fire inside that never stops burning',
    'Sets goals that others think are impossible — then achieves them',
    'Driven in a way that inspires everyone around them',
  ],
  humor: [
    'Could make a rock laugh',
    'Turns any tense situation into something bearable',
    'Has timing so perfect it should be illegal',
  ],
  trustworthiness: [
    'The kind of person you\'d trust with your life\'s password',
    'Their word is literally gold',
    'When they say they\'ll do something, consider it done',
  ],
  intelligence: [
    'Has a mind that works faster than most people can follow',
    'Connects dots that others don\'t even see',
    'The person you want on your team for any challenge',
  ],
  charisma: [
    'Walks into a room and the energy shifts',
    'Has a magnetic personality that draws people in',
    'Could sell ice to a penguin',
  ],
  resilience: [
    'Bounces back from setbacks like they\'re made of rubber',
    'Has been through things that would break most people — and came out stronger',
    'Their mental toughness is genuinely inspiring',
  ],
  loyalty: [
    'Once you\'re in their circle, you\'re there for life',
    'Rides for their people harder than anyone else',
    'The friend who would literally fight for you',
  ],
  innovation: [
    'Sees solutions where others see dead ends',
    'Has a brain that\'s constantly building the future',
    'Thinks about things in ways nobody else does',
  ],
  confidence: [
    'Carries themselves with an energy that\'s undeniable',
    'Believes in themselves in a way that\'s contagious',
    'Doesn\'t need validation — they ARE the validation',
  ],
}

// ─── Weakness Descriptions ─────────────────────

const WEAKNESS_MAP: Record<string, string[]> = {
  leadership: [
    'Can sometimes take a backseat when the group needs direction',
    'Might avoid stepping up even when they\'re the best person for it',
  ],
  creativity: [
    'Tends to stick with what\'s safe rather than experimenting',
    'Could unlock so much more by thinking more freely',
  ],
  empathy: [
    'Sometimes misses emotional cues from people close to them',
    'Could stand to check in on friends more',
  ],
  ambition: [
    'Might need a bigger dream to chase',
    'Sometimes settles when they could aim higher',
  ],
  humor: [
    'Takes things a little too seriously sometimes',
    'Could lighten up — not everything is life or death',
  ],
  trustworthiness: [
    'People might hesitate before sharing their deepest stuff',
    'Building deeper trust takes time with them',
  ],
  intelligence: [
    'Could benefit from thinking things through a bit more',
    'Sometimes jumps to conclusions too quickly',
  ],
  charisma: [
    'Has depth that gets lost because they don\'t show it enough',
    'Could open up more — there\'s gold behind that quiet exterior',
  ],
  resilience: [
    'Takes setbacks harder than they need to',
    'Could work on bouncing back faster when things go wrong',
  ],
  loyalty: [
    'Sometimes spreads themselves too thin across friend groups',
    'Could show up more consistently for their closest people',
  ],
  innovation: [
    'Tends to follow existing paths rather than creating new ones',
    'Has more original ideas than they let themselves explore',
  ],
  confidence: [
    'Doesn\'t always see how capable they actually are',
    'Sells themselves short more than they should',
  ],
}

// ─── Hidden Talent Descriptions ────────────────

const HIDDEN_TALENT_MAP: Record<string, string[]> = {
  leadership: ['Mentoring and coaching others', 'Crisis management', 'Building communities'],
  creativity: ['Storytelling', 'Visual design and aesthetics', 'Music or art creation'],
  empathy: ['Counseling and emotional support', 'Reading people\'s body language', 'Conflict resolution'],
  ambition: ['Strategic planning', 'Turning ideas into action', 'Negotiation'],
  humor: ['Stand-up comedy', 'Writing comedy or satire', 'Making viral content'],
  trustworthiness: ['Being a confidant that people truly rely on', 'Diplomatic mediation', 'Building long-term partnerships'],
  intelligence: ['Teaching complex ideas simply', 'Pattern recognition', 'Research and deep analysis'],
  charisma: ['Public speaking', 'Sales and persuasion', 'Event hosting'],
  resilience: ['Endurance sports or physical challenges', 'Handling pressure like a pro', 'Adapting to any situation'],
  loyalty: ['Team building', 'Being the glue in any organization', 'Long-term relationship maintenance'],
  innovation: ['Inventing new solutions', 'Disrupting old systems', 'Technology or product design'],
  confidence: ['Performing on stage', 'Leadership in high-stakes situations', 'Inspiring others to believe in themselves'],
}

// ─── Friend Impression Templates ───────────────

const IMPRESSION_TEMPLATES: string[] = [
  'The person everyone secretly wants to be more like',
  'The friend who makes you feel like you matter',
  'Someone who leaves a mark on everyone they meet',
  'The one who makes every group chat better',
  'A rare combination of {top1} and {top2} that most people can\'t pull off',
  'The kind of person you\'d describe as "one of a kind" and actually mean it',
  'Someone who makes {top1} look effortless',
  'The friend everyone brags about knowing',
  'A walking reminder that genuinely good people exist',
  'The person you\'d pick first for literally anything important',
]

// ─── Roast Templates ───────────────────────────

const ROAST_TEMPLATES: string[] = [
  "Your friends think your biggest flex is {top1}, which is cute because they clearly haven't seen your {bottom1}. Love that for you. 😂",
  "Okay so {name}, your friends basically said you're a {archetype} — which sounds cool until you realize it's their polite way of saying you have main character syndrome. The {top1_pct}% {top1} score? That's not ambition, that's just you being chronically unable to sit still.",
  "Let's talk about that {bottom1} score of {bottom1_pct}%. Your friends are basically saying what we were all thinking. But hey, at least your {top1} energy makes up for it... barely. 🤷",
  "{name}, you scored {top1_pct}% in {top1} — which means your friends think you're the {top1} friend. But that {bottom1_pct}% in {bottom1}? Your friend group is doing charity work keeping you around. JK, they love you... probably.",
  "Your archetype is '{archetype}' which honestly tracks because you do give '{archetype_tagline}' energy — in the most chaotic way possible. Your {bottom1} needs CPR though, not gonna lie. 💀",
  "You got {response_count} friends to answer questions about you, which is honestly more than most people can get to reply to a text. Your {top1} ({top1_pct}%) is carrying your entire personality while your {bottom1} ({bottom1_pct}%) is just vibing in the basement.",
  "{name}, your social report just dropped and wow — your friends really said '{top1} ✅, {bottom1} ❌' in the most diplomatic way possible. At least you're consistent... consistently lacking in {bottom1}. 😭",
]

// ─── Compliment Templates ──────────────────────

const COMPLIMENT_TEMPLATES: string[] = [
  "{name}, your friends see something truly special in you. Your {top1} ({top1_pct}%) isn't just a number — it means the people closest to you genuinely believe you're one of the most {top1_adj} people they know. That's not something you can fake.",
  "Here's what {response_count} people who actually know you said: you're a {archetype}. Not because of what you do, but because of who you are. Your {top1} and {top2} create a combination that's genuinely rare — and your friends are lucky to have you.",
  "Let's appreciate something: {response_count} people took time out of their day to answer questions about you. That alone says everything about the kind of person you are. But the numbers back it up too — {top1_pct}% in {top1} and {top2_pct}% in {top2}. You're not just liked, {name} — you're valued.",
  "{name}, you're the kind of person who makes {top1} and {top2} look effortless. Your friends see a '{archetype}' — someone who {archetype_desc}. The best part? You probably don't even realize how much impact you have on the people around you. 💛",
  "Your friends just collectively agreed: you're extraordinary. A {top1_pct}% {top1} score means people FEEL it when you're around. Combined with {top2_pct}% in {top2}, you're basically the friend everyone deserves but very few people get.",
  "Fun fact: most people would kill for ONE of your top traits. You've got {top1} at {top1_pct}%, {top2} at {top2_pct}%, AND {top3} at {top3_pct}%. You're not just good — you're a whole highlight reel. Keep being exactly who you are, {name}. ✨",
]

// ─── Generator Functions ───────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Generate strength descriptions from top dimensions
 */
export function generateStrengths(scores: Record<string, number>, count = 3): string[] {
  const topDims = getTopDimensions(scores, count)
  return topDims.map(dim => {
    const pool = STRENGTH_MAP[dim] ?? [`Exceptional ${DIMENSION_LABELS[dim]?.toLowerCase() ?? dim}`]
    return pickRandom(pool)
  })
}

/**
 * Generate weakness descriptions from bottom dimensions
 */
export function generateWeaknesses(scores: Record<string, number>, count = 2): string[] {
  const bottomDims = getBottomDimensions(scores, count)
  return bottomDims.map(dim => {
    const pool = WEAKNESS_MAP[dim] ?? [`Room to grow in ${DIMENSION_LABELS[dim]?.toLowerCase() ?? dim}`]
    return pickRandom(pool)
  })
}

/**
 * Generate hidden talent based on the dimension that's strong but not top-1
 */
export function generateHiddenTalent(scores: Record<string, number>): string {
  // Pick the 3rd or 4th strongest dimension — strong but less obvious
  const dims = getTopDimensions(scores, 4)
  const hiddenDim = dims[2] ?? dims[1] ?? dims[0]
  const pool = HIDDEN_TALENT_MAP[hiddenDim] ?? ['Something amazing that nobody expects']
  return pickRandom(pool)
}

/**
 * Generate friend impression sentence
 */
export function generateFriendImpression(scores: Record<string, number>): string {
  const topDims = getTopDimensions(scores, 2)
  const template = pickRandom(IMPRESSION_TEMPLATES)
  return template
    .replace(/\{top1\}/g, DIMENSION_LABELS[topDims[0]] ?? topDims[0])
    .replace(/\{top2\}/g, DIMENSION_LABELS[topDims[1]] ?? topDims[1])
}

// Adjective forms of dimensions for natural language
const DIMENSION_ADJECTIVES: Record<string, string> = {
  leadership: 'natural-born leader',
  creativity: 'creative',
  empathy: 'empathetic',
  ambition: 'ambitious',
  humor: 'funny',
  trustworthiness: 'trustworthy',
  intelligence: 'intelligent',
  charisma: 'charismatic',
  resilience: 'resilient',
  loyalty: 'loyal',
  innovation: 'innovative',
  confidence: 'confident',
}

/**
 * Generate roast text
 */
export function generateRoast(
  name: string,
  scores: Record<string, number>,
  archetype: { name: string; tagline: string },
  responseCount: number
): string {
  const topDims = getTopDimensions(scores, 3)
  const bottomDims = getBottomDimensions(scores, 2)
  const template = pickRandom(ROAST_TEMPLATES)

  return template
    .replace(/\{name\}/g, name)
    .replace(/\{archetype\}/g, archetype.name)
    .replace(/\{archetype_tagline\}/g, archetype.tagline)
    .replace(/\{top1\}/g, DIMENSION_LABELS[topDims[0]] ?? topDims[0])
    .replace(/\{top2\}/g, DIMENSION_LABELS[topDims[1]] ?? topDims[1])
    .replace(/\{top3\}/g, DIMENSION_LABELS[topDims[2]] ?? topDims[2])
    .replace(/\{bottom1\}/g, DIMENSION_LABELS[bottomDims[0]] ?? bottomDims[0])
    .replace(/\{bottom2\}/g, DIMENSION_LABELS[bottomDims[1]] ?? bottomDims[1])
    .replace(/\{top1_pct\}/g, String(scores[topDims[0]] ?? 0))
    .replace(/\{top2_pct\}/g, String(scores[topDims[1]] ?? 0))
    .replace(/\{top3_pct\}/g, String(scores[topDims[2]] ?? 0))
    .replace(/\{bottom1_pct\}/g, String(scores[bottomDims[0]] ?? 0))
    .replace(/\{bottom2_pct\}/g, String(scores[bottomDims[1]] ?? 0))
    .replace(/\{response_count\}/g, String(responseCount))
    .replace(/\{top1_adj\}/g, DIMENSION_ADJECTIVES[topDims[0]] ?? topDims[0])
}

/**
 * Generate compliment text
 */
export function generateCompliment(
  name: string,
  scores: Record<string, number>,
  archetype: { name: string; description: string },
  responseCount: number
): string {
  const topDims = getTopDimensions(scores, 3)
  const template = pickRandom(COMPLIMENT_TEMPLATES)

  return template
    .replace(/\{name\}/g, name)
    .replace(/\{archetype\}/g, archetype.name)
    .replace(/\{archetype_desc\}/g, archetype.description.toLowerCase())
    .replace(/\{top1\}/g, DIMENSION_LABELS[topDims[0]] ?? topDims[0])
    .replace(/\{top2\}/g, DIMENSION_LABELS[topDims[1]] ?? topDims[1])
    .replace(/\{top3\}/g, DIMENSION_LABELS[topDims[2]] ?? topDims[2])
    .replace(/\{top1_pct\}/g, String(scores[topDims[0]] ?? 0))
    .replace(/\{top2_pct\}/g, String(scores[topDims[1]] ?? 0))
    .replace(/\{top3_pct\}/g, String(scores[topDims[2]] ?? 0))
    .replace(/\{response_count\}/g, String(responseCount))
    .replace(/\{top1_adj\}/g, DIMENSION_ADJECTIVES[topDims[0]] ?? topDims[0])
}
