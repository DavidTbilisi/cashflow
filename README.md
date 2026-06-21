# CASHFLOW

A browser-based, 2D financial-education board game. It implements the official
**CASHFLOW 101** ruleset (escape the *Rat Race*, then win on the *Fast Track*),
layered on top of a custom education system — the **Six Anchors**, the **ESBI**
quadrant progression, and the **NECST** decision test — drawn from personal-finance
study notes (Rich Dad Poor Dad, the CASHFLOW Quadrant, the passive-income ladder).

> Independent, non-commercial learning project. See [License & attribution](#license--attribution).

The full body of ideas behind the game — 50+ principles drawn from *Rich Dad Poor Dad*,
*The Richest Man in Babylon*, *The Psychology of Money*, *The Almanack of Naval*,
*Profit First*, the *Fastlane / Unscripted* books, *The Intelligent Investor*, Bogle, and
*Zero to One* — lives in the in-app **Wealth Codex** (`src/domain/data/principles.ts` +
`src/screens/CodexScreen.tsx`). Each entry maps a principle to exactly where it shows up
in the game (mechanic, card, gauge, or win/lose condition), and cards link back to it.

Crucially, the principles are **played, not just listed**: each one is *discovered* when you
actually meet it in a game — its card surfaces, or your finances demonstrate it (bank a
buffer → *Room for Error*, advance a quadrant → *ESBI*, borrow against an asset → *Good
Debt*). A toast announces each discovery, the top bar shows live `N/54` progress, and the
Codex fills in (locked → unlocked) across games via `localStorage`. Coverage that *every*
principle is reachable in play is enforced by a test (`principleCoverage.test.ts`):
`derivePlayerPrinciples` (`src/domain/services/principleDiscovery.ts`) handles the
state-derived ones; card `principleId`s handle the rest.

## Tech stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| UI             | React 19 + TypeScript                   |
| Build / dev    | Vite 8                                  |
| Board renderer | PixiJS 8 (WebGL canvas)                 |
| State          | Zustand 5 (`subscribeWithSelector`)     |
| Styling        | Tailwind CSS 4                          |
| Animation      | Framer Motion                           |
| Tests          | Vitest 4 (+ jsdom)                       |
| Package manager| pnpm                                    |

## Getting started

Prerequisites: **Node 20+** and **pnpm 10+** (`corepack enable` will provision the
pinned pnpm version from `package.json`).

```bash
pnpm install      # install dependencies
pnpm dev          # start the dev server (http://localhost:5173)
pnpm build        # type-check (tsc) and produce a production build in dist/
pnpm preview      # serve the production build locally
pnpm test         # run the test suite once
pnpm test:watch   # run tests in watch mode
```

## Project structure

```
src/
├── domain/          # Pure game logic — no UI, fully unit-tested
│   ├── data/        #   board layout, card decks, starting professions, Fast Track data
│   ├── entities/    #   core types (PlayerState, GameState, BoardSpace, Card…)
│   ├── rules/       #   win/anchor/NECST rules
│   └── services/    #   financial calculations, card + dice services
├── store/           # gameStore.ts — Zustand store + turn state machine (dispatch)
├── board/           # PixiJS board: renderer, pawns, tile icons, React↔Pixi bridge
├── components/      # React UI (cards, financial sheet, players, progress, layout, ui)
├── screens/         # MainMenu → Lobby → Game → Results
├── hooks/ · utils/ · animations/
└── __tests__/       # Vitest suites (domain + store)
```

The domain layer is intentionally UI-free and tested in isolation; the turn state
machine lives in `store/gameStore.ts`; and `utils/boardGeometry.ts` is the single
source of truth for board geometry so the renderer and pawns never drift from
game state.

## Gameplay

Each player picks a profession (income, expenses, debts) and a Dream, then takes
turns rolling and moving.

**Rat Race** (inner loop, roll 1 die):

- **Pay Check** — collect your monthly cash flow.
- **Opportunity** — choose a **Small Deal** (≤ $5k) or **Big Deal** (≥ $6k) to invest in.
- **The Market** — sell a matching asset at the offered price.
- **Doodad** — an unavoidable one-off expense.
- **Charity** — donate 10% of income to roll extra dice for the next few turns.
- **Downsized** — pay your total expenses and lose turns.
- **Anchor milestones** + decision/build/obstacle **card draws** (the custom layer).

Leave the Rat Race once your **passive income exceeds your total expenses**; your
buyout sets your *CASHFLOW Day* income to 100× passive income.

**Fast Track** (outer loop, roll 2 dice):

- **CASHFLOW Day** — collect your (large) day income.
- **Business Investments** — buy to grow your day income.
- **Dreams** — buy your chosen Dream to win.
- **Tax Audit / Lawsuit** — lose half your cash; **Divorce** — lose all of it.

### How to win

- Buy your chosen **Dream** on the Fast Track, **or**
- Reach **+$50,000** in CASHFLOW Day income, **or** *(custom paths)*
- Unlock all **six Anchors**, or reach the **B/I** quadrant on the Fast Track.

### How to lose

- **Bankruptcy** — net worth drops below zero, or
- **Trapped** — stuck in the Rat Race for 3+ turns with expenses keeping pace.

## Testing

```bash
pnpm test
```

The pure domain logic (financial calculations, win/anchor/NECST rules, card and
dice services) and the store's turn machine are covered by Vitest suites under
`src/__tests__/`.

## License & attribution

Source code is released under the **ISC** license (see `package.json`).

*CASHFLOW®* and *Rich Dad®* are trademarks of their respective owners. This is an
independent educational reimplementation built for learning purposes; it is **not
affiliated with, sponsored by, or endorsed by** Robert Kiyosaki or the Rich Dad
organization. The reference books and rulebook PDFs that informed the design are
copyrighted and are **not** included in this repository.
