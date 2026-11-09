/**
 * Sittings & the bill pipeline — spike PoC for issue #25; decisions recorded in ADR-0005.
 * Pure module: no React/expo imports, so it runs under plain node for tests.
 *
 * Timer mechanics: timestamp-based. The sitting is persisted in the save as
 * { billId, clauseIndex, startedAt, endsAt }; remaining time is computed from
 * Date.now() on boot and on every return to the foreground, so a force-quit
 * mid-sitting loses nothing. A background timer (expo-task-manager) cannot be
 * relied on in Expo Go — SDK 58 docs: TaskManager is unavailable on Android
 * and does not support background execution on iOS; expo-background-fetch is
 * advisory (10–15 min), dev-build-only on iOS, and never fires on a terminated
 * app. Wall-clock timestamps in the markdown save are the source of truth.
 *
 * Pipeline (DESIGN.md §4): proposed → reading → committee → third → assented,
 * advanced by clause completion; adjourn = clause stays in committee, no reward,
 * no penalty ("The sitting was suspended."). One clause = one slice of the
 * reward, paid once (guarded by clauseIndex === clausesDone) and printed as
 * "£10 · 20 XP" (DESIGN.md §7: £ = round(10 × stars × admin × streak),
 * XP = round(20 × stars × admin × streak), sliced per clause).
 */
import type { Bill, MinistryId, Sitting, SaveState } from './types';

export interface SittingResult {
  state: SaveState;
  notes: string[];
}

const ok = (state: SaveState, ...notes: string[]): SittingResult => ({ state, notes });
const fail = (state: SaveState, note: string): SittingResult => ({ state, notes: [note] });

export function sittingEndsAt(startedAt: Date, minutes: number): Date {
  return new Date(startedAt.getTime() + minutes * 60_000);
}

/** Wall-clock remaining — the only timer math there is. Negative clamps to 0. */
export function remainingMs(s: Sitting, now: Date = new Date()): number {
  return Math.max(0, Date.parse(s.endsAt) - now.getTime());
}

export function isElapsed(s: Sitting, now: Date = new Date()): boolean {
  return remainingMs(s, now) <= 0;
}

/** xpToNext(level) = round(80 × level^1.6) — DESIGN.md §7. */
export function xpToNext(level: number): number {
  return Math.round(80 * Math.pow(level, 1.6));
}

/**
 * One clause's slice of the quest reward (DESIGN.md §7): £ = round(10 × stars ×
 * adminBonus × streakMult), XP = round(20 × stars × adminBonus × streakMult),
 * split evenly per clause with the rounding remainder on the last clause, so
 * the slices sum exactly to the full quest reward.
 */
export function clauseReward(bill: Bill, player: SaveState['player'], clauseIndex: number): { gbp: number; xp: number } {
  const adminBonus = 1 + 0.1 * (player.administration - 1);
  const streakMult = 1 + Math.min(player.streak, 30) * 0.02;
  const gbpTotal = Math.round(10 * bill.stars * adminBonus * streakMult);
  const xpTotal = Math.round(20 * bill.stars * adminBonus * streakMult);
  const last = clauseIndex === bill.clauses - 1;
  const gbpSlice = Math.floor(gbpTotal / bill.clauses);
  const xpSlice = Math.floor(xpTotal / bill.clauses);
  return {
    gbp: last ? gbpTotal - gbpSlice * (bill.clauses - 1) : gbpSlice,
    xp: last ? xpTotal - xpSlice * (bill.clauses - 1) : xpSlice,
  };
}

function addXp(player: SaveState['player'], amount: number): { player: SaveState['player']; notes: string[] } {
  const notes: string[] = [];
  let { level, xp, currency } = player;
  xp += amount;
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
    currency += 25 * level; // "budget appropriation" — DESIGN.md §7
    notes.push(`Level ${level} — budget appropriation: +£${25 * level}.`);
  }
  return { player: { ...player, level, xp, currency }, notes };
}

function questDone(state: SaveState, bill: Bill, now: Date): SittingResult {
  // A completed quest: +2 approval (daily cap +8 lives in the day cycle), streak up, Hansard entry.
  const p = state.player;
  const approval = Math.min(100, p.approval + 2);
  const streak = p.streak + 1;
  return {
    state: {
      ...state,
      player: { ...p, approval, streak, bestStreak: Math.max(p.bestStreak, streak) },
      stats: { ...state.stats, questsCompleted: state.stats.questsCompleted + 1 },
      gazette: [
        { at: now.toISOString(), kind: 'quest', title: `Royal Assent — ${bill.title}`, detail: `${bill.tier === 'gov' ? 'Government Bill' : bill.tier === 'pmb' ? "Private Members' Bill" : 'Statutory instrument'} assented. ${bill.clausesDone}/${bill.clauses} clauses.` },
        ...state.gazette,
      ],
    },
    notes: [`Royal Assent — ${bill.title}. Approval +2, streak ${streak}.`],
  };
}

export interface DraftInput {
  title: string;
  tier: Bill['tier'];
  ministry: MinistryId;
  stars: number;
  clauses: number;
  id?: string;
}

/** Draft a bill: created = proposed. Gov bills need ≥1 clause — 0 clauses is refused here. */
export function draftBill(state: SaveState, input: DraftInput, now: Date = new Date()): SittingResult {
  const clauses = input.tier === 'si' ? 1 : input.clauses;
  if (input.tier !== 'si' && clauses < 1) {
    return fail(state, 'A bill with no clauses has nothing to sit on — draft at least one clause.');
  }
  if (input.tier === 'pmb' && clauses > 2) {
    return fail(state, "A Private Members' Bill takes 1–2 clauses (sittings), then a division.");
  }
  const bill: Bill = {
    id: input.id ?? `bill-${now.getTime()}`,
    title: input.title,
    tier: input.tier,
    ministry: input.ministry,
    status: 'proposed',
    stars: input.stars,
    clauses,
    clausesDone: 0,
    createdAt: now.toISOString(),
  };
  return ok({ ...state, bills: [...state.bills, bill] }, `Drafted: ${bill.title} (${bill.tier}, ${clauses} clause${clauses === 1 ? '' : 's'}).`);
}

/**
 * Start a sitting on the bill's next clause. One sitting at a time: if another
 * sitting is active (and not elapsed), the House is already sitting — refuse.
 * proposed → reading (the bill is committed — first reading); once clauses are
 * in progress the stage is committee (DESIGN.md §4).
 */
export function startSitting(state: SaveState, billId: string, now: Date = new Date()): SittingResult {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill) return fail(state, 'No such bill.');
  if (!['proposed', 'reading', 'committee'].includes(bill.status)) {
    return fail(state, `Cannot sit on a bill that is ${bill.status}.`);
  }
  if (bill.clausesDone >= bill.clauses) return fail(state, 'No clauses left to sit on.');
  if (state.sitting && !isElapsed(state.sitting, now)) return fail(state, 'The House is already sitting — adjourn first.');
  const startedAt = now;
  const endsAt = sittingEndsAt(startedAt, state.settings.sittingMinutes);
  const sitting: Sitting = {
    billId,
    clauseIndex: bill.clausesDone,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
  const status: Bill['status'] = bill.status === 'proposed' ? 'reading' : 'committee';
  const bills = state.bills.map((b) => (b.id === billId ? { ...b, status } : b));
  return ok(
    { ...state, bills, sitting },
    `The House sits — clause ${sitting.clauseIndex + 1} of ${bill.clauses} on “${bill.title}”.`,
  );
}

/**
 * Settle the active sitting against the wall clock — called on boot and on
 * AppState→foreground (alongside rollDay). Not elapsed: nothing changes, the
 * timer simply kept running while the app was away. Elapsed: the clause passes.
 * This is the force-quit survival path.
 */
export function settleSitting(state: SaveState, now: Date = new Date()): SittingResult {
  const s = state.sitting;
  if (!s) return ok(state);
  if (!isElapsed(s, now)) {
    const secs = Math.ceil(remainingMs(s, now) / 1000);
    return ok(state, `The sitting continues — ${secs}s left on clause ${s.clauseIndex + 1}.`);
  }
  return completeSitting(state, now);
}

/** Complete the elapsed sitting: clause passes, its reward slice is paid once. */
function completeSitting(state: SaveState, now: Date): SittingResult {
  const s = state.sitting!;
  const bill = state.bills.find((b) => b.id === s.billId);
  // Paid-once guard: the sitting's clause must be exactly the next undone clause.
  if (!bill || s.clauseIndex !== bill.clausesDone) {
    return ok({ ...state, sitting: null }, 'The sitting was already settled.');
  }
  const reward = clauseReward(bill, state.player, s.clauseIndex);
  const { player, notes: xpNotes } = addXp(state.player, reward.xp);
  const clausesDone = bill.clausesDone + 1;
  const status: Bill['status'] = clausesDone >= bill.clauses ? 'third' : 'committee';
  const bills = state.bills.map((b) => (b.id === s.billId ? { ...b, clausesDone, status } : b));
  const next: SaveState = {
    ...state,
    bills,
    sitting: null,
    player: { ...player, currency: player.currency + reward.gbp },
    stats: { ...state.stats, currencyEarned: state.stats.currencyEarned + reward.gbp },
    gazette: [
      {
        at: now.toISOString(),
        kind: 'quest',
        title: `Clause ${s.clauseIndex + 1} of “${bill.title}” passed`,
        detail: `£${reward.gbp} · ${reward.xp} XP. ${clausesDone}/${bill.clauses} clauses.`,
      },
      ...state.gazette,
    ],
  };
  return ok(next, `Clause ${s.clauseIndex + 1} passed — £${reward.gbp} · ${reward.xp} XP.`, ...xpNotes);
}

/**
 * Adjourn mid-sitting: the clause stays in committee — no reward, no penalty.
 * "The sitting was suspended." (DESIGN.md §4; mockup 03 "Adjourn at any time").
 */
export function adjournSitting(state: SaveState, now: Date = new Date()): SittingResult {
  const s = state.sitting;
  if (!s) return fail(state, 'The House is not sitting.');
  const bill = state.bills.find((b) => b.id === s.billId);
  return {
    state: {
      ...state,
      sitting: null,
      gazette: [
        {
          at: now.toISOString(),
          kind: 'system',
          title: 'The sitting was suspended.',
          detail: bill ? `Clause ${s.clauseIndex + 1} of “${bill.title}” stays in committee.` : '',
        },
        ...state.gazette,
      ],
    },
    notes: ['The sitting was suspended. The clause stays in committee — no reward, no penalty.'],
  };
}

/** The division at third reading: Royal Assent. Rewards were already paid per clause. */
export function divide(state: SaveState, billId: string, now: Date = new Date()): SittingResult {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill) return fail(state, 'No such bill.');
  if (bill.status !== 'third') return fail(state, `Cannot divide a bill that is ${bill.status} — all clauses must pass first.`);
  const bills = state.bills.map((b) => (b.id === billId ? { ...b, status: 'assented' as const } : b));
  return questDone({ ...state, bills, sitting: state.sitting?.billId === billId ? null : state.sitting }, bill, now);
}

/** SI: one tap — "laid before the House", instant full reward (clauses = 1). */
export function laySI(state: SaveState, billId: string, now: Date = new Date()): SittingResult {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill || bill.tier !== 'si') return fail(state, 'No such statutory instrument.');
  if (bill.status !== 'proposed') return fail(state, `The instrument is already ${bill.status}.`);
  const reward = clauseReward(bill, state.player, 0);
  const { player, notes: xpNotes } = addXp(state.player, reward.xp);
  const bills = state.bills.map((b) => (b.id === billId ? { ...b, status: 'assented' as const, clausesDone: b.clauses } : b));
  const withReward: SaveState = {
    ...state,
    bills,
    player: { ...player, currency: player.currency + reward.gbp },
    stats: { ...state.stats, currencyEarned: state.stats.currencyEarned + reward.gbp },
    gazette: [
      { at: now.toISOString(), kind: 'quest', title: `Laid before the House — ${bill.title}`, detail: `£${reward.gbp} · ${reward.xp} XP.` },
      ...state.gazette,
    ],
  };
  const done = questDone(withReward, bill, now);
  return { state: done.state, notes: [`Laid before the House — £${reward.gbp} · ${reward.xp} XP.`, ...done.notes, ...xpNotes] };
}

/**
 * Abandon mid-committee: status → abandoned, any active sitting on it is lifted,
 * already-paid clause slices stay paid (no clawback), Hansard records it.
 */
export function abandonBill(state: SaveState, billId: string, now: Date = new Date()): SittingResult {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill) return fail(state, 'No such bill.');
  if (['assented', 'failed', 'abandoned'].includes(bill.status)) return fail(state, `A bill that is ${bill.status} cannot be abandoned.`);
  const bills = state.bills.map((b) => (b.id === billId ? { ...b, status: 'abandoned' as const } : b));
  return {
    state: {
      ...state,
      bills,
      sitting: state.sitting?.billId === billId ? null : state.sitting,
      gazette: [
        { at: now.toISOString(), kind: 'system', title: `“${bill.title}” abandoned`, detail: `${bill.clausesDone}/${bill.clauses} clauses passed; paid slices are not clawed back.` },
        ...state.gazette,
      ],
    },
    notes: [`“${bill.title}” abandoned mid-pipeline. Paid clause slices stay paid.`],
  };
}

/** Debug/PoC only: rewind the active sitting's clock (simulates time passing). */
export function rewindSitting(state: SaveState, seconds: number): SittingResult {
  const s = state.sitting;
  if (!s) return fail(state, 'No active sitting to rewind.');
  const back = seconds * 1000;
  const sitting: Sitting = {
    ...s,
    startedAt: new Date(Date.parse(s.startedAt) - back).toISOString(),
    endsAt: new Date(Date.parse(s.endsAt) - back).toISOString(),
  };
  return ok({ ...state, sitting }, `Clock rewound ${seconds}s on the sitting.`);
}
