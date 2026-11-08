# Process — how we plan, document, and ship Life.GOV

## Source of truth

- `docs/DESIGN.md` — living game design document. Update it in the same PR as any behavior change.
- `docs/decisions/` — ADRs (see `TEMPLATE.md`) for decisions that are hard to reverse or easy to forget the reasoning for. `DESIGN.md` §14 (decisions log) seeds them.
- `README.md` — vision, setup, how to run in Expo Go.

## Backlog & tracking

- GitHub **issues** are the backlog. One issue per work item.
- Grouped into GitHub **milestones M1–M6** (see `DESIGN.md` §13).
- Labels: `type: feature|bug|docs|chore`, `area: scaffold|state|agenda|cabinet|orders|gazette|treasury|manifesto`, `size: S|M|L`.

## Flow per task

1. Pick an open issue (or write one first).
2. Branch from `main`: `git checkout -b vibe/<short-slug>`.
3. Commit with **conventional commits**: `feat(agenda): sittings timer`, `fix(treasury): ...`, `docs: ...`, `chore: ...`. Small, focused commits.
4. Open a **draft PR** while WIP; mark ready when done. PR body: what / why / how verified.
5. Merge when the definition of done is met.

## Definition of done

- `tsc --noEmit` and ESLint pass.
- Runs in **Expo Go** (manually verified on device).
- `DESIGN.md` / ADRs updated if behavior or decisions changed.

## Base branch

- `main` is the default branch and the PR base. Never commit directly to `main` except via the initial rename; all work goes through feature branches + PRs.

## CI

- Not yet. When the app exists, add a GitHub Actions workflow running `tsc` + ESLint on pull requests.
