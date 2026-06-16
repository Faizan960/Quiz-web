import { resolve } from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in env variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Pool of 28 default questions (4 per dimension)
const DEFAULT_QUESTIONS = [
  // Charisma (4 questions)
  {
    text: "How easily do they command attention when entering a room?",
    dimension: "charisma",
    category: "personality",
    interest_tags: ["Social", "Vibe"],
    options: {
      A: "Immediately becomes the focus of conversation",
      B: "Walks in with a warm, steady presence",
      C: "Enters quietly but greets people individually",
      D: "Prefers to stay low-key in the background"
    }
  },
  {
    text: "If they were a brand, what would their marketing strategy be?",
    dimension: "charisma",
    category: "personality",
    interest_tags: ["Creative", "Business"],
    options: {
      A: "Viral TikTok campaigns and billboard ads",
      B: "Word-of-mouth recommendations and organic growth",
      C: "Exclusive, invite-only community access",
      D: "Niche forums and under-the-radar aesthetic blogs"
    }
  },
  {
    text: "How do they handle a conversational silence in a group?",
    dimension: "charisma",
    category: "personality",
    interest_tags: ["Social", "Vibes"],
    options: {
      A: "Instantly breaks it with a laugh or story",
      B: "Comfortably shifts to a new topic",
      C: "Waits patiently for someone else to speak",
      D: "Appreciates the quiet and checks their phone"
    }
  },
  {
    text: "Which animal represents their social presence?",
    dimension: "charisma",
    category: "personality",
    interest_tags: ["Fun", "Vibe"],
    options: {
      A: "Golden Retriever - energetic and loved by all",
      B: "Wolf - confident leader of the pack",
      C: "Cat - selective, elegant, and independent",
      D: "Owl - quiet watcher from the branches"
    }
  },

  // Resilience (4 questions)
  {
    text: "How do they bounce back after a major setback?",
    dimension: "resilience",
    category: "personality",
    interest_tags: ["Life", "Growth"],
    options: {
      A: "Shrugs it off, learns the lesson, and restarts immediately",
      B: "Takes a day to process, then builds a plan",
      C: "Needs support from friends before trying again",
      D: "Tends to dwell on it and stays discouraged for a bit"
    }
  },
  {
    text: "How do they react under sudden tight deadlines?",
    dimension: "resilience",
    category: "personality",
    interest_tags: ["Work", "Tech"],
    options: {
      A: "Locks in, works faster, and thrives on pressure",
      B: "Stays organized and tackles tasks step-by-step",
      C: "Gets slightly stressed but gets the job done",
      D: "Panics initially and needs a breather"
    }
  },
  {
    text: "If they lose a game, what is their response?",
    dimension: "resilience",
    category: "personality",
    interest_tags: ["Gaming", "Sports"],
    options: {
      A: "Laughs it off, says 'gg', and demands a rematch",
      B: "Analyses their mistakes to improve next time",
      C: "Accepts the loss gracefully but moves on",
      D: "Gets quietly annoyed and quits playing"
    }
  },
  {
    text: "How do they navigate a stressful travel delay?",
    dimension: "resilience",
    category: "personality",
    interest_tags: ["Travel", "Life"],
    options: {
      A: "Finds the nearest lounge and makes it an adventure",
      B: "Immediately maps out alternative flights",
      C: "Sighs and reads a book until it resolves",
      D: "Vents to customer service or texts their group chat"
    }
  },

  // Loyalty (4 questions)
  {
    text: "How reliable are they when a friend is in a crisis?",
    dimension: "loyalty",
    category: "personality",
    interest_tags: ["Friends", "Vibes"],
    options: {
      A: "Drops everything immediately to drive to them",
      B: "Calls to listen and offers practical solutions",
      C: "Sends a thoughtful text and checks in later",
      D: "Waits until they are asked specifically for help"
    }
  },
  {
    text: "How do they handle group gossip about someone they know?",
    dimension: "loyalty",
    category: "personality",
    interest_tags: ["Social", "Friends"],
    options: {
      A: "Shuts it down immediately and defends the person",
      B: "Steers the conversation to a positive subject",
      C: "Listens quietly but doesn't contribute",
      D: "Joins in with minor commentary or questions"
    }
  },
  {
    text: "If a friend cancels plans last minute, what do they do?",
    dimension: "loyalty",
    category: "personality",
    interest_tags: ["Friends", "Vibes"],
    options: {
      A: "Texts 'No worries at all! Hope you're okay! ❤️'",
      B: "Reschedules and suggests a different day",
      C: "Reacts with a simple thumb-up or 'ok'",
      D: "Gets slightly annoyed and makes other plans"
    }
  },
  {
    text: "How long do they keep secrets shared in confidence?",
    dimension: "loyalty",
    category: "personality",
    interest_tags: ["Friends", "Trust"],
    options: {
      A: "Carries them to the grave, no exceptions",
      B: "Keeps them unless it affects someone's safety",
      C: "Might share with a partner or one trusted sibling",
      D: "Accidentally lets it slip in casual conversation"
    }
  },

  // Innovation (4 questions)
  {
    text: "Where do their best ideas come from?",
    dimension: "innovation",
    category: "personality",
    interest_tags: ["Art", "Coding"],
    options: {
      A: "Shower thoughts or middle-of-the-night spark",
      B: "Brainstorming sessions with visual mood boards",
      C: "Analyzing existing models and tweaking them",
      D: "Standard instructions and checklists"
    }
  },
  {
    text: "How do they approach assembly instructions (like IKEA)?",
    dimension: "innovation",
    category: "personality",
    interest_tags: ["Creative", "Life"],
    options: {
      A: "Tosses the manual aside and guesses the assembly",
      B: "Glances at the pictures and builds dynamically",
      C: "Follows every instruction step-by-step",
      D: "Asks someone else to build it for them"
    }
  },
  {
    text: "If they had to write a book, what genre would it be?",
    dimension: "innovation",
    category: "personality",
    interest_tags: ["Books", "Movies"],
    options: {
      A: "Mind-bending sci-fi with alternative timelines",
      B: "A quirky indie comedy or graphic novel",
      C: "A detailed historical biography or textbook",
      D: "A standard autobiography or romance novel"
    }
  },
  {
    text: "How do they style their clothing or aesthetic?",
    dimension: "innovation",
    category: "personality",
    interest_tags: ["Fashion", "Style"],
    options: {
      A: "Thrifted, experimental, and unique mix",
      B: "Trendy streetwear or vintage vibes",
      C: "Minimalist, clean, and classic capsule",
      D: "Comfortable, plain hoodies and sweatpants"
    }
  },

  // Confidence (4 questions)
  {
    text: "How do they deliver a presentation or pitch?",
    dimension: "confidence",
    category: "personality",
    interest_tags: ["Work", "School"],
    options: {
      A: "Commands the stage, gestures, and makes jokes",
      B: "Speaks clearly and relies on prepared notes",
      C: "Paces slightly but answers questions well",
      D: "Stutters occasionally and looks at the slides"
    }
  },
  {
    text: "How do they respond to a direct compliment?",
    dimension: "confidence",
    category: "personality",
    interest_tags: ["Social", "Vibe"],
    options: {
      A: "Accepts it with a confident smile: 'Thanks, I know!'",
      B: "Says 'Thank you, appreciate that!'",
      C: "Deflects it: 'Oh, it was nothing really.'",
      D: "Blushes and immediately returns the compliment"
    }
  },
  {
    text: "How do they negotiate or state their price/worth?",
    dimension: "confidence",
    category: "personality",
    interest_tags: ["Tech", "Business"],
    options: {
      A: "States their number firmly and stands their ground",
      B: "Explains their value and negotiates rationally",
      C: "Offers a lower range to avoid conflict",
      D: "Accepts whatever number is offered first"
    }
  },
  {
    text: "What do they do if their order at a restaurant is wrong?",
    dimension: "confidence",
    category: "personality",
    interest_tags: ["Food", "Social"],
    options: {
      A: "Politely flags the server and asks for a remake",
      B: "Mentions it if it is a major issue",
      C: "Eats it anyway but complains to their friends",
      D: "Eats it in silence and says 'everything was great!'"
    }
  },

  // Warmth (4 questions)
  {
    text: "How do they greet friends after a long time?",
    dimension: "warmth",
    category: "personality",
    interest_tags: ["Friends", "Vibes"],
    options: {
      A: "Runs over, screams, and gives a massive hug",
      B: "Gives a warm hug and asks 'how have you been?'",
      C: "Waves with a big smile and a friendly handshake",
      D: "Gives a head nod and says 'hey, good to see you'"
    }
  },
  {
    text: "How do they respond to a friend sharing a sad story?",
    dimension: "warmth",
    category: "personality",
    interest_tags: ["Friends", "Trust"],
    options: {
      A: "Tears up, listens intently, and offers comforting hugs",
      B: "Listens quietly and says 'I'm so sorry you went through that'",
      C: "Tries to offer helpful suggestions or logical advice",
      D: "Nods along but doesn't know what to say"
    }
  },
  {
    text: "What do they do when hosting guests at their home?",
    dimension: "warmth",
    category: "personality",
    interest_tags: ["Food", "Travel"],
    options: {
      A: "Bakes cookies, prepares drinks, and makes them feel like royalty",
      B: "Provides snacks and checks on comfort periodically",
      C: "Tells them to help themselves to whatever is in the fridge",
      D: "Leaves them to their own devices"
    }
  },
  {
    text: "Which emoji do they send most to show affection?",
    dimension: "warmth",
    category: "personality",
    interest_tags: ["Social", "Vibe"],
    options: {
      A: "❤️ / 😘 (Hearts and kisses)",
      B: "🥰 / Hugs",
      C: "😊 / Grins",
      *D: "👍 / Cool"
    }
  },

  // Wit (4 questions)
  {
    text: "How fast is their response to a friendly roast?",
    dimension: "wit",
    category: "personality",
    interest_tags: ["Humor", "Memes"],
    options: {
      A: "Instantly fires back with a sharper comeback",
      B: "Laughs it off and finds a clever recovery",
      C: "Appreciates the humor but takes a second to think",
      D: "Quietly smiles and lets the moment slide"
    }
  },
  {
    text: "Which humor style defines their messaging?",
    dimension: "wit",
    category: "personality",
    interest_tags: ["Humor", "Memes"],
    options: {
      A: "Dry, sarcastic one-liners and deadpan jokes",
      B: "Relatable memes and trending pop culture references",
      C: "Silly puns and lighthearted dad jokes",
      D: "Mostly sends standard emojis and reaction gifs"
    }
  },
  {
    text: "How do they explain complex topics to someone?",
    dimension: "wit",
    category: "personality",
    interest_tags: ["Tech", "School"],
    options: {
      A: "Uses a funny, clever analogy that immediately clicks",
      B: "Breaks it down into simple, easy-to-understand terms",
      C: "Gives a detailed, technical explanation",
      D: "Tells them to Google it or watch a video"
    }
  },
  {
    text: "What is their reading of a double entendre?",
    dimension: "wit",
    category: "personality",
    interest_tags: ["Humor", "Pop"],
    options: {
      A: "Catches it instantly and plays along with a wink",
      B: "Notices it and chuckles quietly",
      C: "Takes it literally at first, then realizes",
      D: "Misses it entirely until explained"
    }
  }
]

// Add pre-made trivia quizzes
const DEFAULT_TRIVIA = [
  {
    slug: "gen-z-vibe-check",
    title: "Can You Pass This Gen-Z Vibe Check? 🎭",
    category: "Pop Culture",
    questions: [
      {
        question: "Which Gen-Z slang means 'that was embarrassing'?",
        options: ["No cap", "Slay", "Caught in 4K", "Bussin"],
        correct_index: 2
      },
      {
        question: "What does 'NPC' stand for in gaming and internet culture?",
        options: ["Non-Player Character", "New Player Code", "No Personal Content", "Next Player Call"],
        correct_index: 0
      },
      {
        question: "Which app popularised the vertical scrolling 'For You Page'?",
        options: ["Instagram", "Snapchat", "TikTok", "YouTube"],
        correct_index: 2
      },
      {
        question: "'Rizz' is shorthand for which personality characteristic?",
        options: ["Dancing skills", "Cooking ability", "Charisma", "Gaming speed"],
        correct_index: 2
      }
    ],
    play_count: 12500,
    is_banned: false
  },
  {
    slug: "aesthetic-match",
    title: "Ultimate Style & Aesthetic Matcher ✨",
    category: "Lifestyle",
    questions: [
      {
        question: "Which aesthetic features vintage cardigans, old books, and classic libraries?",
        options: ["Dark Academia", "Cottagecore", "Y2K Grunge", "Cyberpunk"],
        correct_index: 0
      },
      {
        question: "What colors define the 'Cottagecore' aesthetic?",
        options: ["Neon green and dark chrome", "Earthy browns, warm creams, and sage greens", "Hot pinks and baby blues", "All black and safety orange"],
        correct_index: 1
      },
      {
        question: "Which decade's fashion defines Y2K?",
        options: ["1970s", "1980s", "1990s", "Early 2000s"],
        correct_index: 3
      }
    ],
    play_count: 8700,
    is_banned: false
  }
]

async function seed() {
  console.log('🌱 Seeding Quizly Database...\n')

  try {
    // 1. Seed Questions
    console.log(`🔍 Seeding ${DEFAULT_QUESTIONS.length} default questions into public.sm_questions...`)
    
    // Clear existing active pool to prevent duplicates
    await supabase
      .from('sm_questions')
      .delete()
      .eq('is_active', true)

    const { error: qError } = await supabase
      .from('sm_questions')
      .insert(DEFAULT_QUESTIONS)

    if (qError) {
      throw new Error(`Error inserting default questions: ${qError.message}`)
    }
    console.log('✅ Default question pool seeded successfully!')

    // 2. Seed Trivia
    console.log(`\n🔍 Seeding ${DEFAULT_TRIVIA.length} pre-made trivia quizzes...`)
    
    // Clear existing
    for (const t of DEFAULT_TRIVIA) {
      await supabase.from('sm_trivia').delete().eq('slug', t.slug)
    }

    const { error: tError } = await supabase
      .from('sm_trivia')
      .insert(DEFAULT_TRIVIA)

    if (tError) {
      throw new Error(`Error inserting default trivia: ${tError.message}`)
    }
    console.log('✅ Trivia games seeded successfully!')

    console.log('\n✨ Database seeding completed successfully!')
    process.exit(0)
  } catch (err: any) {
    console.error(`\n❌ Seeding failed: ${err.message}`)
    process.exit(1)
  }
}

// Run seeder
seed()
