# Syntaxa Quiz Web App

A mobile-first English grammar learning application built with Next.js 16 and React 19. Syntaxa combines daily quiz mechanics, sentence correction exercises, a bilingual dictionary, and a gamification layer into a single cohesive progressive web app — designed with the kind of care that shows up in the details.

Live deployment: [syntaxa-ten.vercel.app](https://syntaxa-ten.vercel.app)

---

## What it does

Syntaxa gives learners a structured daily practice loop. On the home screen, a randomized 10-question grammar quiz draws from a curated question bank, shuffles answer options, persists quiz state across page reloads, and scores accuracy in real time. From there, users can move into sentence correction exercises where they type complete answers, open grammar lesson sheets covering Tenses, Articles, Prepositions, and Sentence Structure, or look up English words in a live bilingual dictionary with English-to-Bengali translations, pronunciation audio, English synonyms, and a "Word of the Day" feature powered by the open-source MinhasKamal Bengali Dictionary dataset. A rewards screen tracks daily streaks, gem balances, and achievement progress. The account screen surfaces cumulative stats alongside app settings including dark mode, daily reminders, and sound effects, all persisted via `next-themes` and `localStorage`.

Navigation is handled by a fixed bottom tab bar that conditionally renders based on authentication state, redirecting unauthenticated users who try to access protected routes with an inline toast notification rather than a page redirect.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.4 with App Router |
| UI runtime | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Theming | next-themes |
| Notifications | Sonner |
| Class utilities | clsx + tailwind-merge |
| Compiler | React Compiler (babel-plugin-react-compiler 1.0.0) |
| Linting | ESLint 9 with eslint-config-next |
| Deployment | Vercel |

---

## Project structure

```
src/
  app/
    page.tsx              # Root: toggles between Dashboard and QuizGame
    layout.tsx            # Global layout: Outfit font, BottomNav, Providers
    Providers.tsx         # AuthProvider + ThemeProvider + Sonner Toaster
    login/page.tsx        # Login form with client-side auth
    signup/page.tsx       # Registration form
    dictionary/page.tsx   # Dictionary route shell
    practice/page.tsx     # Practice route shell
    rewards/page.tsx      # Rewards route shell
    account/page.tsx      # Account route shell
    globals.css           # Base Tailwind directives
  components/
    Dashboard.tsx         # Home screen: hero quiz card, stats, topic browser, history
    QuizGame.tsx          # 10-question quiz engine with persistence and scoring
    Practice.tsx          # Sentence correction + lesson sheet modal
    Dictionary.tsx        # English-to-Bengali search + pronunciation + word of the day
    Rewards.tsx           # Streak calendar, achievements, gem balance, redemption UI
    Account.tsx           # User profile, stats grid, settings toggles, logout
    BottomNav.tsx         # Fixed navigation bar with auth-aware route protection
  data/
    quiz.json             # Grammar question bank
    practice-sentence.json # Correction exercise dataset
    lesson.json           # Structured grammar lesson content (Tenses, Articles, Prepositions, Sentence Structure)
    mockQuiz.ts           # Development mock data
  lib/
    AuthContext.tsx        # React context for session management via localStorage
    utils.ts              # cn() utility: clsx + tailwind-merge
```

---

## Architecture notes

**Authentication** is handled entirely on the client. `AuthContext` stores the current user object in `localStorage` under the key `syntaxa_user` and exposes `login`, `logout`, and `isAuthenticated` to consumers via context. There is no backend validation; any non-empty username and password combination succeeds. This is appropriate for a portfolio or demo deployment and is clearly scoped as a frontend-only project.

**Quiz engine** in `QuizGame.tsx` does several things worth noting. It pulls a random 10-question subset from `quiz.json` on initialization, strips inline option hints from question text using a regex match on parenthesized strings, constructs exactly four answer options per question (preserving the correct answer and padding with random distractors from the answer pool), and serializes the full quiz state to `localStorage` on every state change so progress survives a hard reload. The `mounted` guard prevents hydration mismatches from server-rendered HTML differing from client localStorage state.

**Practice answer checking** in `Practice.tsx` uses a two-pass normalization strategy. It first attempts to extract the expected answer from bold-marked text (`**word**`) in the answer string. If no bold marker is present, it diffs the question and answer word sets to infer the target word. Both the user input and the expected answer are normalized by lowercasing and stripping punctuation before comparison, so minor formatting differences do not count as wrong.

**Dictionary** fetches the full MinhasKamal Bengali Dictionary JSON from a raw GitHub URL on component mount, stores it in local state, and performs client-side search against it. Pronunciation playback first attempts the Free Dictionary API audio endpoint, then falls back to the Web Speech API `SpeechSynthesis` interface if no audio URL is found.

**React Compiler** is enabled via `reactCompiler: true` in `next.config.ts` and the babel plugin in devDependencies. This opts the entire app into automatic memoization at build time, eliminating the need for manual `useMemo` and `useCallback` calls.

**Theming** uses `next-themes` with `attribute="class"` and `enableSystem={false}`, so theme state is fully deterministic based on user selection rather than system preference inference. `suppressHydrationWarning` on the `<html>` element prevents the console warning from the server-client theme class mismatch on first paint.

**Styling** uses a deliberate purple-dominant color palette (`#8A56A4` primary, `#A87BC7` dark variant) with orange accents (`#FC9502`) for streak and progress elements. Dark mode colors are hardcoded as Tailwind arbitrary values rather than CSS variables, which keeps the theme explicit and auditable but means color updates require touching component files directly.

---

## Local development

**Prerequisites:** Node.js 18 or later, npm.

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/syntaxa.git
cd syntaxa
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To log in during local testing, use any non-empty username and password. The authentication system performs no credential validation.

**Available scripts:**

```bash
npm run dev      # Start Next.js dev server with hot reload
npm run build    # Compile production build
npm run start    # Serve the production build locally
npm run lint     # Run ESLint across the project
```

---

## Design decisions and known scope

A few things are worth being explicit about for anyone reading the code:

The stats displayed in the Account and Rewards screens (46 quizzes completed, 5-day streak, 124 gems) are hardcoded constants. Connecting these to the quiz and practice session data recorded in `localStorage` is a natural next step.

The bottom navigation hides on `/login` and `/signup` routes by checking `usePathname()`. Protected route items display as grayed-out buttons with a toast prompt rather than redirecting, which keeps the guest experience usable without requiring sign-in to see the app's structure.

The dictionary loads the entire Bengali dictionary JSON into memory on mount. For production use, this would be better served via a search API or indexed database rather than a full client-side load.

No test suite is currently included. Component logic in `QuizGame.tsx` and `Practice.tsx` in particular is well-suited for unit testing, and the answer normalization function in Practice is a good candidate for edge case coverage.

---

## License

This project is unlicensed. All rights reserved by the author.
