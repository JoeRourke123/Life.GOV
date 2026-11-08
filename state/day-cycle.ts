/**
 * Day cycle — DESIGN.md §10. Pure: no React/expo imports.
 * The rollover is idempotent — the source of truth is the `lastDailyReset` /
 * `lastWeeklyReset` keys, so it fires correctly on boot and on AppState→foreground,
 * even after a force-quit. Content is seeded per player per day / ISO week (#20).
 */
import { dayKey, isoWeekKey } from './rng';
import { dailySIs, gazetteEvent, weeklyItems } from './content';
import type { SaveState } from './types';

export function todayKey(now: Date = new Date()): string {
  return dayKey(now);
}

export interface DayRollResult {
  state: SaveState;
  rolled: boolean;
  notes: string[];
}

/**
 * Roll the day (and, on ISO-week change, the week) forward if not already done.
 * M2 scope: expire unfinished daily SIs, generate the day's SIs (+ Gazette event),
 * roll weekly items. Approval/streak rules and standing-order upkeep land in #23.
 */
export function rollDay(state: SaveState, now: Date = new Date()): DayRollResult {
  const today = dayKey(now);
  const week = isoWeekKey(now);
  const notes: string[] = [];
  let next = state;

  if (state.lastDailyReset !== today) {
    // 1. Expire yesterday's unfinished daily SIs; bigger bills stay in the pipeline.
    const bills = state.bills.map((b) => {
      if (b.tier === 'si' && b.status !== 'failed' && b.status !== 'assented' && b.status !== 'abandoned') {
        notes.push(`SI struck off: ${b.title}`);
        return { ...b, status: 'failed' as const };
      }
      return b;
    });
    // 2. Today's statutory instruments, seeded per player per day.
    const fresh = dailySIs(state.seed, today, now);
    notes.push(`Laid ${fresh.length} statutory instrument(s) before the House.`);
    // 3. 60% chance of one Gazette event.
    const gazette = [...state.gazette];
    const event = gazetteEvent(state.seed, today, now);
    if (event) {
      gazette.unshift(event);
      notes.push(`Gazette: ${event.title}.`);
    }
    next = { ...next, bills: [...bills, ...fresh], gazette, lastDailyReset: today };
  }

  if (next.lastWeeklyReset !== week) {
    const weekly = weeklyItems(next.seed, week, now);
    notes.push(`Weekly business: ${weekly.map((b) => b.title).join('; ')}.`);
    next = { ...next, bills: [...next.bills, ...weekly], lastWeeklyReset: week };
  }

  return { state: next, rolled: next !== state, notes };
}
