# Life.GOV

**Run your life like a government.**

Life.GOV is a mobile-first life-management app where you govern your own life as a British government. Tasks are legislation, habits are standing orders, streaks are your approval rating, and your life areas are Cabinet ministers. The tone is deadpan — Yes Minister, not pantomime.

- [Design document](docs/DESIGN.md) — the source of truth for the product
- [Process](docs/PROCESS.md) — how we plan, document, and ship
- [Decisions (ADRs)](docs/decisions/) — hard-to-reverse choices and their reasoning
- [Design system](https://joerourke123.github.io/Life.GOV/) — "GOV.UK Play" docs + kitchen sink ([source](docs/design-system/))
- [Mockups](docs/mockups/) — v4 HTML/CSS sources for every screen

## Quick start

Prerequisites: [Node.js](https://nodejs.org/) 22+ and the **Expo Go** app on your phone.

```sh
git clone https://github.com/JoeRourke123/Life.GOV.git
cd Life.GOV
npm ci
npx expo start          # scan the QR code with Expo Go
```

In the browser instead (no phone needed):

```sh
npx expo start --web    # then open http://localhost:8081
```

The app is also deployed to GitHub Pages at <https://joerourke123.github.io/Life.GOV/app/> — add the `deploy:web` label to a pull request to redeploy it (see `.github/workflows/deploy-app.yml`).

Try the **debug menu** (Settings tab → Debug menu, or directly `/debug/kitchen-sink` and `/debug/mock-order-paper` etc.): every design-system component on one page, plus mocked data screens.

## Checks

```sh
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # eslint
```

## Project structure

```
app/                  Expo Router routes (the seven screens + /debug/*)
components/gov/       "GOV.UK Play" primitives (GovHeader, Tag, TaskList, Button, …)
theme.ts              design tokens — mirror of docs/design/SYSTEM.md §2
data/mock.ts          mocked data for the debug pages
assets/fonts/         Hanken Grotesk + IBM Plex Mono (loaded via expo-font)
docs/                 design docs, ADRs, mockups, design-system site
```

Developed in **Expo Go** per [ADR-0001](docs/decisions/0001-mobile-first-expo-go.md) — no custom native modules.

## Contributing

Issues are the backlog (milestones M1–M6), one issue per work item. Per task: branch from `main` as `vibe/<short-slug>`, commit with conventional commits (`feat(agenda): …`, `fix(treasury): …`, `docs: …`), open a PR with what/why/how-verified. Done means `npm run typecheck` and `npm run lint` pass and the app runs in Expo Go. See [docs/PROCESS.md](docs/PROCESS.md).
