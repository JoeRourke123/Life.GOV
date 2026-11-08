/**
 * Seeded content generation — DESIGN.md §2/§4. Pure module: no React/expo imports.
 * Same (player seed, day/ISO week) → identical content, on any device.
 */
import { dayKey, isoWeekKey, rngFor } from './rng';
import { GAZETTE_POOL, SI_POOL, WEEKLY_POOL } from '../data/content';
import type { Bill, EventLogEntry } from './types';

/** Today's statutory instruments: 1–2, 60% chance of a second (DESIGN.md §4/§10). */
export function dailySIs(seed: number, day: string, now: Date = new Date()): Bill[] {
  const rng = rngFor(seed, 'day', day);
  const n = 1 + (rng() < 0.6 ? 1 : 0);
  const pool = [...SI_POOL];
  const out: Bill[] = [];
  for (let i = 0; i < n; i++) {
    const pick = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    out.push({
      id: `si-${day}-${i}`,
      title: pick.title,
      tier: 'si',
      ministry: pick.ministry,
      status: 'proposed',
      stars: pick.stars,
      clauses: 1,
      clausesDone: 0,
      createdAt: now.toISOString(),
    });
  }
  return out;
}

/** The week's items: a couple of PMBs / bigger bills per ISO week (DESIGN.md §4). */
export function weeklyItems(seed: number, week: string, now: Date = new Date()): Bill[] {
  const rng = rngFor(seed, 'week', week);
  const pool = [...WEEKLY_POOL];
  const n = 2;
  const out: Bill[] = [];
  for (let i = 0; i < n; i++) {
    const pick = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    out.push({
      id: `wk-${week}-${i}`,
      title: pick.title,
      tier: pick.tier,
      ministry: pick.ministry,
      status: 'proposed',
      stars: pick.stars,
      clauses: pick.clauses,
      clausesDone: 0,
      createdAt: now.toISOString(),
    });
  }
  return out;
}

/** 60% chance of one Gazette event per day (DESIGN.md §9). Null = a quiet day. */
export function gazetteEvent(seed: number, day: string, now: Date = new Date()): EventLogEntry | null {
  const rng = rngFor(seed, 'gazette', day);
  if (rng() >= 0.6) return null;
  const pick = GAZETTE_POOL[Math.floor(rng() * GAZETTE_POOL.length)];
  return { at: now.toISOString(), kind: 'event', title: pick.title, detail: pick.detail };
}

export { dayKey, isoWeekKey };
