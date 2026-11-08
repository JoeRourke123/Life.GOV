/**
 * Day cycle — DESIGN.md §10. Pure: no React/expo imports, testable in plain node.
 * The rollover is idempotent — the source of truth is the `lastDailyReset` date,
 * so it fires correctly on boot and on AppState→foreground, even after a force-quit.
 */
import { dayKey, rngFor } from './rng';
import { MINISTRY_IDS } from './types';
import type { Bill, EventLogEntry, SaveState } from './types';

export function todayKey(now: Date = new Date()): string {
  return dayKey(now);
}

export interface DayRollResult {
  state: SaveState;
  rolled: boolean;
  notes: string[];
}

const SI_TITLES = [
  'Clear the inbox',
  'File the paperwork',
  'Water the plants',
  'Reply to the letter',
  'Book the appointment',
  'Pay the bill',
  'Tidy the kitchen',
  'Stretch for five minutes',
];

const GAZETTE_EVENTS: { title: string; detail: string }[] = [
  { title: 'Minister asleep in the chamber', detail: 'The permanent secretary has been informed.' },
  { title: 'Leaked memo', detail: 'The lobby will note it.' },
  { title: 'Despatch-box gaffe', detail: 'Hansard records the exchange.' },
  { title: 'Select committee grilling', detail: 'The permanent secretary will look into it.' },
];

/** Roll the day forward if `lastDailyReset` is not today. */
export function rollDay(state: SaveState, now: Date = new Date()): DayRollResult {
  const today = dayKey(now);
  if (state.lastDailyReset === today) {
    return { state, rolled: false, notes: ['Already rolled for today.'] };
  }
  const notes: string[] = [];
  const rng = rngFor(state.seed, 'day', today);

  // 1. Expire yesterday's unfinished daily SIs; bigger bills stay in the pipeline.
  const bills = state.bills.map((b) => {
    if (b.tier === 'si' && b.status !== 'failed' && b.status !== 'assented' && b.status !== 'abandoned') {
      notes.push(`SI expired unanswered: ${b.title}`);
      return { ...b, status: 'failed' as const };
    }
    return b;
  });

  // 2. Generate today's statutory instruments (1–2, seeded per player per day).
  const n = 1 + (rng() < 0.6 ? 1 : 0);
  const fresh: Bill[] = [];
  for (let i = 0; i < n; i++) {
    fresh.push({
      id: `si-${today}-${i}`,
      title: SI_TITLES[Math.floor(rng() * SI_TITLES.length)],
      tier: 'si',
      ministry: MINISTRY_IDS[Math.floor(rng() * MINISTRY_IDS.length)],
      status: 'proposed',
      stars: 1 + Math.floor(rng() * 2),
      clauses: 1,
      clausesDone: 0,
      createdAt: now.toISOString(),
    });
  }
  notes.push(`Laid ${n} statutory instrument(s) before the House.`);

  // 3. 60% chance of one Gazette event (DESIGN.md §9).
  const gazette = [...state.gazette];
  if (rng() < 0.6) {
    const pick = GAZETTE_EVENTS[Math.floor(rng() * GAZETTE_EVENTS.length)];
    const entry: EventLogEntry = { at: now.toISOString(), kind: 'event', title: pick.title, detail: pick.detail };
    gazette.push(entry);
    notes.push(`Gazette: ${pick.title}.`);
  }

  return { state: { ...state, bills: [...bills, ...fresh], gazette, lastDailyReset: today }, rolled: true, notes };
}
