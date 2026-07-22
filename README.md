# Domek na górnicy 🏠💎

A digital implementation of the board game **Domek na górnicy** ("The Cabin on the
Mine"). Players take on characters, travel across the map, collect crystals and buy
runes — the goal is to gather a full set of 4 runes and bring them back to the Cabin.

The project is built in layers: first a **headless** game engine (pure logic, no UI),
then the interface layer in React.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack) + **React 19**
- **[Zustand](https://github.com/pmndrs/zustand)** — global game state
- **[Tailwind CSS 4](https://tailwindcss.com)** — UI styling
- **[XState](https://stately.ai/docs/xstate)** — state-machine scaffold (day phase)
- **TypeScript** — throughout

> ⚠️ **The Next.js in this repo may differ from the version you know.** Check
> `node_modules/next/dist/docs/` before writing code (see `AGENTS.md`).

## Requirements

- **Node.js ≥ 20** (Next 16 does not run on older versions).

```bash
nvm use 22   # or any version 20+
```

## Getting started

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # production server
npm run lint    # ESLint
```

## Project structure

```
src/
├── app/                    # Next.js App Router (layout, page, global styles)
│   └── page.tsx            # renders PlayerDashboard
├── config/
│   └── gameConfig.ts       # game data: characters, locations, schedule, cards
├── engine/                 # HEADLESS game engine (pure logic, no React)
│   ├── gameEngine.ts       # state types + gameReducer(state, action)
│   ├── navigation.ts       # map graph and path-cost resolution (Dijkstra)
│   └── setup.ts            # createInitialState() — initial game state
├── machine/
│   └── gameMachine.ts      # XState machine scaffold (day phase)
├── store/
│   ├── useGameStore.ts     # Zustand: state + actions wired to the engine
│   └── useUIStore.ts       # Zustand: UI state (e.g. panels)
└── components/
    ├── PlayerDashboard.tsx # main player view
    ├── NightPenaltyModal.tsx # deep-night modal
    └── CrystalSquare.tsx   # crystals rendered as colored squares

docs/
├── zasady-gry.md           # rules (transcribed from the source file)
├── specyfikacje.md         # character/location/card tables
└── zrodla/                 # original .docx / .pdf source files
```

## Architecture

### 1. Headless engine (`src/engine`)

All game logic is a pure function:

```ts
gameReducer(state: GameState, action: GameAction): EngineResult
```

The reducer knows nothing about React — it takes a state and an action and returns
a new state **or** an error (`{ success: false, error }`). This makes the logic
testable and runnable independently of the UI. Supported actions include: movement,
drawing crystals, depositing to the Bank, stashing in the private room, buying a
rune, the night penalty, and ending the turn.

### 2. Global state (`src/store/useGameStore.ts`)

The Zustand store holds `GameState` and exposes convenience actions (`movePlayer`,
`buyRune`, `depositToBank`, `resolveNightPenalty`, `endTurn`, …) that call
`gameReducer` under the hood and update the state. Engine errors surface in
`lastError`.

### 3. Interface (`src/components`)

`PlayerDashboard` presents the active player: character name, Action Points (AP),
time and day phase, backpack and private-room contents (colored squares), the local
Bank, collected runes, and action buttons. `NightPenaltyModal` appears after
midnight and forces a choice — *discard a card / lose 1 AP* — blocking other actions.

## Game rules (summary)

- The game starts at **08:00**; each turn grants the player **3 AP**.
- **Goal:** collect 4 runes (Lasek, Palenisko, Altana, Wzgórze) and return to the Cabin.
- **Rune cost:** asylum 2 💎 · neutral 4 💎 · enemy location 6 💎 (paid from the
  backpack + local Bank).
- The **Bank** is shared (anyone can take crystals from it), while the **private
  room** in the Cabin is a safe stash.
- The **day phase** (Morning → Day → Dusk → Night) changes movement rules; after
  midnight the night penalty applies.

Full rules: [`docs/zasady-gry.md`](docs/zasady-gry.md) ·
Specs: [`docs/specyfikacje.md`](docs/specyfikacje.md).

## Status

- [x] **Steps 1–2** — game data and configuration (`gameConfig.ts`)
- [x] **Step 3** — headless engine: reducer + map navigation
- [x] **Step 4** — UI layer: Zustand + `PlayerDashboard` + night modal
- [ ] Next steps — board/map, cards, multiplayer
```

