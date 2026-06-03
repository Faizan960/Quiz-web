// ─────────────────────────────────────────────────
// Social Mirror — Question Bank
// 60+ curated questions across 5 categories
// Each option maps to personality dimensions
// ─────────────────────────────────────────────────

import type { QuestionCategory, QuestionOption } from '@/types/social-mirror'

export interface QuestionTemplate {
  text: string // Use {name} as placeholder
  category: QuestionCategory
  options: QuestionOption[]
}

// ─── PERSONALITY Questions ─────────────────────

const PERSONALITY_QUESTIONS: QuestionTemplate[] = [
  {
    text: "What's {name}'s strongest personality trait?",
    category: 'personality',
    options: [
      { text: 'Incredibly creative', dimensions: { creativity: 3, innovation: 2 } },
      { text: 'Deeply empathetic', dimensions: { empathy: 3, loyalty: 1 } },
      { text: 'Fearlessly confident', dimensions: { confidence: 3, charisma: 1 } },
      { text: 'Razor-sharp smart', dimensions: { intelligence: 3, ambition: 1 } },
    ],
  },
  {
    text: 'How does {name} handle a crisis?',
    category: 'personality',
    options: [
      { text: 'Takes charge and leads everyone', dimensions: { leadership: 3, confidence: 2 } },
      { text: 'Stays calm and thinks it through', dimensions: { resilience: 3, intelligence: 2 } },
      { text: 'Makes sure everyone is okay first', dimensions: { empathy: 3, loyalty: 2 } },
      { text: 'Cracks jokes to lighten the mood', dimensions: { humor: 3, charisma: 1 } },
    ],
  },
  {
    text: "What's {name}'s biggest weakness?",
    category: 'personality',
    options: [
      { text: 'Overthinks everything', dimensions: { intelligence: 1, resilience: -1 } },
      { text: 'Too trusting of people', dimensions: { empathy: 1, confidence: -1 } },
      { text: 'Stubborn when they think they\'re right', dimensions: { confidence: 1, empathy: -1 } },
      { text: 'Avoids confrontation at all costs', dimensions: { loyalty: 1, leadership: -1 } },
    ],
  },
  {
    text: 'What vibe does {name} give off when you first meet them?',
    category: 'personality',
    options: [
      { text: 'Mysterious and intriguing', dimensions: { intelligence: 2, confidence: 2 } },
      { text: 'Warm and approachable', dimensions: { empathy: 2, charisma: 2 } },
      { text: 'Intense and ambitious', dimensions: { ambition: 2, leadership: 2 } },
      { text: 'Funny and relaxed', dimensions: { humor: 2, charisma: 2 } },
    ],
  },
  {
    text: '{name} at a party is most likely...',
    category: 'personality',
    options: [
      { text: 'The center of attention', dimensions: { charisma: 3, confidence: 2 } },
      { text: 'Having a deep 1-on-1 conversation', dimensions: { empathy: 3, intelligence: 1 } },
      { text: 'Organizing everything behind the scenes', dimensions: { leadership: 2, loyalty: 2 } },
      { text: 'Making everyone laugh non-stop', dimensions: { humor: 3, charisma: 1 } },
    ],
  },
  {
    text: 'If {name} had a secret talent nobody knows about, it would be...',
    category: 'personality',
    options: [
      { text: 'Writing or storytelling', dimensions: { creativity: 3, intelligence: 1 } },
      { text: 'Reading people like a book', dimensions: { empathy: 3, charisma: 1 } },
      { text: 'Strategic thinking / chess-level planning', dimensions: { intelligence: 3, ambition: 1 } },
      { text: 'Being unexpectedly athletic', dimensions: { resilience: 2, confidence: 2 } },
    ],
  },
  {
    text: 'What would {name} be like as a leader?',
    category: 'personality',
    options: [
      { text: 'Inspiring — everyone would want to follow them', dimensions: { leadership: 3, charisma: 2 } },
      { text: 'Fair and balanced — always hears every side', dimensions: { empathy: 2, trustworthiness: 3 } },
      { text: 'Visionary — always has a bigger plan', dimensions: { ambition: 3, innovation: 2 } },
      { text: 'Collaborative — empowers the team', dimensions: { loyalty: 2, leadership: 2 } },
    ],
  },
  {
    text: "What emoji best describes {name}'s energy?",
    category: 'personality',
    options: [
      { text: '⚡ Electric and intense', dimensions: { charisma: 2, confidence: 2, ambition: 1 } },
      { text: '🌊 Calm and deep', dimensions: { resilience: 2, intelligence: 2, empathy: 1 } },
      { text: '🔥 Bold and unstoppable', dimensions: { confidence: 3, ambition: 2 } },
      { text: '🌻 Warm and uplifting', dimensions: { empathy: 2, humor: 2, loyalty: 1 } },
    ],
  },
  {
    text: 'How would you describe {name} in exactly one word?',
    category: 'personality',
    options: [
      { text: 'Brilliant', dimensions: { intelligence: 3, creativity: 1 } },
      { text: 'Loyal', dimensions: { loyalty: 3, trustworthiness: 2 } },
      { text: 'Bold', dimensions: { confidence: 3, ambition: 1 } },
      { text: 'Kind', dimensions: { empathy: 3, charisma: 1 } },
    ],
  },
  {
    text: 'What would {name} do with ₹1 crore?',
    category: 'personality',
    options: [
      { text: 'Start a business immediately', dimensions: { ambition: 3, innovation: 2, leadership: 1 } },
      { text: 'Invest and plan for the future', dimensions: { intelligence: 3, resilience: 1 } },
      { text: 'Help family and friends first', dimensions: { empathy: 2, loyalty: 3 } },
      { text: 'Travel the world', dimensions: { creativity: 2, confidence: 2 } },
    ],
  },
  {
    text: 'Which fictional character is {name} most like?',
    category: 'personality',
    options: [
      { text: 'Sherlock Holmes — brilliant mind', dimensions: { intelligence: 3, innovation: 2 } },
      { text: 'Samwise Gamgee — the loyalest friend', dimensions: { loyalty: 3, empathy: 2, trustworthiness: 1 } },
      { text: 'Tony Stark — confident genius', dimensions: { confidence: 3, creativity: 2, humor: 1 } },
      { text: 'Dumbledore — wise and caring', dimensions: { empathy: 2, intelligence: 2, leadership: 2 } },
    ],
  },
  {
    text: "What's {name}'s communication style?",
    category: 'personality',
    options: [
      { text: 'Direct and honest — no sugarcoating', dimensions: { confidence: 3, leadership: 1 } },
      { text: 'Thoughtful — chooses words carefully', dimensions: { intelligence: 2, empathy: 2 } },
      { text: 'Enthusiastic — talks with passion', dimensions: { charisma: 3, creativity: 1 } },
      { text: 'Witty — everything sounds funny', dimensions: { humor: 3, charisma: 1 } },
    ],
  },
]

// ─── FRIENDSHIP Questions ──────────────────────

const FRIENDSHIP_QUESTIONS: QuestionTemplate[] = [
  {
    text: 'How well does {name} keep secrets?',
    category: 'friendship',
    options: [
      { text: 'Would literally die before telling anyone', dimensions: { trustworthiness: 3, loyalty: 2 } },
      { text: 'Pretty good, but might hint at it', dimensions: { trustworthiness: 1, humor: 1 } },
      { text: 'Depends on how juicy the secret is 😂', dimensions: { humor: 2, trustworthiness: -1 } },
      { text: "Let's just say... I don't tell them secrets", dimensions: { humor: 1, trustworthiness: -2 } },
    ],
  },
  {
    text: "If you're going through a tough time, {name} would...",
    category: 'friendship',
    options: [
      { text: 'Drop everything and be there immediately', dimensions: { loyalty: 3, empathy: 2 } },
      { text: 'Give the most thoughtful advice', dimensions: { intelligence: 2, empathy: 2 } },
      { text: 'Distract you with fun to make you forget', dimensions: { humor: 2, charisma: 2 } },
      { text: 'Create a whole action plan to fix it', dimensions: { leadership: 2, ambition: 2 } },
    ],
  },
  {
    text: 'What kind of friend is {name}?',
    category: 'friendship',
    options: [
      { text: 'The mom friend — takes care of everyone', dimensions: { empathy: 3, loyalty: 2 } },
      { text: 'The hype friend — biggest cheerleader', dimensions: { charisma: 3, humor: 1 } },
      { text: 'The real one — tells you the truth', dimensions: { trustworthiness: 3, confidence: 1 } },
      { text: 'The planner — organizes all hangouts', dimensions: { leadership: 2, loyalty: 2 } },
    ],
  },
  {
    text: 'How would {name} handle a fight with a close friend?',
    category: 'friendship',
    options: [
      { text: 'Talk it out maturely and resolve it', dimensions: { empathy: 3, resilience: 1 } },
      { text: 'Give space and wait for things to cool down', dimensions: { resilience: 2, intelligence: 2 } },
      { text: 'Apologize first even if they\'re right', dimensions: { empathy: 2, loyalty: 2 } },
      { text: 'Stand their ground until they get an apology', dimensions: { confidence: 3, resilience: 1 } },
    ],
  },
  {
    text: 'What would a road trip with {name} be like?',
    category: 'friendship',
    options: [
      { text: 'Non-stop laughing and chaotic fun', dimensions: { humor: 3, charisma: 2 } },
      { text: 'Deep conversations at 3 AM', dimensions: { empathy: 2, intelligence: 2 } },
      { text: 'Perfectly planned with a full itinerary', dimensions: { leadership: 2, ambition: 2 } },
      { text: 'Spontaneous detours and adventures', dimensions: { creativity: 3, confidence: 1 } },
    ],
  },
  {
    text: 'Can you count on {name} at 3 AM?',
    category: 'friendship',
    options: [
      { text: '100% — they\'d pick up on the first ring', dimensions: { loyalty: 3, empathy: 2, trustworthiness: 1 } },
      { text: 'Probably — but might take a few tries', dimensions: { loyalty: 1, resilience: 1 } },
      { text: 'They\'d respond to the text at 8 AM', dimensions: { humor: 1, resilience: 1 } },
      { text: 'They ARE the reason I\'m up at 3 AM', dimensions: { humor: 2, charisma: 2 } },
    ],
  },
  {
    text: '{name}\'s friendship love language is...',
    category: 'friendship',
    options: [
      { text: 'Quality time — always wants to hang out', dimensions: { loyalty: 2, empathy: 2 } },
      { text: 'Words — hypes you up and gives compliments', dimensions: { charisma: 3, empathy: 1 } },
      { text: 'Acts of service — helps without being asked', dimensions: { trustworthiness: 2, loyalty: 2 } },
      { text: 'Memes — sends the perfect meme at the perfect time', dimensions: { humor: 3, creativity: 1 } },
    ],
  },
  {
    text: 'If your friend group was a team, {name} would be...',
    category: 'friendship',
    options: [
      { text: 'The captain — everyone follows their lead', dimensions: { leadership: 3, confidence: 2 } },
      { text: 'The glue — holds everyone together', dimensions: { empathy: 3, loyalty: 2 } },
      { text: 'The wildcard — keeps things unpredictable', dimensions: { creativity: 2, humor: 2, confidence: 1 } },
      { text: 'The brain — the smart one who has all the answers', dimensions: { intelligence: 3, innovation: 1 } },
    ],
  },
]

// ─── CAREER Questions ──────────────────────────

const CAREER_QUESTIONS: QuestionTemplate[] = [
  {
    text: 'What career would suit {name} perfectly?',
    category: 'career',
    options: [
      { text: 'Startup founder / Entrepreneur', dimensions: { ambition: 3, leadership: 2, innovation: 2 } },
      { text: 'Creative director / Designer', dimensions: { creativity: 3, charisma: 1, innovation: 1 } },
      { text: 'Research scientist / Engineer', dimensions: { intelligence: 3, resilience: 2 } },
      { text: 'Counselor / Psychologist', dimensions: { empathy: 3, trustworthiness: 2 } },
    ],
  },
  {
    text: 'In a work setting, {name} would be the person who...',
    category: 'career',
    options: [
      { text: 'Pitches the boldest ideas', dimensions: { creativity: 2, confidence: 3, innovation: 1 } },
      { text: 'Gets the actual work done silently', dimensions: { resilience: 3, intelligence: 1 } },
      { text: 'Motivates the entire team', dimensions: { leadership: 2, charisma: 3 } },
      { text: 'Notices when someone is struggling', dimensions: { empathy: 3, loyalty: 1 } },
    ],
  },
  {
    text: "What's {name}'s biggest professional strength?",
    category: 'career',
    options: [
      { text: 'Problem-solving and critical thinking', dimensions: { intelligence: 3, innovation: 2 } },
      { text: 'Communication and people skills', dimensions: { charisma: 3, empathy: 1 } },
      { text: 'Vision and big-picture thinking', dimensions: { ambition: 3, creativity: 1 } },
      { text: 'Reliability and consistency', dimensions: { trustworthiness: 3, resilience: 2 } },
    ],
  },
  {
    text: 'Will {name} be successful in 10 years?',
    category: 'career',
    options: [
      { text: 'Already is — it\'s just a matter of time', dimensions: { ambition: 3, confidence: 2 } },
      { text: 'Yes, but they\'ll take an unconventional path', dimensions: { creativity: 2, innovation: 2 } },
      { text: 'Yes — they\'re the hardest worker I know', dimensions: { resilience: 3, ambition: 1 } },
      { text: 'They\'ll find their own definition of success', dimensions: { empathy: 2, intelligence: 1, creativity: 1 } },
    ],
  },
  {
    text: 'If {name} gave a TED talk, it would be about...',
    category: 'career',
    options: [
      { text: 'Innovation and disrupting the status quo', dimensions: { innovation: 3, ambition: 2 } },
      { text: 'Human connection and emotional intelligence', dimensions: { empathy: 3, charisma: 1 } },
      { text: 'Overcoming challenges and mental resilience', dimensions: { resilience: 3, confidence: 1 } },
      { text: 'Something nobody else has thought of yet', dimensions: { creativity: 3, intelligence: 1 } },
    ],
  },
  {
    text: "What's {name} secretly good at that could be a career?",
    category: 'career',
    options: [
      { text: 'Influencing people — born marketer', dimensions: { charisma: 3, confidence: 2 } },
      { text: 'Understanding systems — could run anything', dimensions: { intelligence: 2, leadership: 2, innovation: 1 } },
      { text: 'Making people feel heard — therapist energy', dimensions: { empathy: 3, trustworthiness: 1 } },
      { text: 'Content creation — their brain is a content machine', dimensions: { creativity: 3, humor: 1 } },
    ],
  },
  {
    text: '{name} as a boss would be...',
    category: 'career',
    options: [
      { text: 'The cool boss everyone loves', dimensions: { charisma: 3, humor: 1, leadership: 1 } },
      { text: 'The tough but fair boss who pushes you to grow', dimensions: { leadership: 3, ambition: 1 } },
      { text: 'The boss who remembers your birthday', dimensions: { empathy: 2, loyalty: 2, trustworthiness: 1 } },
      { text: 'The genius boss with a crazy vision', dimensions: { intelligence: 2, innovation: 2, ambition: 1 } },
    ],
  },
]

// ─── FUN Questions ─────────────────────────────

const FUN_QUESTIONS: QuestionTemplate[] = [
  {
    text: 'If {name} was a Marvel character, they\'d be...',
    category: 'fun',
    options: [
      { text: 'Iron Man — genius with swagger', dimensions: { intelligence: 2, confidence: 2, humor: 1 } },
      { text: 'Captain America — moral compass', dimensions: { leadership: 2, trustworthiness: 2, loyalty: 1 } },
      { text: 'Black Widow — underestimated but lethal', dimensions: { resilience: 2, confidence: 2, intelligence: 1 } },
      { text: 'Spider-Man — funny, smart, and relatable', dimensions: { humor: 2, empathy: 2, creativity: 1 } },
    ],
  },
  {
    text: 'What would {name} be famous for?',
    category: 'fun',
    options: [
      { text: 'Building a billion-dollar company', dimensions: { ambition: 3, leadership: 2 } },
      { text: 'Going viral for something hilarious', dimensions: { humor: 3, charisma: 2 } },
      { text: 'Creating something artistic that changes culture', dimensions: { creativity: 3, innovation: 1 } },
      { text: 'Being the friend everyone wishes they had', dimensions: { empathy: 2, loyalty: 2, trustworthiness: 1 } },
    ],
  },
  {
    text: 'What\'s {name}\'s spirit animal?',
    category: 'fun',
    options: [
      { text: 'Lion — bold, powerful, commanding', dimensions: { leadership: 3, confidence: 2 } },
      { text: 'Dolphin — smart, social, playful', dimensions: { intelligence: 2, humor: 2, charisma: 1 } },
      { text: 'Wolf — loyal, strategic, pack-oriented', dimensions: { loyalty: 3, resilience: 1, leadership: 1 } },
      { text: 'Owl — wise, observant, mysterious', dimensions: { intelligence: 3, creativity: 1 } },
    ],
  },
  {
    text: 'If {name} was a flavor, they\'d be...',
    category: 'fun',
    options: [
      { text: 'Spicy 🌶️ — bold and unforgettable', dimensions: { confidence: 3, charisma: 1 } },
      { text: 'Sweet 🍯 — warm and comforting', dimensions: { empathy: 3, loyalty: 1 } },
      { text: 'Sour 🍋 — keeps you on your toes', dimensions: { humor: 2, creativity: 2 } },
      { text: 'Umami 🍜 — complex and deeply satisfying', dimensions: { intelligence: 2, innovation: 2 } },
    ],
  },
  {
    text: 'What would {name} do during a zombie apocalypse?',
    category: 'fun',
    options: [
      { text: 'Lead the group — natural survivor', dimensions: { leadership: 3, resilience: 2 } },
      { text: 'Build the shelter — engineer mode', dimensions: { intelligence: 2, innovation: 2 } },
      { text: 'Keep morale up with humor', dimensions: { humor: 3, charisma: 1 } },
      { text: 'Protect the weak — guardian energy', dimensions: { empathy: 2, loyalty: 2, trustworthiness: 1 } },
    ],
  },
  {
    text: 'What song plays when {name} enters a room?',
    category: 'fun',
    options: [
      { text: '"Eye of the Tiger" — pure power energy', dimensions: { confidence: 3, ambition: 1 } },
      { text: '"Here Comes the Sun" — warm and uplifting', dimensions: { empathy: 2, charisma: 2 } },
      { text: '"Bohemian Rhapsody" — complex and iconic', dimensions: { creativity: 3, intelligence: 1 } },
      { text: '"Uptown Funk" — party vibes only', dimensions: { humor: 2, charisma: 2, confidence: 1 } },
    ],
  },
  {
    text: '{name} in 2035 will probably be...',
    category: 'fun',
    options: [
      { text: 'Running their own company', dimensions: { ambition: 3, leadership: 2, innovation: 1 } },
      { text: 'Living their best life traveling the world', dimensions: { creativity: 2, confidence: 2 } },
      { text: 'The friend who organized the reunion', dimensions: { loyalty: 3, empathy: 1 } },
      { text: 'Famous for something unexpected', dimensions: { creativity: 2, humor: 2, charisma: 1 } },
    ],
  },
  {
    text: "Rate {name}'s main character energy (honestly)",
    category: 'fun',
    options: [
      { text: '💯 Full main character — they own every room', dimensions: { confidence: 3, charisma: 2 } },
      { text: '🎬 Main character who doesn\'t know it yet', dimensions: { creativity: 2, resilience: 2 } },
      { text: '🤝 The best supporting character ever', dimensions: { loyalty: 3, empathy: 2 } },
      { text: '🎭 Switches between main and side character', dimensions: { humor: 2, creativity: 2 } },
    ],
  },
]

// ─── COLLEGE Questions ─────────────────────────

const COLLEGE_QUESTIONS: QuestionTemplate[] = [
  {
    text: '{name} in college is the person who...',
    category: 'college',
    options: [
      { text: 'Actually attends every lecture', dimensions: { resilience: 2, ambition: 2 } },
      { text: 'Runs 3 societies and still has time for friends', dimensions: { leadership: 3, charisma: 1 } },
      { text: 'Is the group project MVP', dimensions: { intelligence: 2, trustworthiness: 2, loyalty: 1 } },
      { text: 'Is there for the vibes, not the degree', dimensions: { humor: 3, charisma: 1 } },
    ],
  },
  {
    text: "What's {name}'s reputation on campus?",
    category: 'college',
    options: [
      { text: 'The overachiever everyone respects', dimensions: { ambition: 3, intelligence: 1 } },
      { text: 'The social butterfly who knows everyone', dimensions: { charisma: 3, humor: 1 } },
      { text: 'The chill one who\'s secretly brilliant', dimensions: { intelligence: 2, resilience: 2 } },
      { text: 'The one everyone goes to for help', dimensions: { empathy: 2, trustworthiness: 2, loyalty: 1 } },
    ],
  },
  {
    text: 'During group projects, {name} is...',
    category: 'college',
    options: [
      { text: 'The one who does all the work', dimensions: { resilience: 3, intelligence: 1 } },
      { text: 'The one who presents like a pro', dimensions: { charisma: 3, confidence: 2 } },
      { text: 'The one who comes up with the best ideas', dimensions: { creativity: 3, innovation: 1 } },
      { text: 'The one who keeps the team from falling apart', dimensions: { leadership: 2, empathy: 2 } },
    ],
  },
  {
    text: 'What will {name} be remembered for in college?',
    category: 'college',
    options: [
      { text: 'Starting something epic (a club, event, or project)', dimensions: { leadership: 3, innovation: 2 } },
      { text: 'Being the person who brought everyone together', dimensions: { empathy: 2, charisma: 2, loyalty: 1 } },
      { text: 'Their incredible grades or thesis', dimensions: { intelligence: 3, ambition: 1 } },
      { text: 'The legendary party stories', dimensions: { humor: 3, confidence: 1, charisma: 1 } },
    ],
  },
  {
    text: '{name}\'s college WhatsApp group energy is...',
    category: 'college',
    options: [
      { text: 'Sends important deadlines + resources', dimensions: { trustworthiness: 3, intelligence: 1 } },
      { text: 'Non-stop memes and voice notes', dimensions: { humor: 3, charisma: 1 } },
      { text: 'The one who plans all the meetups', dimensions: { leadership: 2, loyalty: 2 } },
      { text: 'Lurks but drops wisdom occasionally', dimensions: { intelligence: 2, resilience: 2 } },
    ],
  },
]

// ─── Question Bank Map ─────────────────────────

const QUESTION_BANK: Record<QuestionCategory, QuestionTemplate[]> = {
  personality: PERSONALITY_QUESTIONS,
  friendship: FRIENDSHIP_QUESTIONS,
  career: CAREER_QUESTIONS,
  fun: FUN_QUESTIONS,
  college: COLLEGE_QUESTIONS,
}

/**
 * Select questions for a profile based on chosen categories.
 * Personalizes question text with the user's name.
 * Returns 10-15 questions with balanced category distribution.
 */
export function getQuestionsForProfile(
  displayName: string,
  categories: QuestionCategory[],
  maxQuestions = 12
): { text: string; category: QuestionCategory; options: QuestionOption[] }[] {
  const selected: { text: string; category: QuestionCategory; options: QuestionOption[] }[] = []
  if (categories.length === 0) return selected

  // Calculate how many questions per category
  const perCategory = Math.ceil(maxQuestions / categories.length)

  for (const cat of categories) {
    const pool = QUESTION_BANK[cat] ?? []
    // Shuffle the pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    // Take up to perCategory questions
    const picked = shuffled.slice(0, perCategory)

    for (const q of picked) {
      selected.push({
        text: q.text.replace(/\{name\}/g, displayName),
        category: q.category,
        options: q.options,
      })
    }
  }

  // Shuffle final selection and trim to maxQuestions
  return selected
    .sort(() => Math.random() - 0.5)
    .slice(0, maxQuestions)
}

/**
 * Get all available categories with their question counts
 */
export function getCategoryInfo(): { category: QuestionCategory; count: number; label: string; emoji: string }[] {
  return [
    { category: 'personality', count: PERSONALITY_QUESTIONS.length, label: 'Personality', emoji: '🧠' },
    { category: 'friendship', count: FRIENDSHIP_QUESTIONS.length, label: 'Friendship', emoji: '💛' },
    { category: 'career', count: CAREER_QUESTIONS.length, label: 'Career', emoji: '🚀' },
    { category: 'fun', count: FUN_QUESTIONS.length, label: 'Fun', emoji: '🎉' },
    { category: 'college', count: COLLEGE_QUESTIONS.length, label: 'College', emoji: '🎓' },
  ]
}
