# Cooking Companion — Frontend

A tablet-first, AI-powered recipe companion built with Next.js, CopilotKit, and Tailwind CSS. Upload a recipe, chat with an AI cooking agent, and get guided through every step — hands-free.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The backend must be running on port 8000. See [backend/README.md](../backend/README.md) or use Docker below.

## Full stack (Docker)

From the repo root:

```bash
docker-compose up
```

This starts both the backend (`:8000`) and frontend (`:3000`).

## Environment

Create `frontend/.env.local` (already included, but for reference):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

The backend needs its own `.env` — see [backend/README.md](../backend/README.md).

## Architecture

```
frontend/
├── app/
│   ├── layout.tsx            # Root layout, fonts, skip-to-content link
│   ├── page.tsx              # Home — upload screen → recipe session
│   ├── globals.css           # Tailwind + brand theme + animations + CopilotKit overrides
│   └── api/
│       ├── copilotkit/route.ts   # CopilotKit runtime proxy → Python backend
│       └── upload/route.ts       # Upload proxy → Python backend
├── components/
│   ├── upload-zone.tsx       # Drag-and-drop file upload with progress states
│   ├── recipe-session.tsx    # CopilotKit provider + chat popup + useCoAgent state sync
│   ├── recipe-view.tsx       # Main recipe layout — tabs (mobile) / two-column (desktop)
│   ├── recipe-header.tsx     # Title, difficulty, servings adjuster (+/−), start cooking CTA
│   ├── ingredient-list.tsx   # Grouped ingredients with check-off, change highlights, swap chips
│   ├── step-list.tsx         # Numbered steps with progress bar and auto-scroll
│   ├── step-timer.tsx        # Circular countdown timer for active cooking steps
│   ├── confetti.tsx          # Canvas-based celebration animation on recipe completion
│   ├── gesture-hint.tsx      # One-time onboarding tooltip for swipe gestures
│   ├── voice-button.tsx      # Floating mic button for voice input
│   ├── tool-renders.tsx      # Chat suggestions for agent tool calls
│   ├── recipe-skeleton.tsx   # Loading placeholder (shimmer)
│   └── error-boundary.tsx    # Graceful crash recovery
├── hooks/
│   ├── use-voice-input.ts    # Web Speech API hook (recognition, transcript, browser support)
│   └── use-swipe.ts          # Touch swipe gesture detection hook
├── lib/
│   ├── types.ts              # TypeScript types mirroring backend models
│   └── chat-utils.ts         # Programmatic chat submission utility
└── types/
    └── speech.d.ts           # TypeScript declarations for Web Speech API
```

## Features

### Core
- **Recipe upload** — drag-and-drop or file picker; PDF and text supported.
- **AI chat** — CopilotKit popup wired to the backend agent via AG-UI. Multi-turn, streaming.
- **Live recipe view** — title, time, servings, difficulty, ingredients, steps. Updates in real time when the agent scales, substitutes, or advances steps.

### Cooking experience
- **Start Cooking button** — enters guided mode; the agent begins walking you through steps.
- **Servings adjuster** — inline +/− buttons with instant visual feedback and debounced AI calls.
- **Ingredient swap chips** — tap "Swap" on any ingredient to prefill a substitution request in chat.
- **Step timers** — circular countdown timers appear on active steps that have a duration. Start, pause, reset.
- **Completion celebration** — confetti animation when all steps are done.

### Tablet and mobile
- **Tabbed layout** — ingredients and steps switch via tabs on mobile/tablet; two-column grid on desktop.
- **Swipe gestures** — swipe left/right on the recipe to navigate between cooking steps.
- **Gesture hint** — dismissable one-time onboarding tooltip explaining swipe navigation.
- **Responsive sizing** — smaller text, padding, and badges on mobile. Chat popup capped at 55vh.

### Hands-free
- **Voice input** — floating mic button uses the Web Speech API to dictate messages to the chat agent. Ideal for messy hands in the kitchen.

## Design decisions

| Decision | Rationale |
|----------|-----------|
| **Tablet-first (1024×768)** | Challenge spec. Large tap targets, landscape-primary, arm's-length readability. |
| **CopilotKit + useCoAgent** | Bidirectional state sync with the Python agent via AG-UI. The agent mutates state through tools; the UI reacts. No message parsing needed. |
| **Chat popup, not sidebar** | A sidebar shifts the recipe layout on open/close. A popup overlays without disrupting the cooking view. |
| **Two-column (lg+) / tabs (mobile)** | Desktop mirrors how cooks work: check ingredient, read step side-by-side. On smaller screens, tabs avoid cramming and let each panel use full width. |
| **Consistent border-2 on list items** | `ring` renders outside the box and gets clipped by `overflow-y-auto`. `border-2` (transparent by default, coloured on highlight) keeps items the same size and avoids clipping. |
| **Debounced servings adjuster** | Instant visual feedback on every tap; the AI call fires once after the user stops tapping. Feels snappy without flooding the agent. |
| **Indegene brand theme** | Custom CSS variables mapped to Tailwind. Navy/blue palette with cyan accents — distinct, professional, and readable at distance. |
| **Change highlight animations** | 2s flash when the agent modifies quantities or swaps ingredients. Glanceable feedback without interrupting flow. |
| **Native touch events for swipe** | `PointerEvent` had reliability issues on scrollable containers. Native `touchstart`/`touchend` with `passive: true` listeners work consistently without blocking scroll. |
| **DOM-based chat submission** | CopilotKit's programmatic message API is a premium feature. The `submitToCopilotChat` utility interacts with the controlled textarea via DOM to keep the open-source tier. |
| **No external state library** | CopilotKit's `useCoAgent` handles shared state. Local UI state with `useState` where needed. No Redux, Zustand, or similar — keeps the dependency tree small. |
| **Error boundary + skeleton** | Resilient UX — never a blank screen. Skeleton shimmer during loading, boundary catches render crashes. |

## Accessibility

- WCAG 2.1 AA colour contrast
- Skip-to-content link
- Semantic HTML: `article`, `section`, `nav`, `dl`, `ol`
- ARIA attributes: `aria-live`, `aria-label`, `aria-pressed`, `aria-current="step"`, `role="status"`, `role="alert"`
- Keyboard navigable — all interactive elements focusable with visible focus ring
- Screen reader text for icons and state changes

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- CopilotKit (react-core, react-ui, runtime)
- AG-UI client
- Heroicons
- Web Speech API (voice input)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
