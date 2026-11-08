---
name: zustand
description: Load when creating or changing app state in Life.GOV (Expo): the zustand store in state/store.ts — one store over SaveState, actions as store methods, persistence via markdown files (not zustand/persist), pure logic kept outside the store for testing.
---

# Zustand in Life.GOV

## Where things live

- `state/store.ts` — the single zustand store (`useGame`). Holds `SaveState` (see `state/types.ts`, DESIGN.md §12) plus UI-only fields (`hydrated`, `log`) and actions.
- `state/markdown.ts`, `state/migrations.ts`, `state/day-cycle.ts`, `state/rng.ts` — **pure logic, no React/expo imports**. Keep them importable by plain `tsc` + node so they can be unit-tested headlessly. Never import `react-native` or expo modules from these files.
- `state/storage.ts`, `state/notifications.ts` — platform wrappers (expo-file-system, expo-sharing, expo-document-picker, expo-notifications). Guard web with `Platform.OS === 'web'`.

## Conventions

1. **One store, curried create**: `export const useGame = create<GameStore>()((set, get) => ({ ... }))`. No `persist` middleware — persistence is our own: `useGame.subscribe(...)` with a ~300 ms debounce writes the save markdown via `state/storage.ts`. This keeps the save format open and diffable (ADR-0004).
2. **Actions are store methods** that call `set`/`get`. Keep them thin: all real logic goes in pure functions in `state/*.ts` (e.g. `rollDay(state, now)`), the action just calls it and `set`s the result.
3. **Hydrate on boot** from the root layout (or first screen): `useGame.getState().hydrate()` reads the markdown file, runs the migration chain (`migrateToLatest`), and sets state. Boot + `AppState` foreground both call the idempotent `rollDayNow`.
4. **Selectors inline**: `useGame((s) => s.player.currency)`. Don't create selector libraries.
5. **Don't store derived data** — compute in components via `useGame` + pure helpers.
6. **Web must still build** (`expo export --platform web` for Pages): any native-only call (share sheet, document picker, notifications) is behind `Platform.OS` guards and the button disabled on web.

## Testing

Pure modules are tested by compiling with `tsc --module commonjs` into a temp dir and running with node — see the M2 spike (#24) for the harness. Add new pure-function tests the same way; never test through the store for logic that can live outside it.
