<div align="center">
  <h1>🪞 Social Mirror (Quizly)</h1>
  <p><strong>A premium, AI-powered interactive SaaS for anonymous friend Q&As, personality perception metrics, and custom trivia games.</strong></p>
  <p>
    <a href="#-design-aesthetics">Aesthetics</a> •
    <a href="#-core-features">Features</a> •
    <a href="#-how-it-works">How It Works</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

---

Social Mirror is a trend-setting social application designed to help people discover how their friends truly perceive them. By combining highly engaging UI/UX with a powerful **Algorithmic AI Engine**, Social Mirror turns simple Q&A into personalized, highly-sharable personality reports.

## ✨ Design Aesthetics: "Cyber-Cream Minimalist"

Social Mirror completely discards default browser styles and stark dark themes in favor of an elegant, tactile light-mode design system:
- **Base Canvas**: Soft warm alabaster/sand background (`#FAF8F5`) paired with pure-white floating panels (`#FFFFFF`).
- **Tactile Boundaries**: Micro-fine warm borders (`#EBE7E0`) and soft, high-fidelity offset shadows.
- **Accent Flows**: Vibrant electric lilac-to-rose gradients (`from-[#7C3AED] to-[#EC4899]`) and floating, blurred pastel blobs that dynamically drift in the background.
- **Typography Hierarchy**: Distinct display-style headings (**Syne** font) paired with clean geometric body text (**DM Sans**).
- **Claymorphic Controls**: Inset wells, glassmorphic capsule indicators, and smooth Framer Motion-powered slide transitions.

---

## 🚀 Core Features

### 🧠 The "AI" Engine (Dynamic Composition Engine)
The heart of Social Mirror. It dynamically analyzes user score patterns (e.g., 'dominant', 'lopsided', 'balanced') and uniquely combines hundreds of pre-written roasts, compliments, and insights based on the user's selected interests to create the illusion of a highly personalized, witty AI. *(Currently being upgraded to integrate native Google Gemini LLM capabilities!)*

### 📊 SVG Radar Insights Dashboard
A comprehensive, animated profile insights page featuring:
- **Interactive Radar Chart**: A custom SVG heptagon grid displaying normalized personality scores across core dimensions (Charisma, Resilience, Loyalty, Innovation, Confidence, Warmth, Wit).
- **Chronological Response Timeline**: A Stripe-inspired timeline showing response milestones.
- **PIN-Protected Data Access**: Responses details, respondent names, and timestamps are encrypted behind the creator's secure PIN lock.

### 📱 Dynamic Instagram/Snapchat Story Cards
Server-side generation of high-resolution personality archetype cards utilizing **Satori** and **resvg-js** for instant sharing on social media stories. This is the primary viral growth loop of the application.

### ⚡ Keyboard-Driven Questionnaire Deck
A full-screen mobile-optimized card-deck questionnaire for gathering feedback. Users can click options or use keyboard shortcuts (pressing `A` to `D` or `1` to `4`) for lightning-fast feedback collection, complete with smooth card slide-outs.

### 👑 Admin Command Center
A comprehensive admin suite consisting of:
- **Dashboard Metrics**: Active users, quiz plays, reported listings, and mock weekly engagement graphs.
- **Ad Slots Manager**: Granular controls to toggle advertising slots and inject raw AdSense publisher code snippets.
- **Moderation Tools**: Full user dashboard suspension controls and trivia index banning/starring capabilities.

---

## ⚙️ How It Works

1. **Onboarding**: A user signs up via the split-screen onboarding wizard, picks a secure PIN, and selects their top 5 interests.
2. **Sharing**: The user generates a custom Quiz Link and shares it to their Instagram/Snapchat story using the dynamic Satori image generator.
3. **Answering**: Friends swipe through the Keyboard-Driven Questionnaire Deck, answering questions about the user's personality.
4. **Analysis**: The AI Engine processes the raw scores into dimensions and archetypes.
5. **The Reveal**: The user logs in with their PIN to unlock their SVG Radar Dashboard and reads their personalized, AI-generated roasts and compliments.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router, Turbopack, Server Actions)
- **Runtime Logic**: React 19, TypeScript
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS v4, PostCSS
- **Database & Storage**: Supabase (PostgreSQL tables, custom stored procedures, and triggers)
- **Image Compilation**: Satori (HTML-to-SVG converter) and `@resvg/resvg-js` (Rust-backed SVG-to-PNG renderer)
- **Icons**: Lucide React

---

## 📂 Project Directory Structure

```bash
├── app/                       # Next.js App Router folders
│   ├── [username]/            # Friend response answering decks
│   │   └── report/            # User insights dashboard, stats, and timeline
│   ├── admin/                 # Control panel login and configurations
│   ├── api/                   # Server endpoints (ads, moderation, AI generation)
│   ├── create/                # Step-by-step profile onboarding wizard
│   ├── play/[slug]/           # Trivia gameplay interface
│   └── page.tsx               # Landing portal and interactive preview
├── components/                # Modular client components (RadarCharts, Cards)
├── lib/                       # Utilities and engine computation modules
│   ├── database/              # Supabase clients and helper configurations
│   ├── engine/                # Quiz generators, scoring engines, and AI logic
│   └── monitoring/            # Global errors and metrics loggers
├── scripts/                   # CLI verification and setup assets
├── types/                     # Shared TypeScript definition types
└── SETUP-SOCIAL-MIRROR.sql    # Core database tables, triggers, and functions
```

---

## 🏁 Getting Started

### 1. Prerequisites & Environment
Clone the repository and copy the environment variables template:
```bash
cp .env.example .env.local
```
Fill in the variables in `.env.local`:
- **Supabase Keys**: Retrieve credentials from your Supabase dashboard.
- **Admin Configuration**: Choose a secure `ADMIN_PASSWORD` (minimum 16 characters) and a secure `ADMIN_SECRET_TOKEN` (minimum 32 characters).
- **Gemini API Key** *(Coming Soon)*: Provide your Google Gemini key for LLM report generation.

### 2. Database Schema Setup
Run the SQL queries in `SETUP-DATABASE.sql` and `SETUP-SOCIAL-MIRROR.sql` inside your Supabase SQL Editor. This initializes:
- `sm_profiles`, `sm_questions`, `sm_responses` tables.
- RLS bypass rules and automated triggers configured with secure `search_path` attributes to safeguard database namespaces.

### 3. Install & Run
Install project packages:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🧪 Quality Assurance & Validations

To maintain production-grade quality, the codebase enforces strict lint and type checks:

- **Type-Check**: `npm run type-check`
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- **One-Step Validation**: `npm run validate` (Runs all three verification checks in sequence).

---

<div align="center">
  <i>Designed and built for aesthetic, engaging social experiences.</i>
</div>
