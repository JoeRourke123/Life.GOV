/**
 * Day cycle — DESIGN.md §10. Pure: no React/expo imports.
 * The rollover is idempotent — the source of truth is the `lastDailyReset` /
 * `lastWeeklyReset` keys, so it fires correctly on boot and on AppState→foreground,
 * even after a force-quit. Content is seeded per player per day / ISO week (#20).
 *
 * Rules implemented here (#23): expired SIs struck off with a Hansard line; a day
 * with zero completions costs −6 approval and resets the streak (§7); standing-order
 * upkeep charged at reset, unfunded orders "defunded" and auto-repealed (§8).
 */
import { dayKey, isoWeekKey } from './rng';
import { dailySIs, gazetteEvent, weeklyItems } from './content';
import { orderUpkeep } from '../data/content';
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
 */
export function rollDay(state: SaveState, now: Date = new Date()): DayRollResult {
  const today = dayKey(now);
  const week = isoWeekKey(now);
  const notes: string[] = [];
  let next = state;

  if (state.lastDailyReset !== today) {
    let gazette = [...state.gazette];

    // 1. Expire yesterday's unfinished daily SIs — struck off, with a Hansard line.
    const bills = state.bills.map((b) => {
      if (b.tier === 'si' && b.status !== 'failed' && b.status !== 'assented' && b.status !== 'abandoned') {
        notes.push(`SI struck off: ${b.title}`);
        gazette = [
          { at: now.toISOString(), kind: 'system', title: `${b.title} — struck off`, detail: 'Laid before the House but not completed by end of day.' },
          ...gazette,
        ];
        return { ...b, status: 'failed' as const };
      }
      return b;
    });

    // 2. Today's statutory instruments, seeded per player per day.
    const fresh = dailySIs(state.seed, today, now);
    notes.push(`Laid ${fresh.length} statutory instrument(s) before the House.`);

    // 3. 60% chance of one Gazette event.
    const event = gazetteEvent(state.seed, today, now);
    if (event) {
      gazette = [event, ...gazette];
      notes.push(`Gazette: ${event.title}.`);
    }

    // 4. Zero-completion day: −6 approval, streak reset (DESIGN.md §7).
    const yesterday = dayKey(new Date(now.getTime() - 864e5));
    const doneYesterday = gazette.filter((e) => e.kind === 'quest' && dayKey(new Date(e.at)) === yesterday).length;
    let player = { ...state.player };
    if (doneYesterday === 0) {
      player = { ...player, approval: Math.max(0, player.approval - 6), streak: 0 };
      notes.push('A day with zero completions: −6 approval, streak reset.');
    }

    // 5. Standing-order upkeep (DESIGN.md §8); unfunded orders are defunded + auto-repealed.
    let orders = state.orders;
    for (const o of state.orders) {
      if (!o.active) continue;
      const upkeep = orderUpkeep(o.orderId);
      if (upkeep.gbp > player.currency) {
        orders = orders.map((x) => (x.id === o.id ? { ...x, active: false } : x));
        notes.push(`Standing order defunded and repealed: ${o.orderId}`);
        gazette = [
          { at: now.toISOString(), kind: 'system', title: `Standing order repealed: ${o.orderId}`, detail: 'Unfunded at the reset — the order is defunded and auto-repealed.' },
          ...gazette,
        ];
      } else {
        player = {
          ...player,
          currency: player.currency - upkeep.gbp,
          approval: Math.max(0, Math.min(100, player.approval - upkeep.approval)),
        };
      }
    }

    // 6. No Zero Days: approval floor of 40 while the order is active (DESIGN.md §8).
    if (orders.some((o) => o.active && o.orderId === 'no-zero-days')) {
      player = { ...player, approval: Math.max(40, player.approval) };
    }
    player = { ...player, approval: Math.max(0, Math.min(100, player.approval)) };

    next = {
      ...next,
      bills: [...bills, ...fresh],
      gazette,
      player,
      orders,
      lastDailyReset: today,
    };
  }

  if (next.lastWeeklyReset !== week) {
    const weekly = weeklyItems(next.seed, week, now);
    notes.push(`Weekly business: ${weekly.map((b) => b.title).join('; ')}.`);
    next = { ...next, bills: [...next.bills, ...weekly], lastWeeklyReset: week };
  }

  return { state: next, rolled: next !== state, notes };
}
