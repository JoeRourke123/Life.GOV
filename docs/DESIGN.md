# Life.GOV — Game Design Document

**Tagline:** Run your life like a government.

Life.GOV is a React Router app that turns personal productivity into a game. You are the head of state of your own life: tasks are legislation, habits are standing policy, streaks are your approval rating, and your life areas are ministries with budgets and levels.

Status: v0.1 — pre-implementation design. This document is the source of truth for the MVP.

---

## 1. Vision

Make self-improvement feel like running a country. Instead of a bare todo list, the player sees a living government: a capitol dashboard with approval ratings, a legislative agenda of quests, ministries that level up, policies with tradeoffs, and random events that force decisions. Progress is visible, numbers go up, and neglect has consequences (approval decay).

## 2. Design pillars

1. **Everything is a government metaphor.** No generic "todo app" language in the UI. Tasks = bills, habits = standing orders, goals = amendments, currency = treasury.
2. **Local-first, offline-capable.** The whole game runs in the browser with localStorage persistence. No account, no server in the MVP.
3. **Deterministic daily content.** Daily quests/events are seeded per player per day, so the "news cycle" is stable within a day but different across days.
4. **Small decisions, real tradeoffs.** Policies and events should cost something (currency, approval, or opportunity), not be free buffs.
5. **Numbers go up, but decay keeps it honest.** Streaks and approval reward consistency; idle players see approval slide.

## 3. Core loop

- **Minute-to-minute:** complete a quest (bill passed) → earn XP + treasury → watch approval tick up.
- **Session:** review the agenda, enact/repeal a policy, respond to an event, spend treasury in the shop.
- **Day cycle:** at local midnight, daily quests rotate (seeded), upkeep is charged, approval decays if no quest was completed.
- **Long-term:** level up, grow ministries, accumulate policies, reach the level cap, and start a **New Administration** (prestige) for a permanent bonus.

## 4. Entities & data model

```ts
interface SaveState {
  version: number;                 // schema version, for migrations
  createdAt: string;               // ISO date
  seed: number;                    // player seed for deterministic content
  player: {
    name: string;
    title: string;                 // e.g. "First Secretary", earned by level
    level: number;
    xp: number;
    currency: number;              // treasury credits
    approval: number;              // 0–100
    streak: number;                // consecutive days with >=1 quest completed
    bestStreak: number;
    administration: number;        // prestige count
  };
  ministries: Record<MinistryId, { level: number; xp: number }>;
  quests: QuestInstance[];        // active + recently completed
  policies: PolicyInstance[];      // enacted standing orders
  eventLog: EventLogEntry[];       // past events and chosen options
  stats: {
    questsCompleted: number;
    eventsResolved: number;
    currencyEarned: number;
  };
  lastDailyReset: string;          // ISO date of last midnight reset
  settings: { sound: boolean; confirmReset: boolean };
}

type MinistryId = "health" | "wealth" | "mind" | "social";

interface QuestInstance {
  id: string;
  templateId: string;
  title: string;                   // the "bill" title
  description: string;
  ministry: MinistryId;
  difficulty: 1 | 2 | 3 | 4 | 5;   // stars
  kind: "daily" | "weekly" | "one-off";
  xpReward: number;
  currencyReward: number;
  status: "active" | "completed" | "failed" | "abandoned";
  createdAt: string;
  dueAt: string | null;            // end of day / end of week
  completedAt: string | null;
}

interface PolicyInstance {
  id: string;
  policyId: string;                // from static policy catalog
  enactedAt: string;
  active: boolean;
}

interface EventLogEntry {
  id: string;
  eventId: string;
  title: string;
  choiceIndex: number;
  resolvedAt: string;
}
```

## 5. Mechanics

### 5.1 XP & levels

- `xpToNext(level) = round(80 * level^1.6)` — level 1→2 costs 80, level 5→6 costs ~1,254.
- Completing a quest grants `xpReward = round(20 * difficulty * streakMultiplier * administrationBonus)`.
- `streakMultiplier = 1 + min(streak, 30) * 0.02` (up to +60% at a 30-day streak).
- `administrationBonus = 1 + 0.10 * administration` (prestige bonus).
- Leveling up grants `currency += 25 * newLevel` as a "budget appropriation".

### 5.2 Currency (treasury)

- Quests grant `currencyReward = round(10 * difficulty * administrationBonus)`.
- Spent in the Treasury shop on upgrades (see 5.8) and policy enactment costs.
- Austerity-style policies can modify gains (tradeoff vs approval).

### 5.3 Approval rating & streaks

- Approval is 0–100, starts at 50.
- Each quest completed: `+2` approval (daily cap `+8`).
- Day with zero completed quests: `-6` approval and streak resets to 0.
- Day with at least one completion: streak +1.
- Some policies/events modify approval directly.
- Approval gates certain shop items and high-difficulty weekly quests (e.g. 5-star weekly requires approval ≥ 70).

### 5.4 Ministries

Four ministries: **Health, Wealth, Mind, Social**. Quests are tagged with one. Completing a quest grants ministry XP equal to the quest's XP reward.

- Ministry level uses the same curve as player XP.
- Each ministry level grants a passive bonus: `+2%` quest rewards (XP & currency) for quests in that ministry, stacking with other multipliers.
- Ministry level is shown with a progress bar and a flavor title (e.g. Health level 5 = "Minister of Vitality").

### 5.5 Quests ("the legislative agenda")

- **Daily bills:** 3 generated per day from a seeded template pool, difficulties 1–3, due end of day.
- **Weekly bills:** 2 generated per week (ISO week), difficulties 3–5, due end of week. 5-star requires approval ≥ 70.
- **One-off bills:** player-created custom quests (any difficulty, optional due date), plus milestone "amendments" (long-term goals) unlocked at higher levels.
- **Generation:** `mulberry32(hash(seed, dateOrWeekString))` picks templates, difficulty, and ministry, so content is stable within a day/week but varies across them.
- **Failure:** daily quests not completed by midnight are marked `failed` (no penalty beyond approval decay rules). Weekly likewise at week end.
- **Abandon:** player may abandon an active quest; counts as neither completed nor failed for streak purposes but still counts against the daily approval decay if it was the only activity... (decided: abandoning does not protect the streak — only completion does.)

### 5.6 Policies ("standing orders")

Enacted from a static catalog; each has an enact cost (currency) and optional daily upkeep (currency or approval). Examples:

| Policy | Cost | Upkeep | Effect |
|---|---|---|---|
| Early Riser | 150 | — | +10% XP from quests completed before 12:00 local |
| No Zero Days | 200 | −1 approval/day | Approval cannot drop below 40 |
| Austerity Measures | 100 | — | +25% currency from quests, approval gain halved |
| Open Government | 250 | −5 currency/day | +1 approval per quest (instead of +2, plus events give +2 approval) |
| Term Limits | 300 | — | Weekly quests grant +20% XP, but max active weekly quests reduced to 1 |

Policies can be repealed (no refund). Active policies show on the dashboard.

### 5.7 Events ("cabinet crises & opportunities")

- Each day has a 60% chance of one event, seeded like quests.
- An event presents 2–3 choices, each with explicit effects (e.g. "Fund the initiative: −50 currency, +5 approval" / "Ignore it: −4 approval").
- Resolved events go to the event log; effects apply immediately.
- Event catalog: ~20 templates covering scandals, opportunities, and ministry-specific crises.

### 5.8 Treasury shop

Spend currency on permanent upgrades, e.g.:

- **Better Whip** (50 × level): +5% XP per level from all quests.
- **Ministry Grant** (80 × level, per ministry): +1 starting level-equivalent bonus... simpler: +4% currency from that ministry's quests per level.
- **Spin Doctor** (120 × level): +1 approval per quest per level.
- **Emergency Fund** (200, one-time): once per administration, survive a zero-quest day without losing streak.

### 5.9 Day cycle (midnight reset)

On app load, if `lastDailyReset` is before today (local):

1. Mark expired daily/weekly quests failed.
2. Apply approval change: `+0` if any quest completed yesterday (streak +1), else `-6` and streak = 0.
3. Charge policy upkeep; if treasury can't cover it, the policy is auto-repealed ("defunded").
4. Generate today's daily quests + maybe an event (seeded).
5. Weekly reset on ISO week change: generate weekly quests.

### 5.10 Prestige — "New Administration"

At player level 25, the player may start a **New Administration**: reset level/XP/currency/ministries/quests/policies, keep name, seed, best streak, and stats, increment `administration` (+10% all rewards permanently). Unlocks the "Legacy" screen showing past administrations.

## 6. Screens & routes (React Router file routes)

| Route | Screen | Contents |
|---|---|---|
| `/` | Capitol (dashboard) | Approval gauge, level/XP bar, treasury, today's agenda summary, active policies, event card if any |
| `/agenda` | Legislative agenda | Daily / weekly / one-off quest lists, complete & abandon actions, create custom bill |
| `/ministries` | Ministries | Four ministry cards: level, XP bar, passive bonus, related quest history |
| `/policies` | Standing orders | Policy catalog: enact/repeal, costs, upkeep, active state |
| `/events` | Gazette / event log | Current event (if any) + archive of resolved events and choices |
| `/treasury` | Treasury | Shop upgrades, transaction-style ledger of recent gains/spends |
| `/settings` | Settings | Profile name, seed display, export/import save JSON, hard reset |

Navigation: persistent header with route links + approval/level/currency summary.

## 7. Tech stack & architecture

- **Framework:** React Router 7 (framework mode) on Vite, TypeScript (strict), Tailwind CSS v4 via `@tailwindcss/vite`.
- **No backend in MVP.** All state client-side.
- **State management:** a single `GameState` in a `useReducer` + React context (`app/state/game-context.tsx`). Actions: `completeQuest`, `abandonQuest`, `enactPolicy`, `repealPolicy`, `resolveEvent`, `buyUpgrade`, `createQuest`, `tickDay`, `prestige`, `updateProfile`.
- **Persistence:** `app/state/save.ts` — load/save to `localStorage` under key `lifegov.save.v1`; JSON schema with `version` field and a `migrate()` chain for future changes; export/import via file download/upload in Settings.
- **Selectors/derived state:** pure functions in `app/state/derived.ts` (xpToNext, multipliers, effective approval, ministry bonuses) so components stay dumb.
- **Deterministic content:** `app/game/rng.ts` (mulberry32 + string hash), `app/game/quests.ts`, `app/game/policies.ts`, `app/game/events.ts` — static catalogs + seeded generators.
- **Day cycle:** `tickDay` runs in a root loader on app load (and on `visibilitychange`), so resets happen even if the app was closed at midnight.
- **Styling:** Tailwind utility classes, dark "capitol" theme, no component library in MVP. Game-feel via CSS transitions on number changes and progress bars.

## 8. Save format & versioning

- Single JSON blob in localStorage; `version: 1`.
- `migrate(save)` upgrades older versions stepwise; unknown versions → back up to `lifegov.save.backup` and start fresh with a notice.
- Export = download `lifegov-save.json`; import = validate + migrate + reload.

## 9. Milestones

1. **M1 Scaffold:** `create-react-router` RR7 + TS + Tailwind project, root layout, header nav, routes shell, README.
2. **M2 State core:** save/load/migrate, game context + reducer, derived selectors, day-cycle `tickDay` in root loader.
3. **M3 Agenda:** quest catalog, seeded daily/weekly generation, complete/abandon, custom one-off quests, XP/currency/approval/streak effects.
4. **M4 Government:** ministries with levels/bonuses, policy catalog + enact/repeal + upkeep, event catalog + resolution + log.
5. **M5 Treasury & prestige:** shop upgrades, ledger, New Administration flow, titles by level.
6. **M6 Polish:** empty states, animations, export/import, settings, responsive layout, README docs.

## 10. Post-MVP ideas (not in scope now)

- Optional backend sync (accounts, cross-device), multiplayer "coalition" challenges.
- Achievements/badges, sound effects, PWA installability.
- More event depth: multi-day storylines, cabinet ministers as NPCs.
- Analytics: charts of approval/streak/productivity over time.
- Theming: different "regimes" (democracy, technocracy...) that change UI language and rules.

## 11. Open questions

1. Currency name: "credits", "dollars", "political capital"? (affects copy everywhere)
2. Should failed weekly quests cost approval, or only daily ones?
3. Text-first UI vs. illustrated/emoji-heavy? (affects asset pipeline)
4. Should completing quests be one click, or require a confirmation ritual (e.g. "sign the bill" button animation)?
