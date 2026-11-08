/**
 * Game store — zustand, one store over SaveState (conventions: .vibe/skills/zustand).
 * Persistence is our own debounced markdown-file write, not zustand/persist.
 * Day-cycle trigger: boot + AppState→foreground, both funnel into idempotent rollDay.
 */
import { AppState } from 'react-native';
import { create } from 'zustand';
import { dayKey, hashSeed, isoWeekKey } from './rng';
import { rollDay } from './day-cycle';
import { serializeSave } from './markdown';
import { fakeV0Save, migrateToLatest, SAVE_VERSION } from './migrations';
import { exportSaveText, importSaveText, readSaveText, writeSaveText } from './storage';
import { ensureNotificationPermissions, scheduleIn, syncSchedules } from './notifications';
import { MINISTRY_IDS } from './types';
import type { EventLogEntry, SaveState } from './types';

export function newGame(seed: number, now: Date = new Date()): SaveState {
  return {
    version: 1,
    createdAt: now.toISOString(),
    seed,
    player: {
      name: 'Prime Minister',
      title: 'Prime Minister',
      level: 1,
      xp: 0,
      currency: 0,
      approval: 50,
      streak: 0,
      bestStreak: 0,
      administration: 1,
    },
    ministries: Object.fromEntries(MINISTRY_IDS.map((id) => [id, { level: 1, xp: 0 }])) as SaveState['ministries'],
    bills: [],
    manifesto: null,
    orders: [],
    gazette: [],
    stats: { questsCompleted: 0, eventsResolved: 0, currencyEarned: 0, electionsHeld: 0, defeats: 0 },
    lastDailyReset: dayKey(now),
    lastWeeklyReset: isoWeekKey(now),
    settings: { sittingMinutes: 25 },
  };
}

/** Strip store-only fields back down to the persistable SaveState. */
function toSave(s: GameStore): SaveState {
  return {
    version: s.version,
    createdAt: s.createdAt,
    seed: s.seed,
    player: s.player,
    ministries: s.ministries,
    bills: s.bills,
    manifesto: s.manifesto,
    orders: s.orders,
    gazette: s.gazette,
    stats: s.stats,
    lastDailyReset: s.lastDailyReset,
    lastWeeklyReset: s.lastWeeklyReset,
    settings: s.settings,
  };
}

interface GameStore extends SaveState {
  hydrated: boolean;
  lastMigration: string | null;
  log: string[];
  hydrate: () => Promise<void>;
  persistNow: () => Promise<void>;
  plantFakeV0: () => Promise<void>;
  rollDayNow: () => void;
  recordEvent: (entry: EventLogEntry) => void;
  bumpXp: (amount: number) => void;
  scheduleTestNotification: (seconds: number) => Promise<string | null>;
  exportSave: () => Promise<boolean>;
  importSave: () => Promise<void>;
}

function say(log: string[], ...lines: string[]): string[] {
  return [...lines, ...log].slice(0, 30);
}

export const useGame = create<GameStore>()((set, get) => ({
  ...newGame(1),
  hydrated: false,
  lastMigration: null,
  log: [],

  hydrate: async () => {
    const text = await readSaveText();
    if (!text) {
      // First run: ask for notification permission once, gracefully (#22).
      void ensureNotificationPermissions();
      set({ ...newGame(hashSeed('lifegov', Date.now())), hydrated: true, log: say(get().log, 'No save file found — a new administration begins.') });
    } else {
      try {
        const { state, from } = migrateToLatest(text);
        set({
          ...state,
          hydrated: true,
          lastMigration: from === SAVE_VERSION ? null : `v${from} → v${SAVE_VERSION}`,
          log: say(get().log, from === SAVE_VERSION ? 'Save loaded (v1).' : `Save migrated v${from} → v${SAVE_VERSION}.`),
        });
      } catch (err) {
        set({ hydrated: true, log: say(get().log, `Save refused: ${(err as Error).message}`) });
        return;
      }
    }
    void syncSchedules(toSave(get()));
  },

  persistNow: async () => {
    await writeSaveText(serializeSave(toSave(get())));
    set({ log: say(get().log, 'Save written to lifegov/save.md.') });
  },

  plantFakeV0: async () => {
    await writeSaveText(fakeV0Save());
    set({ log: say(get().log, 'A fake v0 save was planted in lifegov/save.md.') });
    await get().hydrate();
  },

  rollDayNow: () => {
    const { state, rolled, notes } = rollDay(toSave(get()));
    set({ ...state, log: say(get().log, ...notes) });
    if (rolled) void syncSchedules(state); // schedules recomputed on each reset (#22)
  },

  recordEvent: (entry) => {
    set({ gazette: [entry, ...get().gazette], log: say(get().log, `Hansard: ${entry.title}`) });
  },

  bumpXp: (amount) => {
    const p = get().player;
    set({ player: { ...p, xp: p.xp + amount }, log: say(get().log, `+${amount} XP.`) });
  },

  scheduleTestNotification: async (seconds) => {
    const granted = await ensureNotificationPermissions();
    if (!granted) {
      set({ log: say(get().log, 'Notification permission refused.') });
      return null;
    }
    const id = await scheduleIn(seconds, 'You are called to the despatch box', `Test notification in ${seconds}s.`);
    set({ log: say(get().log, id ? `Notification scheduled (${seconds}s, id ${id}).` : 'Web: notifications unsupported.') });
    return id;
  },

  exportSave: async () => {
    const ok = await exportSaveText(serializeSave(toSave(get())));
    set({ log: say(get().log, ok ? 'Save shared — “Save to Files” puts it in iCloud Drive.' : 'Sharing unavailable.') });
    return ok;
  },

  importSave: async () => {
    const text = await importSaveText();
    if (!text) {
      set({ log: say(get().log, 'Import cancelled (or unsupported on web).') });
      return;
    }
    await writeSaveText(text);
    await get().hydrate();
  },
}));

// Debounced persistence: every state change writes the markdown save ~300ms later.
let timer: ReturnType<typeof setTimeout> | null = null;
useGame.subscribe((s, prev) => {
  if (!s.hydrated || s === prev) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    void writeSaveText(serializeSave(toSave(useGame.getState())));
  }, 300);
});

/** Wire the day cycle: boot (hydrate) + AppState→foreground both roll the day. */
export function startDayCycle(): () => void {
  void useGame.getState().hydrate().then(() => useGame.getState().rollDayNow());
  const sub = AppState.addEventListener('change', (next) => {
    if (next === 'active') useGame.getState().rollDayNow();
  });
  return () => sub.remove();
}
