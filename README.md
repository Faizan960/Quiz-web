# 🪞 Social Mirror (Quizly)

An interactive, premium SaaS application designed for anonymous friend Q&As, personality perception metrics, and custom trivia games. Drawing visual inspiration from high-end **Awwwards**, **Dribbble**, and **Ionic** styles, it features a trend-setting **"Cyber-Cream Minimalist"** interface.

---

## ✨ Design Aesthetics: "Cyber-Cream Minimalist"

Social Mirror completely discards default browser styles and stark dark themes in favor of an elegant, tactile light-mode design system:
- **Base Canvas**: Soft warm alabaster/sand background (`#FAF8F5`) paired with pure-white floating panels (`#FFFFFF`).
- **Tactile Boundaries**: Micro-fine warm borders (`#EBE7E0`) and soft, high-fidelity offset shadows (`shadow-sm`, `.card-offset`).
- **Accent Flows**: Vibrant electric lilac-to-rose gradients (`from-[#7C3AED] to-[#EC4899]`) and floating, blurred pastel background blobs that dynamically drift.
- **Typography Hierarchy**: Distinct display-style headings (**Syne** font) paired with clean geometric body text (**DM Sans**).
- **Claymorphic Controls**: Inset wells, glassmorphic capsule indicators, and smooth Framer Motion-powered slide transitions.

---

## 🚀 Core Features

### 1. Onboarding Studio & Profile Wizard
A split-screen onboarding wizard that walks users through registering their username, choosing a secure access PIN, and selecting exactly 5 interests. Built with step indicators and animated selections.

### 2. Keyboard-Driven Questionnaire Deck
A full-screen mobile-optimized card-deck questionnaire for gathering feedback. Users can click options or use keyboard shortcuts (pressing `A` to `D` or `1` to `4`) for lightning-fast feedback collection, complete with smooth card slide-outs.

### 3. SVG Radar Insights Dashboard
A comprehensive profile insights page featuring:
- **Interactive Radar Chart**: A custom SVG heptagon grid displaying normalized personality scores across 7 core dimensions (Charisma, Resilience, Loyalty, Innovation, Confidence, Warmth, Wit).
- **Chronological Response Timeline**: A Linear/Stripe-inspired timeline showing response milestones.
- **PIN-Protected Data Access**: Responses details, respondent names, and timestamps are encrypted behind the creator's secure PIN lock.

### 4. Dynamic Instagram/Snapchat Story Cards
Server-side generation of high-resolution personality archetype cards utilizing **Satori** and **resvg-js** for instant sharing on social media stories. Built with robust ArrayBuffer caches to prevent font-fetch latency.

### 5. Admin Command Center
A comprehensive admin suite consisting of:
- **Dashboard Metrics**: Active users, quiz plays, reported listings, and mock weekly engagement graph visualizations.
- **Ad Slots Manager**: Granular controls to toggle advertising slots (Home Header, Footer, Result Page, Interstitial Questions) and inject raw AdSense publisher code snippets.
- **Moderation Tools**: Full user dashboard suspension controls and trivia index banning/starring capabilities.

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
│   ├── api/                   # Server endpoints (ads, moderation, scores)
│   ├── create/                # Step-by-step profile onboarding wizard
│   ├── play/[slug]/           # Trivia gameplay interface
│   ├── globals.css            # Tailwind theme tokens and custom utilities
│   └── page.tsx               # Landing portal and interactive preview
├── components/                # Modular client components
├── lib/                       # Utilities and engine computation modules
│   ├── database/              # Supabase clients and helper configurations
│   ├── engine/                # Quiz generators and scoring engines
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

### 2. Database Schema Setup
Run the SQL queries in `SETUP-DATABASE.sql` and `SETUP-SOCIAL-MIRROR.sql` inside your Supabase SQL Editor. This initializes:
- `sm_profiles`, `sm_questions`, `sm_responses` tables.
- RLS bypass rules and automated triggers (`sm_increment_responses`) configured with secure `search_path` attributes to safeguard database namespaces.

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

- **Type-Check**: Validate TypeScript types across all compilation targets.
  ```bash
  npm run type-check
  ```
- **Lint**: Run ESLint guidelines.
  ```bash
  npm run lint
  ```
- **Build**: Compile production routes, bundle CSS, and verify static assets.
  ```bash
  npm run build
  ```
- **One-Step Validation**: Run all three verification checks in sequence.
  ```bash
  npm run validate
  ```
