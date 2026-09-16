# Syntaxa — AI-Powered English Learning & Grammar Platform

A modern, mobile-first English grammar learning application built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript**. Syntaxa combines adaptive AI quiz generation, intelligent grammar correction, an interactive multi-language dictionary with Web Speech pronunciation, free-form writing feedback, and a real-time gamification engine.

Live deployment: [syntaxa-ten.vercel.app](https://syntaxa-ten.vercel.app)

---

## 🌟 Key Features

### 1. 🤖 Multi-Provider AI Engine (Groq + Google Gemini)
- **Zero-Latency Fallback Architecture**: Primary completion via **Groq** (`openai/gpt-oss-120b` & `openai/gpt-oss-20b`) with automated fallback to **Google Gemini** (`gemini-flash-latest`).
- **Server-side Caching & Rate Limiting**: In-memory LRU cache with TTL tiers and IP-based sliding-window rate limiting.
- **AI Endpoints**:
  - `POST /api/ai/check-answer` — Evaluates fill-in-the-blank answers with semantic flexibility and provides concise grammar explanations.
  - `POST /api/ai/correct-writing` — Analyzes 1–3 free-form sentences, returns corrected text, identifies mistakes, and explains the underlying rules.
  - `POST /api/ai/generate-quiz` — Dynamically crafts multiple-choice quiz questions tailored to a learner's identified weak grammar topics.
  - `POST /api/ai/simplify-definition` — Generates ELI5 simple definitions and natural example sentences for English learners.
  - `POST /api/ai/translate` — Bi-directional translations (English ⇄ Korean and English ⇄ Bangla) with phonetic romanization and cultural usage notes.

### 2. 📝 Adaptive Daily Quiz & Weak Spot Tracking
- **Curated Question Pool + AI Generation**: 10-question randomized quizzes with options shuffling and state persistence across page reloads.
- **Automated Weak Topic Logging**: Categorizes quiz mistakes into grammar domains (Tenses, Articles & Prepositions, Sentence Structure).
- **Personalized AI Quizzes**: One-click generation of custom quizzes focusing specifically on the learner's weakest areas.

### 3. ✍️ Sentence Practice & Writing Coach
- **Fill-in-the-blank Practice**: Two-pass validation (fast exact match + AI tutor judgment with rule breakdown).
- **Free Writing Coach**: Dedicated interactive writing space with real-time AI critique, suggestions, and corrections.
- **Lesson Reference Sheets**: Embedded lesson guides covering Tenses, Verbs, Articles, and Sentence Structure.

### 4. 📖 Multi-Language Dictionary & Pronunciation
- **Free Dictionary API Integration**: Direct integration with `api.dictionaryapi.dev` for fast phonetics, definitions, and real-world examples, paired with seamless AI fallback.
- **Mobile-First Category Switcher**: Clean 3-tab layout (`Easy EN`, `🇰🇷 Korean`, `🇧🇩 Bangla`) with a 1-tap `⇄ Swap` translation direction toggle.
- **Tab-Specific Word of the Day**: Unique, curated daily vocabulary for each language pair with definitions, examples, cultural notes, and date-based rotation.
- **Native Web Speech Pronunciation**: Reusable `PronunciationButton` component utilizing browser speech synthesis for `en-US`, `bn-BD`, and `ko-KR` with voice detection and speech queue cancellation.

### 5. 🏆 Real-Time Gamification & Stats Engine
- **Fully Dynamic User Stats**: Starts at 0 for new learners and persists across `localStorage` and `sessionStorage`.
- **Live State Sync**: React hook (`useUserStats`) synchronizes stats in real time across the Dashboard, Practice, Rewards, and Account screens.
- **Tracked Metrics**:
  - Consecutive day streak counter & weekly activity calendar dots
  - Practiced words counter & average accuracy percentage
  - Total quizzes completed & quiz history log
  - Gem balance & dynamic achievement milestones (*Grammar Master*, *7 Day Streak*, *100 Lesson Club*)
  - Time spent tracking while active in the app

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.4 (App Router & Turbopack) |
| UI Runtime | React 19.2.3 |
| Language | TypeScript 5 |
| AI Integration | Groq API (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`) & Google Gemini API (`gemini-flash-latest`) |
| Speech Engine | Web Speech API (`SpeechSynthesisUtterance`) |
| External APIs | Free Dictionary API (`api.dictionaryapi.dev`) & MinhasKamal Bengali Dictionary |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Theming | `next-themes` (Dark & Light mode) |
| Notifications | Sonner |
| Compilation | React Compiler (`babel-plugin-react-compiler`) |

---

## 📁 Project Structure

```
src/
  app/
    api/ai/
      check-answer/route.ts        # AI answer validation & explanations
      correct-writing/route.ts     # Free writing grammar correction
      generate-quiz/route.ts       # Adaptive quiz generator
      simplify-definition/route.ts # ELI5 definition simplifier
      translate/route.ts           # Multilingual translator (EN, KO, BN)
    page.tsx                       # Root: Dashboard & Quiz toggle
    layout.tsx                     # Global layout, fonts, BottomNav, Providers
    Providers.tsx                  # AuthProvider, ThemeProvider, Toaster
    login/page.tsx                 # Login with demo credentials quick-fill
    signup/page.tsx                # Registration form
    dictionary/page.tsx            # Dictionary route shell
    practice/page.tsx              # Sentence practice & Writing coach route
    rewards/page.tsx               # Gamification rewards & streak calendar
    account/page.tsx               # User profile & app settings
    globals.css                    # Tailwind CSS directives
  components/
    Dashboard.tsx                  # Home screen: Daily quiz, weak spot trigger, stats
    QuizGame.tsx                   # 10-question MCQ engine with AI generation
    Practice.tsx                   # Sentence fill-in & interactive exercises
    WritingCoach.tsx               # AI-powered free-form writing feedback
    Dictionary.tsx                 # Mobile-first dictionary with multi-language tabs
    PronunciationButton.tsx        # Native Web Speech multi-language speaker
    Rewards.tsx                    # Dynamic streak, gems, achievements
    Account.tsx                    # Profile stats, theme toggles, logout
    BottomNav.tsx                  # Fixed navigation bar with route protection
  data/
    quiz.json                      # Static grammar question bank
    practice-sentence.json         # Practice sentences dataset
    lesson.json                    # Structured grammar lesson content
    wordOfDay.ts                   # Daily word pools for each language mode
  lib/
    ai/
      groq.ts                      # Groq API client with auto-model selection
      gemini.ts                    # Google Gemini fallback client
      cache.ts                     # In-memory LRU cache with TTL
      rate-limit.ts                # Sliding-window rate limiter
      types.ts                     # TypeScript definitions for AI requests/responses
      index.ts                     # Orchestrated AI runner with automatic fallback
    userStats.ts                   # Centralized dynamic user stats & reactive hook
    AuthContext.tsx                # Session management via localStorage
    utils.ts                       # Classnames utility (clsx + tailwind-merge)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Omar-webcloud/Syntaxa.git
cd Syntaxa
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Groq API Key (Primary AI provider)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Google Gemini API Key (Fallback AI provider)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 💡 Usage Highlights

- **Demo Login**: On the login page, click **"Fill in demo credentials"** to instantly prefill `Guest` / `123`.
- **Adaptive Quiz**: Practice regular quizzes; once mistakes are recorded in specific grammar categories, the **"Generate AI Quiz for Weak Spots"** button activates on the Dashboard.
- **Dictionary**: Tap **Easy EN**, **Korean**, or **Bangla** to switch modes. Use the **Swap ⇄** button to reverse translation direction instantly.
- **Audio**: Tap any speaker icon or **"Listen Pronunciation"** button to hear accurate native pronunciation via the Web Speech API without external audio dependencies.

---

## 📄 License

This project is open-source and available under the MIT License.
