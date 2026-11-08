/** SaveState v1 — docs/DESIGN.md §12. The single source of truth for game state. */

export type MinistryId =
  | 'treasury'
  | 'home'
  | 'health'
  | 'education'
  | 'foreign'
  | 'business'
  | 'culture';

export const MINISTRY_IDS: MinistryId[] = [
  'treasury',
  'home',
  'health',
  'education',
  'foreign',
  'business',
  'culture',
];

export type BillTier = 'si' | 'pmb' | 'gov';
export type BillStatus =
  | 'proposed'
  | 'reading'
  | 'committee'
  | 'third'
  | 'assented'
  | 'failed'
  | 'abandoned';

export interface Bill {
  id: string;
  title: string;
  tier: BillTier;
  ministry: MinistryId;
  status: BillStatus;
  stars: number;
  clauses: number;
  clausesDone: number;
  createdAt: string;
}

export interface OrderInstance {
  id: string;
  orderId: string;
  enactedAt: string;
  active: boolean;
}

export interface EventLogEntry {
  at: string;
  kind: 'quest' | 'event' | 'election' | 'honour' | 'system';
  title: string;
  detail: string;
}

export interface SaveState {
  version: 1;
  createdAt: string;
  seed: number;
  player: {
    name: string;
    title: string;
    level: number;
    xp: number;
    currency: number;
    approval: number;
    streak: number;
    bestStreak: number;
    administration: number;
  };
  ministries: Record<MinistryId, { level: number; xp: number }>;
  bills: Bill[];
  manifesto: { pledges: string[]; electionDate: string; termLength: string } | null;
  orders: OrderInstance[];
  gazette: EventLogEntry[];
  stats: {
    questsCompleted: number;
    eventsResolved: number;
    currencyEarned: number;
    electionsHeld: number;
    defeats: number;
  };
  lastDailyReset: string;
  lastWeeklyReset: string;
  settings: { sittingMinutes: number };
}
