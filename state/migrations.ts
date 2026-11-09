/**
 * Migration chain — ADR-0004. The save file's frontmatter carries `version`;
 * on load, migrations run in order until the state reaches SAVE_VERSION.
 * A file from the FUTURE is refused, never guessed at.
 *
 * Pure module: only `import type` + pure sibling imports, testable in plain node.
 */
import { parseFrontmatter, parseSave } from './markdown';
import type { SaveState } from './types';
import { MINISTRY_IDS } from './types';
import { dayKey, hashSeed, isoWeekKey } from './rng';

export const SAVE_VERSION = 1;

/** Legacy v0 save: flat bullets, `credits` instead of `currency`, no ministries. */
interface SaveV0Raw {
  name: string;
  credits: number;
  approval: number;
  streak: number;
}

function parseV0(text: string): SaveV0Raw {
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const out: Record<string, string> = {};
  for (const line of body.split(/\r?\n/)) {
    const b = line.match(/^-\s+([a-zA-Z]+):\s*(.*)$/);
    if (b) out[b[1]] = b[2].trim();
  }
  return {
    name: out.name ?? 'Prime Minister',
    credits: Number(out.credits ?? 0),
    approval: Number(out.approval ?? 50),
    streak: Number(out.streak ?? 0),
  };
}

function migrateV0toV1(raw: SaveV0Raw, createdAt: string): SaveState {
  return {
    version: 1,
    createdAt,
    seed: hashSeed('migrated', raw.name, createdAt),
    player: {
      name: raw.name,
      title: 'Prime Minister',
      level: 1,
      xp: 0,
      currency: raw.credits,
      approval: raw.approval,
      streak: raw.streak,
      bestStreak: raw.streak,
      administration: 1,
    },
    ministries: Object.fromEntries(MINISTRY_IDS.map((id) => [id, { level: 1, xp: 0 }])) as SaveState['ministries'],
    bills: [],
    sitting: null,
    manifesto: null,
    orders: [],
    gazette: [
      { at: createdAt, kind: 'system', title: 'Save migrated', detail: 'v0 save brought up to v1. Credits became £.' },
    ],
    stats: { questsCompleted: 0, eventsResolved: 0, currencyEarned: 0, electionsHeld: 0, defeats: 0 },
    lastDailyReset: dayKey(new Date(createdAt)),
    lastWeeklyReset: isoWeekKey(new Date(createdAt)),
    settings: { sittingMinutes: 25 },
  };
}

export interface MigrationResult {
  state: SaveState;
  from: number;
  to: number;
}

/**
 * Parse a save file of any known version and migrate it to SAVE_VERSION.
 * Throws if the file is from a newer version than this build understands.
 */
export function migrateToLatest(text: string): MigrationResult {
  const fm = parseFrontmatter(text);
  const from = Number(fm.version ?? 0);
  if (from > SAVE_VERSION) {
    throw new Error(`Save file is version ${from}; this build understands up to ${SAVE_VERSION}. Export it and upgrade the app.`);
  }
  if (from === SAVE_VERSION) {
    return { state: parseSave(text), from, to: SAVE_VERSION };
  }
  // v0 → v1 (the chain extends here as versions land)
  if (from === 0) {
    const state = migrateV0toV1(parseV0(text), fm.createdAt ?? new Date().toISOString());
    return { state, from, to: SAVE_VERSION };
  }
  throw new Error(`No migration path from version ${from}`);
}

/** A fake v0 save, used by the spike PoC to prove the migration chain. */
export function fakeV0Save(): string {
  return [
    '---',
    'format: lifegov-save',
    'version: 0',
    'createdAt: 2026-11-01T09:00:00.000Z',
    '---',
    '',
    '# Save',
    '',
    '- name: Joe',
    '- credits: 45',
    '- approval: 62',
    '- streak: 4',
    '',
  ].join('\n');
}
