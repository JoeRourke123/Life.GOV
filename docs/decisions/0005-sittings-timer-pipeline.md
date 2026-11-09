# ADR-0005: Sittings timer (timestamp-based) & bill pipeline state machine

- **Status:** accepted (spike)
- **Date:** 2026-11-09

## Context

M3 (Agenda) needs the sitting — the timed focus session that completes one clause of a Government Bill — to survive backgrounding and force-quits in **Expo Go**, and the bill pipeline (`proposed → first reading → committee → third reading → Royal Assent`, DESIGN.md §4) to be a pure, testable state machine. Spike issue #25 proved both on branch `vibe/spike-m3-sitting` (PoC screen `/debug/spike-sitting`, pure logic in `state/sitting.ts`). Refs: DESIGN.md §4, §7; mockups v4 screens 02–03; issue #10; ADR-0004.

## Options considered

1. **Timer mechanics:**
   1. **Timestamp-based elapsed** — persist `sitting: { billId, clauseIndex, startedAt, endsAt }` in the markdown save; compute `remaining = endsAt − Date.now()` on boot and on `AppState → active`. Chosen.
   2. **Background timer via `expo-task-manager`** — rejected for Expo Go: per Expo SDK 58 docs, `TaskManager.isAvailableAsync()` returns false on Android in Expo Go and **does not support background execution on iOS** in Expo Go. `expo-background-fetch` is deprecated, dev-build-only on iOS, advisory (10–15 min minimum interval), and never fires on a terminated app — useless for a 25-minute sitting. Even in a dev build, iOS throttles background time, so it could never be the source of truth.
   3. Foreground-only `setInterval` — rejected: dies on background/force-quit; the acceptance test (force-quit mid-sitting, relaunch, resume) fails by construction.
2. **Interruption semantics:** explicit user adjourn ("Divide — end sitting" / adjourn in mockup 03) = clause stays in committee, no reward, no penalty, Hansard notes *"The sitting was suspended."* (DESIGN.md §4). A force-quit is **not** an interruption: wall-clock time kept running, so on relaunch an elapsed sitting simply passes the clause via `settleSitting`.
3. **Pipeline:** pure reducer functions over `SaveState` in `state/sitting.ts` (no React/expo imports, node-testable per the zustand conventions): `draftBill`, `startSitting`, `settleSitting`, `adjournSitting`, `divide`, `laySI`, `abandonBill`.
4. **Rewards:** one clause = one slice of the quest reward (DESIGN.md §7 totals: £ = round(10 × stars × admin × streakMult), XP = round(20 × stars × admin × streakMult)), split evenly per clause with the rounding remainder on the last clause, paid **once** — guarded by `sitting.clauseIndex === bill.clausesDone` — and printed in the sub-line as `£10 · 20 XP` (4★ bill, 4 clauses, streak 0, administration 1).

## Decision

1. **The sitting is timestamp-based and persisted.** `SaveState.sitting: Sitting | null` rides in the v1 markdown save as a `# Sitting` section (nullable — old v1 saves parse as `null`, so no version bump is needed; a future shape change bumps `version` per ADR-0004). `startDayCycle()` (boot + `AppState → active`, same trigger as `rollDay`) now also calls `settleSitting(state, now)`: not elapsed → nothing changes (remaining is computed on read); elapsed → the clause passes and its slice is paid. Force-quit-proof by construction: the only state is two ISO timestamps in the save file.
2. **No background timer, no background fetch in Expo Go.** If a "sitting finished while you were away" heads-up is wanted, use a **scheduled local notification** at `endsAt` (expo-notifications works in Expo Go per ADR-0004) — never a background task.
3. **Pipeline state machine** (`state/sitting.ts`), transitions:
   - `draftBill` → `proposed`. Validation at drafting: gov bills need ≥1 clause (a 0-clause bill is refused — "a bill with no clauses has nothing to sit on"); PMBs 1–2 clauses; SIs forced to 1 clause.
   - `startSitting` → sitting on clause `clausesDone`; `proposed → reading` (committed = first reading), then `committee` (clauses in progress). One sitting at a time — starting while another is live is refused.
   - `settleSitting` (elapsed) → `clausesDone + 1`, slice paid once, `committee`, or `third` when all clauses are done.
   - `divide` from `third` only → `assented` (Royal Assent): +2 approval, streak +1, quest counted, Hansard entry. Rewards were already paid per clause.
   - `adjournSitting` → sitting lifted, bill stage unchanged (clause stays in committee), no reward, no penalty, Hansard: *"The sitting was suspended."*
   - `abandonBill` from any non-final stage → `abandoned`; active sitting lifted; already-paid slices stay paid (no clawback); Hansard entry.
   - `laySI` (SI tier) → one tap, `assented` immediately, full reward paid once.
4. **Rewards per clause:** `clauseReward(bill, player, clauseIndex)` = floor of the per-clause share, with the last clause collecting the rounding remainder, so slices sum exactly to the §7 quest total. XP applies level-ups (`xpToNext = round(80 × level^1.6)`, level-up pays £25 × new level). Approval/streak are quest-level: +2 approval (daily cap +8 stays in the day cycle) and streak +1 at assent/lay, not per clause.

## Consequences

- Positive: the timer is correct across force-quits, backgrounding, and clock changes for free (wall clock is the source of truth); all pipeline logic is pure and headless-tested; rewards can never double-pay (clauseIndex guard); the save stays an open markdown file — the sitting is inspectable in `save.md`.
- Negative / tradeoffs: a sitting left running while the phone is off for hours completes on relaunch (by design — time is time; the player opted into a timed session); approval's daily +8 cap and streak-reset interactions live in the day cycle and are only touched at quest completion; the save gains a nullable `sitting` field inside v1 rather than a version bump (safe: parser defaults to `null`).

## Verification (spike #25, branch `vibe/spike-m3-sitting`)

- 15 pure-logic assertions pass under node (`tsc -p` commonjs compile of `state/*.ts` + node): wall-clock remaining/elapsed; force-quit survival via serialize → migrate/parse → settle (remaining correct at +30s, clause passes at +61s); adjourn = suspended with no reward/penalty + Hansard line; full pipeline proposed → reading → committee → third → assented; slices sum exactly to the quest total and settle is idempotent (paid once); 0-clause and >2-clause-PMB drafts refused; one-sitting-at-a-time; divide-before-third refused; abandon mid-committee keeps paid slices; SI one-tap; sitting section round-trips the markdown codec and legacy v1 saves parse as `null`; `xpToNext` curve.
- `tsc --noEmit` and ESLint pass on the branch.
- PoC screen `/debug/spike-sitting` (debug menu): set a 1-minute sitting, draft a 4★/4-clause bill, start the sitting, "Force-quit sim: save + rehydrate" proves the sitting survives in `save.md` and the clock shows the correct remaining on relaunch; "Rewind 65s + settle" completes the clause; adjourn prints "The sitting was suspended."
- Expo SDK 58 docs checked for the background-timer option: `expo-task-manager` — "With Expo Go, TaskManager is not available on Android, and does not support background execution on iOS"; `expo-background-fetch` — requires a development build on iOS, advisory interval, no terminated-app delivery.
