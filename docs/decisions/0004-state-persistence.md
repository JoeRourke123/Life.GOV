# ADR-0004: State & persistence — open markdown save files, zustand store, proven day cycle and notifications

- **Status:** accepted
- **Date:** 2026-11-08

## Context

M2 (State core) needs a foundation that is hard to get wrong later: where the save lives, in what format, how state is held in React, how the day cycle fires reliably in Expo Go, and whether local notifications actually work without a dev build. Spike issue #24 proved each piece on a throwaway branch (`vibe/spike-m2-state`, debug screen `/debug/spike-state`); this ADR records the decisions. Refs: DESIGN.md §2, §10, §12; ADR-0001; issues #20–#24.

## Options considered

1. **Storage:** AsyncStorage JSON blob under `lifegov.save.v1` (DESIGN.md §2 as drafted) — opaque, not diffable, not portable. `expo-sqlite` tables — relational structure the single-document save doesn't need. **Markdown file(s)** — open format, human-readable, diffable, portable to iCloud Drive/Files.
2. **iCloud:** writable iCloud container needs entitlements → dev build only (conflicts with ADR-0001 for now). In Expo Go: share sheet "Save to Files" (iCloud Drive) + document picker import from iCloud Drive.
3. **State:** `useReducer` + context vs zustand vs RTK (see #24 discussion). Chosen: **zustand**, one store.
4. **Day-cycle trigger:** AppState-foreground only; notification-driven only; **boot + foreground with a `lastDailyReset` date guard** (chosen — the date is the source of truth, so force-quit is covered).
5. **Notifications:** local scheduled only (chosen for M2); remote push needs a dev build.

## Decision

1. **The save is an open markdown file**, `lifegov/save.md`, written with the `expo-file-system` new API (`File`/`Directory`/`Paths`) into the app documents directory. Constrained dialect: YAML-ish frontmatter (`format`, `version`, `createdAt`, `seed`, `lastDailyReset`), `#` sections, `- key: value` bullets, pipe tables (`|` in free text written as `¦`). Codec: `state/markdown.ts`.
2. **iCloud on iOS:** export = share sheet → "Save to Files" → iCloud Drive; import = document picker (can browse iCloud Drive). Auto-sync via an iCloud ubiquitous container is **deferred to the dev-build phase** (revisit ADR-0001); on Android the share sheet targets Drive. Web (Pages build): localStorage shim + DOM download.
3. **Migrations:** frontmatter `version` + ordered migration chain (`state/migrations.ts`). A save from a *newer* version is refused with an export hint — never guessed at.
4. **State:** one **zustand** store (`state/store.ts`, conventions in `.vibe/skills/zustand/`). No `persist` middleware — a `subscribe` listener writes the markdown file debounced (~300 ms). Pure logic (codec, migrations, day cycle, RNG) lives in `state/*.ts` with no React/expo imports so it runs under plain node for tests.
5. **Day cycle:** on boot and on `AppState` → `active`, call the idempotent `rollDay(state, now)`, which compares `lastDailyReset` to today's local date. AppState is a hint; the date check is the source of truth.
6. **Notifications:** `expo-notifications` **local scheduled only** (midnight agenda, Wednesday 12:00 PMQs, election countdown, test). Android notification channel `default` (HIGH). Remote push deferred to the dev-build phase.
7. **RNG:** `mulberry32` in `state/rng.ts`, seeded per player + scope (`rngFor(seed, 'day', dayKey())`, `rngFor(seed, 'week', isoWeekKey())`).

## Consequences

- Positive: the save is inspectable, diffable and portable (open format in iCloud Drive by user action); zero native modules, all Expo Go core; day cycle is force-quit-proof; verified headlessly (below).
- Negative/tradeoffs: markdown parsing is our own constrained dialect (writer/parser paired — not arbitrary markdown); iCloud *auto*-sync waits for a dev build; AsyncStorage-style atomicity is replaced by write-then-verify (write to temp + rename is a follow-up if corruption is ever seen); local notifications need the app to have been opened once to schedule.

## Verification (spike #24, branch `vibe/spike-m2-state`)

- 34 pure-logic assertions pass under node (`tsc --module commonjs` + node): RNG determinism/scoping, markdown roundtrip (incl. pipe escaping, empty Hansard, null manifesto), v0→v1 migration, future-version refusal, day-cycle idempotency + seeded determinism.
- Perf at scale: a save with 2000 Hansard entries + 200 bills (310 KB) serializes in ~1 ms and parses in ~1 ms — a markdown file is comfortably fast at v1 scale.
- `tsc --noEmit` and ESLint pass; `expo export --platform web` builds (`/debug/spike-state` included); dev server serves the PoC screen (200).
- Manual on device (Expo Go), one step: the 60-second test notification on `/debug/spike-state` must fire and display — scheduling returns an id headlessly, firing needs a device.
