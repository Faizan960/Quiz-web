// ─────────────────────────────────────────────────
// Social Mirror — Compositional Report Generator
// Builds unique reports from modular text fragments
// No third-party AI — pure algorithmic composition
// ─────────────────────────────────────────────────

import { DIMENSION_LABELS, getTopDimensions, getBottomDimensions } from './archetypes'
import type { Archetype } from '@/types/social-mirror'

// ─── Types ─────────────────────────────────────

export interface GeneratorContext {
  name: string
  interests: string[]
  scores: Record<string, number>
  archetype: Archetype
  responseCount: number
  topDims: string[]
  bottomDims: string[]
}

type ScoreLevel = 'stellar' | 'strong' | 'mid' | 'low'

// ─── Utilities ─────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function scoreLevel(score: number): ScoreLevel {
  if (score >= 85) return 'stellar'
  if (score >= 70) return 'strong'
  if (score >= 45) return 'mid'
  return 'low'
}

function cleanInterest(raw: string): string {
  // Remove emoji prefix: "💻 Tech" → "tech"
  return raw.replace(/^[^\w]+/, '').trim().toLowerCase()
}

function dimLabel(dim: string): string {
  return DIMENSION_LABELS[dim] ?? dim.charAt(0).toUpperCase() + dim.slice(1)
}

// ─── Score Pattern Detection ───────────────────

type ScorePattern =
  | 'dominant'     // One trait way above the rest
  | 'balanced'     // All scores within 15pts of each other
  | 'lopsided'     // Big gap between top and bottom
  | 'specialist'   // 2-3 traits clustered high, rest low
  | 'average'      // Default / moderate spread

function detectPattern(scores: Record<string, number>): ScorePattern {
  const vals = Object.values(scores)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const spread = max - min
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  const highCount = vals.filter(v => v >= 75).length

  if (spread <= 15) return 'balanced'
  if (max >= 90 && vals.filter(v => v >= max - 8).length === 1) return 'dominant'
  if (highCount >= 2 && highCount <= 3 && min < 40) return 'specialist'
  if (spread >= 50) return 'lopsided'
  return 'average'
}

// ─── Interest Metadata ─────────────────────────
// Maps each interest to roast/compliment/metaphor content

interface InterestData {
  roasts: string[]
  compliments: string[]
  metaphors: string[]
  talents: string[]
}

const INTEREST_MAP: Record<string, InterestData> = {
  tech: {
    roasts: [
      "you listed Tech as an interest which tracks — your social skills have the same update frequency as Internet Explorer",
      "a Tech person with that {bottom1} score? You've been debugging your personality for years and it's still in beta",
      "your friends basically confirmed what Stack Overflow already knew — you're better with machines than humans",
    ],
    compliments: [
      "your Tech brain means you approach friendships like elegant code — efficient, reliable, and always running",
      "being into Tech AND having that {top1} score shows you're not just smart, you're emotionally intelligent too — rare combo in your field",
      "the way you blend technical thinking with genuine {top1} is why people trust you with both their laptops and their feelings",
    ],
    metaphors: ['debugging life in real-time', 'running on a custom-built OS', 'the human API everyone wants to integrate with'],
    talents: ['Building tools that actually solve real problems', 'Explaining complex things so anyone gets it', 'Automating the boring stuff so people can focus on what matters'],
  },
  art: {
    roasts: [
      "you put Art as an interest and honestly? Your {bottom1} score is the most abstract art piece here — nobody can understand it",
      "claiming Art while your {bottom1} sits at {bottom1_pct}% is like putting a filter on a blurry photo and calling it aesthetic",
      "your artistic eye is great but you're clearly not applying that creativity to your {bottom1} — that score is giving paint-by-numbers",
    ],
    compliments: [
      "your artistic soul combined with {top1_pct}% {top1} means you see beauty in people the way most artists see it in sunsets",
      "being into Art makes total sense — your friends see you as someone who creates beauty in every interaction, not just on canvas",
      "the way you blend Art with real {top1} is why people are drawn to you — you make the ordinary feel extraordinary",
    ],
    metaphors: ['painting the world in colors others can\'t see', 'a living masterpiece in progress', 'turning chaos into art'],
    talents: ['Seeing patterns and beauty where others see nothing', 'Expressing emotions through creative mediums', 'Designing experiences that leave lasting impressions'],
  },
  music: {
    roasts: [
      "Music lover with {bottom1_pct}% {bottom1}? Your personality has the same range as a broken speaker — one note",
      "you vibe to Music but your {bottom1} score tells me your life playlist is just one sad song on repeat",
      "listing Music as an interest is bold when your personality has less rhythm than a dad at a wedding",
    ],
    compliments: [
      "your love for Music and your {top1_pct}% {top1} create a harmony that your friends genuinely feel — you're the soundtrack to their best memories",
      "Music lovers with your level of {top1} are rare — you understand that life, like music, is about feeling deeply",
      "the rhythm you bring to friendships is why people keep coming back — you're the melody in a world of noise",
    ],
    metaphors: ['orchestrating vibes wherever they go', 'a walking playlist of good energy', 'someone who hears the music in silence'],
    talents: ['Setting the perfect mood for any moment', 'Understanding emotions through rhythm and melody', 'Bringing people together through shared musical moments'],
  },
  books: {
    roasts: [
      "you read Books but clearly skipped the chapter on {bottom1} — that score is unedited first-draft energy",
      "a bookworm with {bottom1_pct}% {bottom1}? All that reading and you still haven't figured out the basics",
      "listing Books is cute but your {bottom1} score suggests you've been reading fiction about having a personality",
    ],
    compliments: [
      "your love for Books and {top1_pct}% {top1} shows a depth that most people can't even pretend to have — you're the real deal",
      "readers like you with genuine {top1} are the ones who actually absorb life lessons, not just page counts",
      "your book-fueled wisdom combined with that {top1} score is why people come to you when they need real perspective",
    ],
    metaphors: ['a walking library of wisdom and warmth', 'someone whose mind has more chapters than most people\'s lives', 'the person who reads between the lines of people too'],
    talents: ['Giving advice that sounds like it came from a bestseller', 'Understanding human nature at a deeper level than most', 'Turning experiences into stories worth remembering'],
  },
  gaming: {
    roasts: [
      "Gaming as an interest with that {bottom1} score? You've been grinding XP in the wrong skill tree your whole life",
      "a Gamer with {bottom1_pct}% {bottom1} — you have max stats in everything except real life",
      "your friends love you but they also think your {bottom1} has the same HP as a tutorial enemy — critically low",
    ],
    compliments: [
      "Gamers with {top1_pct}% {top1} are the MVPs of friend groups — strategic, loyal, and always ready to carry the team",
      "your Gaming brain gives you something most people lack: the ability to strategize, adapt, and level up in real life too",
      "the {top1} you bring to your friendships has the same energy as a clutch play — everyone remembers it",
    ],
    metaphors: ['speedrunning life on hard mode', 'the player who carries the whole squad', 'treating every challenge like a boss fight'],
    talents: ['Strategic thinking that applies to real-world problems', 'Team coordination under pressure', 'Pattern recognition that borders on supernatural'],
  },
  sports: {
    roasts: [
      "Sports fan with {bottom1_pct}% {bottom1}? Your personality is like a team that peaked in pre-season and tanked after",
      "you listed Sports but that {bottom1} score has benchwarmer energy — always there, never contributing",
      "a Sports person whose friends rate their {bottom1} that low? Even the ref would call a foul on that",
    ],
    compliments: [
      "your Sports mentality combined with {top1_pct}% {top1} makes you the teammate everyone wants — competitive but genuinely caring",
      "athletes with your {top1} score bring the same intensity to friendships as they do to the field — and that's everything",
      "the Sports discipline you carry into your relationships is rare — you show up, you compete, and you never give up on your people",
    ],
    metaphors: ['bringing championship energy to everyday life', 'the coach everyone wishes they had', 'playing life like every moment is the final quarter'],
    talents: ['Pushing people to be their best without being annoying about it', 'Handling pressure like a pro athlete on game day', 'Building team spirit in any group they join'],
  },
  movies: {
    roasts: [
      "Movies as an interest with that {bottom1} score? Your personality is like a sequel nobody asked for — same plot, less depth",
      "a film buff whose {bottom1} is at {bottom1_pct}%? Even M. Night Shyamalan couldn't write a twist to fix that",
      "you watch Movies but your {bottom1} score has straight-to-DVD energy — it exists, but nobody's checking for it",
    ],
    compliments: [
      "your love for Movies and {top1_pct}% {top1} means you see life in cinematic detail — and your friends are lucky to be part of your story",
      "movie lovers with your depth of {top1} understand that the best stories are about people, not plots — and you live that",
      "the way you blend cinematic thinking with real {top1} makes every hangout feel like a scene worth remembering",
    ],
    metaphors: ['living life in widescreen', 'the director of their own story', 'someone who turns Monday into a movie moment'],
    talents: ['Reading people like a film script', 'Turning ordinary moments into memorable stories', 'Understanding emotions through the lens of storytelling'],
  },
  photography: {
    roasts: [
      "Photography lover but your {bottom1} is at {bottom1_pct}%? You can frame a sunset but can't frame a personality",
      "into Photography with that {bottom1}? You see beauty everywhere except in your own growth areas",
      "your eye for Photos is great but your friends wish you'd focus on your {bottom1} with the same attention to detail",
    ],
    compliments: [
      "your Photography eye plus {top1_pct}% {top1} means you see the best in people AND know how to capture it — literally and figuratively",
      "photographers with your {top1} don't just take pictures — they notice things about people that nobody else does",
      "the way you see the world through a lens of {top1} and beauty is genuinely rare — your friends feel seen by you",
    ],
    metaphors: ['seeing the world in golden hour', 'someone who focuses on what matters', 'capturing moments that last forever'],
    talents: ['Noticing details about people that others completely miss', 'Creating beauty from the ordinary', 'Preserving memories that define friendships'],
  },
  travel: {
    roasts: [
      "Travel as an interest but {bottom1_pct}% {bottom1}? You've seen the whole world and still haven't found your personality",
      "a traveler with that {bottom1} score — you explore everywhere except your own growth areas",
      "you love Travel which makes sense because your {bottom1} has been on vacation for years — it's certainly not showing up",
    ],
    compliments: [
      "your Travel spirit combined with {top1_pct}% {top1} makes you the friend who brings the world to every conversation",
      "travelers with your {top1} don't just visit places — they collect perspectives that make them better friends",
      "the way Travel has shaped your {top1} is why people feel like every conversation with you is a journey worth taking",
    ],
    metaphors: ['someone whose heart has no borders', 'collecting experiences like passport stamps', 'bringing the world to every room they enter'],
    talents: ['Adapting to any social situation like a seasoned traveler', 'Making strangers feel like old friends', 'Bringing fresh perspectives from every experience'],
  },
  cooking: {
    roasts: [
      "Cooking as an interest with that {bottom1}? You can follow a recipe but your personality is still unseasoned",
      "a chef-at-heart whose {bottom1} is {bottom1_pct}%? That's a burnt dish if I've ever seen one — and no amount of garnish saves it",
      "you love Cooking which explains why your {bottom1} is half-baked — you took it out of the oven too early",
    ],
    compliments: [
      "your Cooking soul and {top1_pct}% {top1} show that you nourish people in every way — with food and with friendship",
      "people who Cook with your level of {top1} understand that the secret ingredient is always care — and you bring it every time",
      "the warmth you bring to a kitchen is the same warmth you bring to friendships — and that's why people love being around you",
    ],
    metaphors: ['adding flavor to every interaction', 'someone who nourishes souls not just stomachs', 'the secret ingredient in every friend group'],
    talents: ['Making people feel at home no matter where they are', 'Bringing groups together through shared experiences', 'Turning simple moments into something nourishing'],
  },
  wellness: {
    roasts: [
      "Wellness enthusiast with {bottom1_pct}% {bottom1}? You've aligned your chakras but your personality is still misaligned",
      "you're into Wellness but your {bottom1} score needs more healing than a year-long retreat can provide",
      "manifesting a better {bottom1} score? That's the real mindfulness exercise you're missing",
    ],
    compliments: [
      "your Wellness journey and {top1_pct}% {top1} show genuine self-awareness — you work on yourself AND show up for others",
      "wellness-minded people with your {top1} don't just take care of themselves — they heal the energy of every room they enter",
      "the inner peace you cultivate through Wellness radiates outward — your friends feel it in your {top1}",
    ],
    metaphors: ['radiating calm in a chaotic world', 'someone whose presence is its own form of healing', 'proof that growth is beautiful'],
    talents: ['Making stressed people feel instantly calmer', 'Giving advice that\'s actually grounded and helpful', 'Holding space for people without judgment'],
  },
  writing: {
    roasts: [
      "a Writer with {bottom1_pct}% {bottom1}? You can write a whole novel but apparently can't write yourself a better personality chapter",
      "you love Writing which tracks because your {bottom1} reads like a first draft nobody edited",
      "listing Writing but having that {bottom1}? The character development in your life needs a serious rewrite",
    ],
    compliments: [
      "your Writing soul and {top1_pct}% {top1} mean you understand people at a level most can only dream of — you're a student of the human experience",
      "writers with your {top1} don't just tell stories — they become the story that others want to be part of",
      "the depth that Writing gives you combined with real {top1} makes you the friend whose words actually land and stay",
    ],
    metaphors: ['someone who writes their own story and helps others write theirs', 'a wordsmith of real life', 'turning feelings into something tangible'],
    talents: ['Articulating what others feel but can\'t express', 'Making people feel understood through words', 'Crafting moments that feel written by fate'],
  },
  science: {
    roasts: [
      "Science lover with {bottom1_pct}% {bottom1}? You can explain quantum physics but can't figure out basic social dynamics",
      "you're into Science but your {bottom1} defies every known law of self-improvement — it's just stuck",
      "listing Science while having that {bottom1}? Even a hypothesis about your growth would be more optimistic than this data",
    ],
    compliments: [
      "your Science brain and {top1_pct}% {top1} create someone who approaches life with both logic and heart — the best of both worlds",
      "scientists with your {top1} bring rigor to their friendships — when they show up, it's based on evidence, not obligation",
      "the curiosity that Science fuels in you extends to people — and that {top1} score proves you're genuinely invested in understanding others",
    ],
    metaphors: ['approaching life like a beautiful experiment', 'someone who finds wonder in the data of daily life', 'the hypothesis everyone wants to prove right'],
    talents: ['Problem-solving friendships like equations — finding what actually works', 'Asking questions that make people think differently', 'Bringing logic to emotional chaos in the most helpful way'],
  },
  business: {
    roasts: [
      "Business-minded with {bottom1_pct}% {bottom1}? Your personal brand needs more work than your LinkedIn profile",
      "you love Business which explains why you treat your {bottom1} like a failing department — just ignore it and hope it fixes itself",
      "a Business person whose friends rate their {bottom1} that low? Even your board of directors would call for a restructure",
    ],
    compliments: [
      "your Business mindset and {top1_pct}% {top1} show that you know the most valuable investment is in people — and you're all in",
      "business thinkers with your {top1} understand that relationships are the real currency — and you're rich",
      "the strategic thinking you bring from Business combined with genuine {top1} makes you the leader every group needs but rarely gets",
    ],
    metaphors: ['someone who invests in people like a long-term portfolio', 'the CEO of their friend group', 'building relationships with the same precision as a business plan'],
    talents: ['Networking in a way that feels genuine, not transactional', 'Seeing potential in people before they see it themselves', 'Turning chaos into organized, executable plans'],
  },
  theatre: {
    roasts: [
      "Theatre kid with {bottom1_pct}% {bottom1}? Your whole personality is a performance — and that score is the bad review",
      "you love Theatre but your {bottom1} has understudy energy — always there, never actually performing",
      "listing Theatre makes sense because your friends think your {bottom1} is purely fictional — an act you haven't rehearsed",
    ],
    compliments: [
      "your Theatre soul and {top1_pct}% {top1} mean you bring drama to life in the best way — you make every moment feel important",
      "theatre people with your {top1} understand that life is about showing up fully — and you never phone it in",
      "the expressiveness Theatre gives you combined with real {top1} makes you unforgettable in the best possible way",
    ],
    metaphors: ['turning life into a standing ovation', 'someone whose presence commands the room', 'performing authenticity in a world of masks'],
    talents: ['Making people feel like the main character', 'Reading a room better than a seasoned actor reads a script', 'Bringing emotional depth to every conversation'],
  },
  environment: {
    roasts: [
      "Environment lover with {bottom1_pct}% {bottom1}? You want to save the planet but can't save your own personality score",
      "you care about the Environment but your {bottom1} has the carbon footprint of a coal plant — heavy and outdated",
      "eco-warrior with that {bottom1}? Some things can't be recycled — like that score",
    ],
    compliments: [
      "your passion for the Environment and {top1_pct}% {top1} show you care about the big picture AND the people in it",
      "environmentally-conscious people with your {top1} bring the same nurturing energy to friendships as they do to the planet",
      "the way you care for the Environment mirrors how you care for people — deeply, consistently, and without expecting anything back",
    ],
    metaphors: ['nurturing people the way they nurture the planet', 'someone whose roots run deep', 'growing alongside everyone around them'],
    talents: ['Thinking about the long game in relationships', 'Caring about things bigger than themselves', 'Inspiring others to be better without being preachy'],
  },
  puzzles: {
    roasts: [
      "Puzzles as an interest but {bottom1_pct}% {bottom1}? You solve problems for fun but your personality is still an unsolved mystery",
      "you love Puzzles which is ironic because your friends can't figure out why your {bottom1} is so low — it's the real puzzle",
      "puzzle brain with that {bottom1}? Some pieces of your personality are clearly still missing from the box",
    ],
    compliments: [
      "your love for Puzzles and {top1_pct}% {top1} means you approach friendships like a challenge worth solving — with patience and care",
      "puzzle lovers with your {top1} see connections others miss — and that makes you an incredibly perceptive friend",
      "the problem-solving mind you bring to Puzzles extends to your friendships — you figure people out and love them for who they really are",
    ],
    metaphors: ['connecting pieces that nobody else can see', 'solving the puzzle of people', 'someone who finds the missing piece in every situation'],
    talents: ['Untangling complex social situations with ease', 'Finding solutions when everyone else is stuck', 'Seeing how different people fit together perfectly'],
  },
  guitar: {
    roasts: [
      "Guitar player with {bottom1_pct}% {bottom1}? You've got the chords but your personality is still out of tune",
      "you play Guitar which is cute but your {bottom1} has the same energy as learning Wonderwall and thinking you're a musician",
      "listing Guitar while your {bottom1} is that low? Your emotional range has fewer strings than your instrument",
    ],
    compliments: [
      "your Guitar soul and {top1_pct}% {top1} create a harmony that people feel — you're someone who resonates deeply",
      "musicians with your {top1} put the same passion into people as they do into playing — and that dedication shows",
      "the discipline Guitar requires mirrors the dedication you bring to friendships — consistent, passionate, and always improving",
    ],
    metaphors: ['striking the right chord with everyone', 'someone whose presence has its own melody', 'playing the soundtrack to their friends\' best moments'],
    talents: ['Setting emotional tones in any group', 'Expressing feelings when words aren\'t enough', 'Creating moments of pure connection through passion'],
  },
  fitness: {
    roasts: [
      "Fitness lover with {bottom1_pct}% {bottom1}? You're training every muscle except your personality",
      "you're into Fitness but your {bottom1} has never seen the inside of a gym — it's weak and it shows",
      "listing Fitness with that {bottom1}? You can bench press 200 but can't lift your social awareness above {bottom1_pct}%",
    ],
    compliments: [
      "your Fitness discipline and {top1_pct}% {top1} prove that you're committed to growth in every area — body AND character",
      "fitness people with your {top1} bring the same 'no excuses' energy to friendships — and that consistency is what makes you irreplaceable",
      "the mental toughness Fitness builds in you extends to how you show up for people — and your {top1} score is proof",
    ],
    metaphors: ['training for life, not just the gym', 'someone who never skips heart day', 'building strength that goes beyond the physical'],
    talents: ['Pushing themselves and others to grow without burning out', 'Showing discipline that inspires everyone around them', 'Knowing that real strength is about showing up every single day'],
  },
  pets: {
    roasts: [
      "Pets lover with {bottom1_pct}% {bottom1}? Your dog gives you unconditional love because it can't read your score card",
      "you listed Pets which makes sense — you need at least one relationship where the other party can't judge your {bottom1}",
      "a pet parent with that {bottom1}? Your animal likes you more than your personality stats suggest anyone should",
    ],
    compliments: [
      "your love for Pets and {top1_pct}% {top1} show a heart that has endless room for care — and your friends feel every bit of it",
      "pet lovers with your {top1} bring the same warmth to humans as they do to animals — gentle, patient, and unconditional",
      "the nurturing energy you pour into your Pets is the same energy your friends see in you — it's why they feel safe around you",
    ],
    metaphors: ['someone whose heart has room for every living thing', 'bringing unconditional love to a conditional world', 'the friend who makes you feel like a golden retriever felt — pure joy'],
    talents: ['Making everyone feel cared for without effort', 'Reading emotional cues that others completely miss', 'Creating safe spaces where people can be themselves'],
  },
}

// ─── Roast Fragments ───────────────────────────

const ROAST_OPENINGS = [
  "Alright {name}, your friends have spoken and... wow. Let's unpack this.",
  "Okay {name}, buckle up because {response_count} people just collectively dragged you and I'm just the messenger.",
  "So {name}, {response_count} of your closest friends answered questions about you. The good news? They participated. The bad news? Keep reading.",
  "{name}. {response_count} people. One verdict. And it's... interesting.",
  "Let's be real, {name} — you asked for this. {response_count} friends answered. Here's what they actually think.",
  "Dear {name}, I regret to inform you that {response_count} people have filed a personality report. The findings are as follows.",
  "{name}, your {response_count} friends sat down, answered honestly, and what came back is... a lot. Let's go.",
  "Breaking news: {name} thought they were a main character. {response_count} friends have entered the chat with a reality check.",
  "You wanted the truth, {name}? {response_count} people gave it to you. No refunds.",
  "Alright {name}, this is your social autopsy. {response_count} witnesses. Zero objections. Let's proceed.",
]

const ROAST_SCORE_OBSERVATIONS: Record<string, string[]> = {
  dominant: [
    "Your entire personality is basically just {top1} in a trench coat pretending to be a whole person. {top1_pct}% in one area and tumbleweeds everywhere else.",
    "You're like a one-trick pony but the trick is {top1} and honestly? Your friends are getting tired of the show.",
    "Your {top1} at {top1_pct}% is doing all the heavy lifting while your other traits are on permanent vacation.",
  ],
  balanced: [
    "Your scores are so balanced it's almost concerning — you're equally mediocre at everything. No standouts, no disasters. Just... aggressively average.",
    "Congratulations on being the most well-rounded bowl of oatmeal. Nothing terrible, nothing exciting. Just consistent beige energy.",
    "Every single one of your traits is sitting in the same mid-range zone. Your friends essentially said 'they're fine' in eleven different ways.",
  ],
  lopsided: [
    "The gap between your {top1} ({top1_pct}%) and your {bottom1} ({bottom1_pct}%) is giving emotional whiplash. It's like you maxed out one stat and forgot the rest exist.",
    "Your {top1} is at {top1_pct}% which is genuinely impressive. But then your {bottom1} walks in at {bottom1_pct}% and undoes all that good work.",
    "{top1_pct}% {top1}. {bottom1_pct}% {bottom1}. The range here is giving Jekyll and Hyde but make it ✨social✨.",
  ],
  specialist: [
    "You've got this cluster of {top1} and {top2} that's genuinely strong, but everything below that is giving 'we don't talk about that' energy.",
    "Your top traits form this little exclusive club and they're apparently not letting your {bottom1} or {bottom2} in. Membership denied.",
    "Strong {top1} and {top2}? Great. But your other scores are looking at your highlights like they're watching from the nosebleed section.",
  ],
  average: [
    "Your {top1} sits at {top1_pct}% which is solid, but let's talk about that {bottom1} at {bottom1_pct}%. Your friends are being diplomatic but the numbers aren't.",
    "Not gonna lie, your {top1} ({top1_pct}%) gives your friend group something to work with. But then there's {bottom1} at {bottom1_pct}%, which is... yeah.",
    "You've got a decent {top1} game at {top1_pct}%, but your {bottom1} is {bottom1_pct}% which means somewhere, somehow, you just stopped trying.",
  ],
}

const ROAST_CLOSINGS = [
  "But hey, {response_count} people answered, which means {response_count} people care about you. That's more than most. Now work on that {bottom1}. 💀",
  "Look, at the end of the day, you're a '{archetype}' — and that's not nothing. Just maybe also be a person who works on their {bottom1}. Just a thought. 😂",
  "In summary: you're lovable, you're flawed, and your friends think your {bottom1} needs CPR. Welcome to being human, {name}. 🫡",
  "Don't be mad — your friends literally took time out of their day to answer questions about you. That's love. Tough love, but love. Now go fix that {bottom1}. 💅",
  "The verdict? You're a '{archetype}' with a side of 'needs improvement.' But honestly? We all are. Yours is just documented now. 😭",
  "At least you know the truth now. And the truth is: you're great at {top1}, terrible at {bottom1}, and exactly the kind of mess your friends signed up for. ❤️‍🔥",
  "Your friends roasted you with data. You can't even be mad. Just impressed. And maybe a little wounded. 💀",
  "Remember: this isn't a personal attack. It's a peer-reviewed personality audit. And you failed {bottom1}. But you passed everything else. Mostly. 🎓",
]

// ─── Compliment Fragments ──────────────────────

const COMPLIMENT_OPENINGS = [
  "{name}, {response_count} people took time out of their day to answer questions about you. That alone says everything about the kind of person you are.",
  "Here's something beautiful, {name}: {response_count} people who actually know you sat down and collectively said — this person matters.",
  "You asked how people see you, {name}. And {response_count} friends responded with something genuinely beautiful.",
  "{name}. {response_count} people. One clear message: you are deeply valued.",
  "This isn't just a quiz result, {name}. These are {response_count} real people reflecting back what they see in you — and it's stunning.",
  "If you ever doubt your impact, {name}, remember this: {response_count} people chose to spend their time telling the world who you are.",
  "What {response_count} of your friends just said about you, {name}? It's the kind of thing everyone deserves to hear at least once.",
  "{name}, your friends didn't just answer questions. They painted a portrait of someone genuinely extraordinary.",
]

const COMPLIMENT_SCORE_OBSERVATIONS: Record<string, string[]> = {
  dominant: [
    "Your {top1} at {top1_pct}% isn't just a score — it's a defining trait that makes you unforgettable. When people think of {top1}, they think of you.",
    "There's a reason your {top1} stands out at {top1_pct}%: it's the trait that your friends experience most powerfully. It's your signature.",
    "A {top1_pct}% in {top1} means this isn't something you try to be — it's who you are at your core, and everyone around you feels it.",
  ],
  balanced: [
    "Your scores are beautifully balanced — and that's actually rare. It means you show up as a complete, multidimensional person in every room you enter.",
    "Most people have spikes and dips. You? You bring consistency across the board. Your friends see someone who is genuinely well-rounded — and that's a quiet superpower.",
    "The fact that every trait scores solidly means your friends don't love you for one thing — they love you for everything you are.",
  ],
  lopsided: [
    "Your {top1} at {top1_pct}% is extraordinary — it's the trait that defines how your friends experience you, and it leaves a lasting impression.",
    "Not everyone gets a {top1_pct}% in anything. The fact that your friends collectively elevated your {top1} to that level means it's genuinely undeniable.",
    "You have a superpower and it's {top1}. At {top1_pct}%, it's not just a trait — it's a force that shapes how everyone around you feels.",
  ],
  specialist: [
    "Your {top1} and {top2} together create a powerful combination — {top1_pct}% and {top2_pct}% respectively. These are the traits that make you irreplaceable in your circle.",
    "Having both {top1} ({top1_pct}%) and {top2} ({top2_pct}%) is rare. Most people are strong in one. You bring both, and your friends notice.",
    "The {top1}-{top2} combination you carry is like a one-two punch of genuine human quality. Your friends are lucky to be on the receiving end.",
  ],
  average: [
    "Your {top1} at {top1_pct}% backed by {top2} at {top2_pct}% creates someone who is both powerful and grounded. That's genuinely admirable.",
    "{top1_pct}% in {top1} and {top2_pct}% in {top2}? That's not just good — that's the kind of person who changes the dynamic of every group they join.",
    "What stands out is your {top1} at {top1_pct}% — not because it's the highest, but because your friends feel it every single time they're around you.",
  ],
}

const COMPLIMENT_CLOSINGS = [
  "You're a '{archetype},' {name}. And that's not just a label — it's a reflection of someone who leaves a mark on every person they meet. Keep being exactly who you are. ✨",
  "The world doesn't have enough people like you, {name}. {response_count} friends just confirmed what anyone who knows you already feels — you're extraordinary. 💛",
  "{name}, you're a '{archetype}' — someone who {archetype_desc}. Never forget that {response_count} people chose to remind you of this. 🌟",
  "Here's the truth nobody tells you enough, {name}: you make people's lives better just by being in them. {response_count} friends just proved it. 💜",
  "Don't ever let anyone dim what makes you special, {name}. {response_count} people see it. Now you see it too. Keep shining, '{archetype}.' ✨",
  "Remember this report on the hard days, {name}. {response_count} real people said: you are valued, you are seen, and you are genuinely loved for who you are. 💛",
  "{name}, you're the kind of friend that {response_count} people bragged about through their answers. That's your legacy. Own it. 🫶",
]

// ─── Strength / Weakness / Talent Fragments ────

const STRENGTH_FRAGMENTS: Record<string, Record<ScoreLevel, string[]>> = {
  leadership: {
    stellar: ['A natural-born leader who commands respect without demanding it — people follow because they genuinely want to', 'Leadership energy so strong that rooms reorganize themselves when they walk in'],
    strong: ['Steps up when it counts and leads with a steady hand', 'Has leadership potential that comes out powerfully in the right moments'],
    mid: ['Shows leadership when they believe in the cause — selective but genuine', 'Leads by example rather than by force'],
    low: ['Quietly supportive in a way that lifts others without taking the spotlight', 'Chooses to empower rather than lead — and that has its own strength'],
  },
  creativity: {
    stellar: ['A creative mind that sees possibilities where others see dead ends — genuinely innovative thinking', 'Creativity that borders on visionary — they don\'t think outside the box, they redesign it'],
    strong: ['Brings creative energy to every problem — their ideas consistently surprise people', 'Has an imagination that turns mundane situations into something memorable'],
    mid: ['Creative when inspired — and when they get going, the ideas flow beautifully', 'Brings just enough creative flair to keep things interesting'],
    low: ['Grounded and practical — sometimes the most creative solution is the simplest one', 'Values substance over style in a world that needs more of that'],
  },
  empathy: {
    stellar: ['Emotional intelligence that reads rooms like open books — they feel what others feel before words are spoken', 'An empath in the truest sense — people feel understood just by being around them'],
    strong: ['Deeply caring in a way that makes people feel safe and heard', 'Their empathy isn\'t performative — it\'s genuine, consistent, and deeply felt'],
    mid: ['Shows genuine care when it matters most — reliable emotional presence', 'Empathetic in the moments that count, even if they don\'t show it every second'],
    low: ['Practical and honest — sometimes the kindest thing is the truth, not sympathy', 'Values directness over coddling, which the right people deeply appreciate'],
  },
  ambition: {
    stellar: ['A fire that burns bright and never goes out — their ambition inspires everyone in their orbit', 'Relentlessly driven in a way that\'s genuinely inspiring, not exhausting'],
    strong: ['Has clear goals and the discipline to chase them — ambition backed by action', 'Ambitious enough to dream big and grounded enough to execute'],
    mid: ['Selectively ambitious — pours energy into what truly matters to them', 'Ambitious where it counts, balanced where it matters'],
    low: ['Finds peace in contentment — not everyone needs to chase more, and that\'s valid', 'Their definition of success is about fulfillment, not accolades'],
  },
  humor: {
    stellar: ['Could make a therapist laugh mid-session — timing and wit that\'s genuinely world-class', 'Humor that heals, connects, and turns terrible days into something bearable'],
    strong: ['Consistently funny in a way that feels natural, not forced — people genuinely light up around them', 'Brings levity to heavy situations without minimizing anyone\'s feelings'],
    mid: ['Has a dry wit that catches people off guard — funny when they want to be', 'Their humor is selective and that makes it hit harder when it lands'],
    low: ['Takes things seriously in a world that sometimes needs that — depth over laughs', 'Their strength is in sincerity, and people trust them for it'],
  },
  trustworthiness: {
    stellar: ['The human vault — people trust them with their deepest secrets because they\'ve earned it a hundred times over', 'Trustworthiness so strong that their word is literally law among their friends'],
    strong: ['Reliable and consistent — when they make a promise, it\'s as good as done', 'The kind of person you\'d trust with your life and never think twice'],
    mid: ['Trustworthy when it matters most — comes through in the moments that count', 'Reliable in the ways that define real friendship'],
    low: ['Still building trust in some areas, but their intentions are always genuine', 'Growing into the kind of reliability that will define them long-term'],
  },
  intelligence: {
    stellar: ['Thinks at a speed and depth that most people can\'t keep up with — genuinely brilliant', 'An intellectual powerhouse who connects dots across disciplines effortlessly'],
    strong: ['Sharp and perceptive — catches things others completely miss', 'Smart in a way that\'s useful, not intimidating — they share their insight generously'],
    mid: ['Has intellectual curiosity that drives them to understand things deeply when interested', 'Smart in the ways that matter — emotional intelligence, street smarts, and booksmarts combined'],
    low: ['Values wisdom over raw intelligence — and that distinction matters', 'Their strength is in intuition and gut feeling, not textbook analysis'],
  },
  charisma: {
    stellar: ['Walks into a room and the energy shifts — a magnetic presence that people gravitate toward naturally', 'Charisma so powerful it should come with a warning label — genuinely captivating'],
    strong: ['Has a presence that makes people want to be around them — warm, engaging, and memorable', 'Charismatic in a way that feels real, not performed — that\'s the rarest kind'],
    mid: ['Shines in the right settings — when comfortable, their charisma lights up the whole room', 'Has a quiet magnetism that draws the right people in'],
    low: ['Their strength is in substance over flash — the people who know them, know how special they are', 'Doesn\'t need the spotlight to make an impact — their influence is deeper than surface charm'],
  },
  resilience: {
    stellar: ['Has been through things that would break most people and came out not just okay, but stronger — genuinely inspiring', 'Mental toughness that sets the standard for everyone around them'],
    strong: ['Bounces back from setbacks with a speed and grace that others envy', 'Resilient in a way that makes hardship look manageable — and that lifts everyone up'],
    mid: ['Takes hits, processes, and comes back — their resilience is quiet but real', 'Shows strength in adversity when it matters most'],
    low: ['Feels things deeply — and vulnerability is its own form of courage', 'Their sensitivity isn\'t weakness — it\'s a depth of feeling that most people lack'],
  },
  loyalty: {
    stellar: ['Once you\'re in their circle, you\'re there for life — loyalty that transcends circumstance', 'The kind of friend who would show up at 3 AM, no questions asked, every single time'],
    strong: ['Loyal in a way that\'s both fierce and gentle — they protect their people', 'When they commit to a friendship, they commit with their whole heart'],
    mid: ['Loyal to the people who earn it — selective but genuine in their devotion', 'Shows up when it counts and that consistency builds real trust'],
    low: ['Values independence — and the relationships they do invest in get their full attention', 'Loyal on their own terms, which means when they show up, it\'s always real'],
  },
  innovation: {
    stellar: ['Sees the future before it arrives — an innovator who doesn\'t just think differently, they think ahead', 'Creates solutions to problems people haven\'t even identified yet'],
    strong: ['Brings fresh perspectives that consistently push groups forward', 'Innovative in ways that actually matter — their ideas have real impact'],
    mid: ['Has innovative moments that surprise and delight — creativity on demand', 'Thinks differently when the situation calls for it'],
    low: ['Values proven approaches — and there\'s wisdom in knowing what already works', 'Their strength is in execution and refinement, not reinvention'],
  },
  confidence: {
    stellar: ['Carries themselves with an energy that\'s undeniable — their confidence inspires everyone around them', 'Self-assured without being arrogant — the rarest and most magnetic form of confidence'],
    strong: ['Confident in a way that lifts others up — their belief in themselves extends to belief in their friends', 'Has a quiet confidence that speaks louder than any bravado'],
    mid: ['Confident when they believe in something — and that selective conviction is powerful', 'Shows confidence in the moments that matter most'],
    low: ['Has depths that they don\'t always show — and that untapped potential is genuinely exciting', 'Their humility is a strength that the right people recognize and deeply respect'],
  },
}

const WEAKNESS_FRAGMENTS: Record<string, string[]> = {
  leadership: [
    'Can sometimes hang back when the group needs someone to step up — their voice deserves to be heard more',
    'Has leadership potential that stays dormant when they second-guess themselves',
    'Could stand to trust their instincts more in group settings — they\'re better at leading than they think',
  ],
  creativity: [
    'Tends to stick with safe choices when their creative instincts could take them somewhere amazing',
    'Has creative potential locked behind a wall of practical thinking — let it out sometimes',
    'Could afford to take more creative risks — their ideas are better than they give themselves credit for',
  ],
  empathy: [
    'Sometimes so focused on logic or goals that they miss the emotional undercurrent in conversations',
    'Could check in on friends more — not because they don\'t care, but because they forget that presence matters',
    'Has room to grow in reading between the lines of what people are really saying',
  ],
  ambition: [
    'Could dream bigger — they have more potential than they\'re currently tapping into',
    'Sometimes settles into comfort zones when they\'re capable of so much more',
    'Needs to give themselves permission to want more — ambition isn\'t selfish, it\'s fuel',
  ],
  humor: [
    'Takes things more seriously than necessary sometimes — learning to laugh at life would help',
    'Could stand to let their guard down more — humor is vulnerability, and they\'re safe enough to try',
    'Has a serious side that dominates — but when their humor peeks through, it\'s genuinely great',
  ],
  trustworthiness: [
    'Building deeper trust takes time with them — but the patience is worth it for those who stay',
    'Could be more transparent about their feelings — vulnerability builds trust faster than perfection',
    'Sometimes walls up in ways that make people wonder where they stand — openness would help',
  ],
  intelligence: [
    'Sometimes overthinks to the point of paralysis — trusting gut instincts more would help',
    'Has intellectual capability that gets buried under distraction or self-doubt',
    'Could benefit from applying their intelligence more consistently — the potential is clearly there',
  ],
  charisma: [
    'Has more personality than they let the world see — opening up would change everything',
    'Their depth gets lost because they hold back in groups — the real them is worth showing off',
    'Could command more attention if they believed they deserved it — because they absolutely do',
  ],
  resilience: [
    'Takes setbacks harder than they need to — building bounce-back muscle would be transformative',
    'Sometimes lets tough moments linger longer than necessary — they\'re stronger than they realize',
    'Could practice letting go faster — not everything that goes wrong defines what comes next',
  ],
  loyalty: [
    'Sometimes spreads themselves thin across too many people — depth over breadth would serve them',
    'Could show up more consistently for their closest people — quality time matters',
    'Has a wide circle but could invest more deeply in the inner ring — those people would love it',
  ],
  innovation: [
    'Tends to follow established paths when they have the ability to carve new ones',
    'Has original ideas that stay in their head — the world needs them shared more often',
    'Could push their thinking further — their innovative moments hint at something much bigger',
  ],
  confidence: [
    'Doesn\'t always see how capable they actually are — they sell themselves short regularly',
    'Needs to internalize what their friends clearly already see — they are genuinely impressive',
    'Could use a healthy dose of self-belief — the evidence for their greatness is already there',
  ],
}

// ─── Composition Functions ─────────────────────

function substituteVars(template: string, ctx: GeneratorContext): string {
  const top = ctx.topDims
  const bottom = ctx.bottomDims
  return template
    .replace(/\{name\}/g, ctx.name)
    .replace(/\{response_count\}/g, String(ctx.responseCount))
    .replace(/\{archetype\}/g, ctx.archetype.name)
    .replace(/\{archetype_desc\}/g, ctx.archetype.description.toLowerCase())
    .replace(/\{top1\}/g, dimLabel(top[0]))
    .replace(/\{top2\}/g, dimLabel(top[1] ?? top[0]))
    .replace(/\{top3\}/g, dimLabel(top[2] ?? top[0]))
    .replace(/\{bottom1\}/g, dimLabel(bottom[0]))
    .replace(/\{bottom2\}/g, dimLabel(bottom[1] ?? bottom[0]))
    .replace(/\{top1_pct\}/g, String(ctx.scores[top[0]] ?? 50))
    .replace(/\{top2_pct\}/g, String(ctx.scores[top[1]] ?? 50))
    .replace(/\{top3_pct\}/g, String(ctx.scores[top[2]] ?? 50))
    .replace(/\{bottom1_pct\}/g, String(ctx.scores[bottom[0]] ?? 50))
    .replace(/\{bottom2_pct\}/g, String(ctx.scores[bottom[1]] ?? 50))
}

function getInterestData(interests: string[]): InterestData | null {
  for (const raw of interests) {
    const key = cleanInterest(raw)
    if (INTEREST_MAP[key]) return INTEREST_MAP[key]
  }
  // Try partial matching
  for (const raw of interests) {
    const key = cleanInterest(raw)
    for (const [mapKey, data] of Object.entries(INTEREST_MAP)) {
      if (key.includes(mapKey) || mapKey.includes(key)) return data
    }
  }
  return null
}

// ─── Public API ────────────────────────────────

export function createContext(
  name: string,
  interests: string[],
  scores: Record<string, number>,
  archetype: Archetype,
  responseCount: number
): GeneratorContext {
  return {
    name,
    interests,
    scores,
    archetype,
    responseCount,
    topDims: getTopDimensions(scores, 4),
    bottomDims: getBottomDimensions(scores, 3),
  }
}

export function composeRoast(ctx: GeneratorContext): string {
  const pattern = detectPattern(ctx.scores)
  const interestData = getInterestData(ctx.interests)

  // 1. Opening
  const opening = substituteVars(pick(ROAST_OPENINGS), ctx)

  // 2. Score observation based on pattern
  const observationPool = ROAST_SCORE_OBSERVATIONS[pattern] ?? ROAST_SCORE_OBSERVATIONS.average!
  const observation = substituteVars(pick(observationPool), ctx)

  // 3. Interest-based roast (if available)
  let interestRoast = ''
  if (interestData && interestData.roasts.length > 0) {
    interestRoast = ' ' + substituteVars(
      "Oh, and " + pick(interestData.roasts),
      ctx
    )
  }

  // 4. Closing
  const closing = substituteVars(pick(ROAST_CLOSINGS), ctx)

  return `${opening} ${observation}${interestRoast} ${closing}`
}

export function composeCompliment(ctx: GeneratorContext): string {
  const pattern = detectPattern(ctx.scores)
  const interestData = getInterestData(ctx.interests)

  // 1. Opening
  const opening = substituteVars(pick(COMPLIMENT_OPENINGS), ctx)

  // 2. Score observation
  const observationPool = COMPLIMENT_SCORE_OBSERVATIONS[pattern] ?? COMPLIMENT_SCORE_OBSERVATIONS.average!
  const observation = substituteVars(pick(observationPool), ctx)

  // 3. Interest-based compliment (if available)
  let interestCompliment = ''
  if (interestData && interestData.compliments.length > 0) {
    interestCompliment = ' ' + substituteVars(pick(interestData.compliments), ctx)
  }

  // 4. Closing
  const closing = substituteVars(pick(COMPLIMENT_CLOSINGS), ctx)

  return `${opening} ${observation}${interestCompliment} ${closing}`
}

export function composeStrengths(ctx: GeneratorContext, count = 3): string[] {
  const result: string[] = []
  const usedDims = new Set<string>()

  for (const dim of ctx.topDims) {
    if (result.length >= count) break
    if (usedDims.has(dim)) continue
    usedDims.add(dim)

    const level = scoreLevel(ctx.scores[dim] ?? 50)
    const pool = STRENGTH_FRAGMENTS[dim]?.[level] ?? [`Exceptional ${dimLabel(dim).toLowerCase()}`]
    result.push(pick(pool))
  }

  return result
}

export function composeWeaknesses(ctx: GeneratorContext, count = 2): string[] {
  const result: string[] = []
  const usedDims = new Set<string>()

  for (const dim of ctx.bottomDims) {
    if (result.length >= count) break
    if (usedDims.has(dim)) continue
    usedDims.add(dim)

    const pool = WEAKNESS_FRAGMENTS[dim] ?? [`Room to grow in ${dimLabel(dim).toLowerCase()}`]
    result.push(pick(pool))
  }

  return result
}

export function composeHiddenTalent(ctx: GeneratorContext): string {
  const interestData = getInterestData(ctx.interests)

  // Try interest-based talent first
  if (interestData && interestData.talents.length > 0) {
    return pick(interestData.talents)
  }

  // Fall back to 3rd-4th strongest dimension talent
  const hiddenDim = ctx.topDims[2] ?? ctx.topDims[1] ?? ctx.topDims[0]
  const level = scoreLevel(ctx.scores[hiddenDim] ?? 50)
  const pool = STRENGTH_FRAGMENTS[hiddenDim]?.[level]
  if (pool && pool.length > 0) {
    return pick(pool)
  }

  // Ultimate fallback
  const metaphors = interestData?.metaphors ?? ['Something extraordinary that hasn\'t been discovered yet']
  return pick(metaphors)
}

export function composeFriendImpression(ctx: GeneratorContext): string {
  const interestData = getInterestData(ctx.interests)
  const pattern = detectPattern(ctx.scores)

  const impressions: string[] = [
    `The kind of ${ctx.archetype.name.toLowerCase()} who makes you believe the archetype actually exists in real life`,
    `Someone who embodies ${dimLabel(ctx.topDims[0]).toLowerCase()} so naturally that it feels effortless — even when it's not`,
    `The friend who proves that ${dimLabel(ctx.topDims[0]).toLowerCase()} and ${dimLabel(ctx.topDims[1]).toLowerCase()} can coexist beautifully in one person`,
    `A rare combination of strength and warmth that makes everyone around them feel simultaneously challenged and safe`,
    `The person in every group who you'd describe in two words and mean it: genuinely special`,
    `Someone whose ${dimLabel(ctx.topDims[0]).toLowerCase()} isn't a performance — it's so deeply embedded in who they are that people feel it without being told`,
    `The friend everyone describes differently because they show up uniquely for each person — and that's the highest compliment`,
    `Someone who makes the people around them want to be better — not through pressure, but through quiet, undeniable example`,
  ]

  if (pattern === 'balanced') {
    impressions.push('The most well-rounded person in any room — jack of all trades and genuinely good at most of them')
  }

  if (interestData?.metaphors) {
    impressions.push(...interestData.metaphors.map(m =>
      `A person best described as ${m} — and everyone who knows them would agree`
    ))
  }

  return pick(impressions)
}
