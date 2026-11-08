# Life.GOV — Game Design Document

**Tagline:** Run your life like a government.

Life.GOV is a mobile-first life-management app where you govern your own life as a British government. Tasks are legislation, habits are standing orders, streaks are your approval rating, and your life areas are Cabinet ministers. The tone is deadpan — Yes Minister, not pantomime.

Status: v0.2 — brainstormed and agreed design, pre-implementation. This document is the source of truth for the MVP.

---

## 1. Vision & pillars

1. **A life system, not a toy.** This should genuinely help someone stay on top of their life — capture fast, plan the day, manage money and goals.
2. **Everything is Westminster.** No generic todo language. Tasks are bills and statutory instruments, goals are manifesto pledges, history is Hansard, events are the Gazette.
3. **Deadpan British humour throughout.** Civil-service obstruction, lobby scepticism, suspended sittings. Funny because it's dry, never slapstick.
4. **Local-first, offline.** No account, no server in the MVP. State lives on the device.
5. **Stakes without cruelty.** Neglect has consequences (approval decay, elections), but there is no game over and no save deletion.
6. **Mobile first.** Built for Expo Go; quick to open, quick to act.

## 2. Tech stack

- **React Native + Expo**, developed via **Expo Go** (Expo SDK core only: expo-file-system / expo-notifications available; no custom native modules).
- **Expo Router** for file-based navigation — routes map 1:1 to screens below.
- **Persistence:** the save is an open markdown file, `lifegov/save.md` (frontmatter `version` + migration chain), written via expo-file-system; export/import via share sheet ("Save to Files" → iCloud Drive) + document picker. Decision: ADR-0004.
- **Notifications:** `expo-notifications` scheduled locally — midnight agenda, Wednesday 12:00 PMQs, election countdown, low-approval warnings.
- **Home-screen widgets / quick-add shortcuts:** deferred — they require a native dev build, not Expo Go. Revisit post-MVP.
- **Web:** Expo can export a web build later; the original React Router web idea is sequenced after mobile, not abandoned.
- **Deterministic content:** `mulberry32` seeded RNG; daily/weekly content seeded per player per day/week.

## 3. The Cabinet (life areas = ministers)

Seven Cabinet posts, each a "ministry" with its own level and XP:

| Post | Ministry area |
|---|---|
| Chancellor of the Exchequer | Money, budgeting, savings (HM Treasury) |
| Home Secretary | Home, household, life admin |
| Health Secretary | Fitness, sleep, health |
| Education Secretary | Learning, skills, personal development |
| Foreign Secretary | Social life, relationships, travel |
| Business Secretary | Career and work projects |
| Culture Secretary | Hobbies, arts, reading, entertainment |

Ministry level uses the same XP curve as the player. Each level grants **+2% rewards (XP and £) on quests tagged to that ministry**.

## 4. Task taxonomy — the three kinds of legislation

| Tier | Real-world task | Stars | How it's done |
|---|---|---|---|
| **Statutory instrument** (secondary legislation) | Small everyday task | 1–2 | One tap: *"laid before the House."* Instant rewards. |
| **Private Members' Bill** | Medium personal project | 3 | 1–2 sittings through committee, then a division (vote). |
| **Government Bill** | Big project / manifesto pledge | 4–5 | Full pipeline below; made of clauses, one clause per sitting. |

### The bill pipeline (Government Bills)

`proposed → first reading → committee stage → third reading → Royal Assent`

- **Clauses:** when drafting a Government Bill you set the title, assign the Cabinet minister, and choose **any number of clauses**. Each clause = one sitting. Clause count is the real effort: 12 clauses ≈ 12 × 25 min ≈ 5 hours.
- **Stages advance automatically** as clauses complete: created = proposed; committed = first reading; clauses in progress = committee; all clauses done = third reading; final vote = Royal Assent → rewards paid, entry written to Hansard.
- **Sittings:** timed focus sessions, default **25 minutes**, adjustable. One sitting completes one clause and pays a slice of the reward. If interrupted: the clause stays in committee — no reward, no penalty. *"The sitting was suspended."*

### Daily content

- Each day generates a set of **daily statutory instruments** (seeded, 1–2 stars, due end of day).
- **PMQs every Wednesday 12:00** — a push notification: *"You are called to the despatch box."* A high-difficulty question (3–5 star bill) appears; answering well gives a bonus.
- Weekly: a couple of Private Members' Bills / bigger items, seeded per ISO week.
- Player-created items of any tier at any time.

## 5. Manifestos, terms & elections

- **Writing a manifesto** starts a new term. You choose:
  - **Pledges** — any number of Government Bills flagged as manifesto pledges, each tagged to a Cabinet minister, all due at election day.
  - **Term length → election date:** snap election (**1 week**), **1 month**, **3 months**, or **1 year**.
- **Overcommitment warning:** soft cap of **5 pledges**. Beyond it, the app warns: *"The lobby will note the ambition, Prime Minister."* Each pledge over the cap costs **−1 approval** immediately (scepticism). At the election, each **undelivered** over-cap pledge costs an extra **−3 approval** as a broken promise.
- **Election day** (the chosen date): the writ is dropped and the ballot is called. Result bands by approval:
  - **Landslide** (≥75): big £ bonus, +10 approval, celebration.
  - **Majority** (50–74): standard mandate bonus.
  - **Hung parliament** (35–49): you can only lay statutory instruments (difficulty ≤ 2) until approval recovers above 50.
  - **Defeat** (<35): see stakes below.

## 6. Stakes — no game over, but governments fall

- **Vote of no confidence:** if approval reaches 0 mid-term, the backbenchers move a vote of no confidence → immediate early election.
- **Defeat at the ballot** costs (agreed "option 1 + light 2"):
  1. **Reputational:** all undelivered pledges recorded in Hansard as *broken promises* (lasting approval penalty + permanent stat); a **caretaker period** where quest rewards are halved for a few days.
  2. **Currency:** a small flat **"cost of the election"** charged in £ (the taxpayer foots the bill).
  - You keep level, XP, honours, stats, and history — like a real politician who loses and returns.
- There is **no lose state and no save deletion**.

## 7. Approval, streaks, XP & £

- **Approval:** 0–100, starts at 50. +2 per completed quest (daily cap +8). A day with zero completions: **−6 approval** and streak resets. Streak multiplier on rewards: `1 + min(streak, 30) × 0.02` (up to +60%).
- **XP / levels:** `xpToNext(level) = round(80 × level^1.6)`. Quest XP = `round(20 × difficulty × streak × administration bonus)`. Level-up grants **£25 × new level** ("budget appropriation").
- **£ (sterling):** quests pay `round(10 × difficulty × administration bonus)`; spent in the Treasury; the nation's finances are your finances.
- **Prestige ("New Administration"):** at level 25, dissolve Parliament for a general election: reset level/£/ministries/active bills, keep history and honours, `administration += 1` → permanent **+10% all rewards**.
- **Honours ladder** by level: titles up to CBE/OBE, then **knighthood** (Sir/Dame) at high level.

## 8. Standing orders (policies)

Enactable from a catalog; each has a £ enact cost and optional daily upkeep (£ or approval). Repeal = no refund. Examples: Early Riser (+10% XP before noon), No Zero Days (approval floor 40), Austerity (+25% £ from quests, approval gain halved), Open Government (−5 £/day, +approval from events), Term Limits (+20% XP on weekly bills, max 1 active weekly bill). Upkeep is charged at the midnight reset; unfunded orders are *"defunded"* and auto-repealed.

## 9. The Gazette (events & scandals)

- 60% chance of one seeded event per day, 2–3 choices with explicit effects (£ / approval / XP / ministry).
- Themes: minister asleep in the chamber, leaked memo, despatch-box gaffe, select committee grilling, by-election jitters, *"delayed in committee"* obstruction (Yes Minister: *"I'll have the permanent secretary look at it, Prime Minister"*).
- All resolved events are logged in **Hansard** with the choice made.

## 10. Day cycle

On app foreground and via midnight notification: mark expired items failed, apply approval/streak rules, charge standing-order upkeep, generate the day's statutory instruments (+ possible Gazette event), roll the week's items on ISO week change. Weekly PMQ scheduled Wednesday 12:00.

## 11. Screens (Expo Router routes)

| Route | Screen | Contents |
|---|---|---|
| `/` | No. 10 (dashboard) | Approval gauge, level/XP, £, today's agenda, active orders, Gazette card, election countdown |
| `/agenda` | Order Paper | SIs / PMBs / Government Bills by tier; start sittings; create legislation |
| `/cabinet` | Cabinet | Seven ministers: level, XP bar, bonus, their bills |
| `/orders` | Standing orders | Catalog: enact/repeal, costs, upkeep, active state |
| `/gazette` | The Gazette | Today's event + Hansard archive (all actions, events, elections) |
| `/treasury` | HM Treasury | £ balance, shop upgrades, ledger of gains/spends |
| `/settings` | Settings | Profile, seed, export/import save, hard reset |

**Treasury shop (examples, £):** Better Whip (50×/level, +5% XP), Ministry Grant (80×/level per ministry, +4% £ from that ministry), Spin Doctor (120×/level, +1 approval per quest), Emergency Fund (200, once per administration: survive a zero day without losing streak).

## 12. Data model (SaveState v1)

```ts
interface SaveState {
  version: 1;
  createdAt: string;
  seed: number;
  player: { name; title; level; xp; currency; approval; streak; bestStreak; administration };
  ministries: Record<MinistryId, { level; xp }>;
  bills: Bill[];            // SIs, PMBs, Government Bills; status: proposed|reading|committee|third|assented|failed|abandoned
  manifesto: { pledges: string[] /* bill ids */; electionDate: string; termLength: string } | null;
  orders: OrderInstance[];  // standing orders
  gazette: EventLogEntry[]; // Hansard: quests, events, elections, honours
  stats: { questsCompleted; eventsResolved; currencyEarned; electionsHeld; defeats };
  lastDailyReset: string;
  lastWeeklyReset: string;
  settings: { sittingMinutes: number };
}
```

## 13. Milestones

1. **M1 Scaffold:** Expo app, Expo Router routes, No. 10 layout, theme, README.
2. **M2 State core:** save/load/migrate, reducer + context, seeded RNG, day cycle + notifications.
3. **M3 Agenda:** SI/PMB/Bill tiers, sittings timer, pipeline stages, XP/£/approval/streak, Hansard.
4. **M4 Cabinet & orders:** seven ministries, standing orders with upkeep, Gazette events.
5. **M5 Manifesto & elections:** pledges, overcommitment warning, term lengths, election results, defeat/caretaker, vote of no confidence, Treasury shop.
6. **M6 Polish:** PMQs, honours, prestige, export/import, empty states, onboarding (first manifesto), README.

## 14. Decisions log (agreed in brainstorming)

- Deadpan Yes Minister tone; British Westminster framing throughout.
- Mobile-first: React Native + Expo, developed in Expo Go; widgets deferred to dev-build phase; web export later.
- Currency is £ sterling.
- Cabinet of seven, incl. Culture Secretary; Health its own Secretary of State.
- Manifesto: any number of pledges (soft cap 5 with overcommitment warning + penalties); term length chosen per manifesto: 1 week / 1 month / 3 months / 1 year.
- No game over: approval 0 → vote of no confidence → early election; defeat = Hansard broken promises + approval penalty + caretaker period + small election cost in £; progress (level/honours/history) is kept.
- Task tiers: statutory instruments (1 tap) / Private Members' Bills / Government Bills (clauses, one per sitting).
- Sittings are timed focus sessions (default 25 min); interrupted sitting = no reward, no penalty.
- Clause count for Government Bills is freely chosen by the player.

## 15. Open questions

1. Visual style: dark despatch-box theme, serif headlines, red/gold accents — text-first, emoji-light. Confirm?
2. Exact Gazette event catalog (~20) — write during M4.
3. Sound: none in MVP.
4. Should failed weekly items cost approval, or only daily ones?
