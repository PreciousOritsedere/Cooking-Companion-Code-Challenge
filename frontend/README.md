# Cooking Companion — Frontend

A tablet-first, AI-powered recipe companion built with Next.js, CopilotKit, and Tailwind CSS.

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
│   ├── layout.tsx          # Root layout with fonts, accessibility skip-link
│   ├── page.tsx            # Home — upload screen → recipe session
│   ├── globals.css         # Tailwind + custom theme + animations
│   └── api/copilotkit/
│       └── route.ts        # CopilotKit runtime proxy → Python backend
├── components/
│   ├── upload-zone.tsx     # Drag-and-drop file upload with states
│   ├── recipe-session.tsx  # CopilotKit provider + chat sidebar + state sync
│   ├── recipe-view.tsx     # Main recipe display layout
│   ├── recipe-header.tsx   # Title, servings, time, difficulty, tags
│   ├── ingredient-list.tsx # Grouped ingredients with check-off and change highlights
│   ├── step-list.tsx       # Numbered steps with progress bar and auto-scroll
│   ├── tool-renders.tsx    # Custom chat renderers for agent tool calls
│   ├── recipe-skeleton.tsx # Loading placeholder (shimmer)
│   └── error-boundary.tsx  # Graceful crash recovery
└── lib/
    └── types.ts            # TypeScript types mirroring backend models
```

## Design decisions

| Decision | Rationale |
|----------|-----------|
| **Tablet-first (1024x768)** | Challenge spec. Large tap targets, landscape-primary, arm's-length readability. |
| **CopilotKit + useCoAgent** | Bidirectional state sync with the Python agent via AG-UI. The agent mutates state through tools; the UI reacts. |
| **Custom tool renderers** | Visual cards in chat for scale/substitute/progress actions — better than raw JSON. |
| **Two-column layout (lg+)** | Ingredients left, steps right — mirrors how cooks work (check ingredient, read step). |
| **Amber warm theme** | Distinct from generic AI blue. Evokes warmth/kitchen. |
| **Change highlight animations** | 2s amber flash when the agent modifies quantities or swaps ingredients. Glanceable feedback. |
| **Error boundary + skeleton** | Resilient UX — never a blank screen. |
| **No external state library** | CopilotKit's useCoAgent handles shared state. Local UI state with useState where needed. |

## Accessibility

- WCAG 2.1 AA compliant
- Skip-to-content link
- Semantic HTML: `article`, `section`, `nav`, `aside`, `dl`, `ol`
- ARIA: `aria-live`, `aria-label`, `aria-pressed`, `aria-current`, `role="status"`, `role="alert"`
- Keyboard navigable (all interactive elements focusable with visible focus ring)
- Screen reader text for icons and state changes

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- CopilotKit (react-core, react-ui, runtime)
- AG-UI client
- Heroicons

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
