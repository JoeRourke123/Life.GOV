/**
 * Mocked data for the debug menu pages and placeholder screens.
 * Deadpan civil-service copy throughout (docs/design/PRINCIPLES.md).
 * Not the save model — DESIGN.md §12 lands with M2.
 */
import type { TaskSection } from '@/components/gov/task-list';
import type { SummaryRow } from '@/components/gov/summary-list';

export const mockPlayer = {
  name: 'Rt Hon J. Doe MP',
  level: 4,
  xp: 340,
  xpNext: 500,
  currency: 128,
  approval: 62,
  streak: 9,
  parliament: 3,
  day: 9,
  daysTotal: 14,
};

export const mockTodayBusiness: TaskSection[] = [
  {
    heading: "Today's business",
    items: [
      { id: 'si-1', title: 'Water the ferns', sub: 'Statutory instrument · 1 star · £4 · 10 XP', status: 'inProgress' },
      { id: 'si-2', title: 'File the 2019 receipts', sub: 'Statutory instrument · 2 stars · £8 · 20 XP', status: 'notStarted' },
      { id: 'si-3', title: 'Renew passport', sub: 'Statutory instrument · 2 stars · £15 · 25 XP', status: 'completed' },
    ],
  },
];

export const mockOrderPaper: TaskSection[] = [
  {
    heading: 'Statutory instruments',
    items: [
      { id: 'si-1', title: 'Water the ferns', sub: '1 star · £4 · 10 XP', status: 'inProgress' },
      { id: 'si-2', title: 'File the 2019 receipts', sub: '2 stars · £8 · 20 XP', status: 'notStarted' },
      { id: 'si-4', title: 'Book dentist', sub: '1 star · £6 · 15 XP', status: 'struck' },
    ],
  },
  {
    heading: "Private Members' Bills",
    items: [
      { id: 'pmb-1', title: 'Sort the loft', sub: '3 stars · 2 sittings · £30 · 90 XP', status: 'inProgress', chevron: true },
      { id: 'pmb-2', title: 'Learn basic Italian', sub: '3 stars · 3 sittings · £20 · 80 XP', status: 'notStarted', chevron: true },
    ],
  },
  {
    heading: 'Government Bills',
    items: [
      { id: 'gb-1', title: 'Run a marathon', sub: '5 stars · 8 clauses · £120 · 400 XP · Ministry of Health', status: 'inProgress', chevron: true },
      { id: 'gb-2', title: 'Manifesto pledge: fix the boiler', sub: '4 stars · 4 clauses · £60 · 200 XP · Ministry of the Home', status: 'awaitingAssent', chevron: true },
    ],
  },
];

export const mockCabinet: SummaryRow[] = [
  { key: 'Chancellor', value: 'Level 3', sub: '+2% rewards on Treasury quests', actionLabel: 'View' },
  { key: 'Home Secretary', value: 'Level 5', sub: '+4% rewards on Home quests', actionLabel: 'View' },
  { key: 'Health Secretary', value: 'Level 4', sub: '+2% rewards on Health quests', actionLabel: 'View' },
  { key: 'Education Secretary', value: 'Level 2', sub: '+0% rewards on Learning quests', actionLabel: 'View' },
  { key: 'Foreign Secretary', value: 'Level 3', sub: '+2% rewards on Social quests', actionLabel: 'View' },
  { key: 'Business Secretary', value: 'Level 6', sub: '+5% rewards on Career quests', actionLabel: 'View' },
  { key: 'Culture Secretary', value: 'Level 1', sub: '+0% rewards on Culture quests', actionLabel: 'View' },
];

export const mockOrders: { id: string; label: string; sub: string; checked: boolean }[] = [
  { id: 'so-1', label: 'Early Riser', sub: 'Enacted · £5 · upkeep £1/day · +10% XP before noon', checked: true },
  { id: 'so-2', label: 'No Zero Days', sub: 'Enacted · £12 · upkeep £2/day · approval floor 40', checked: true },
  { id: 'so-3', label: 'Austerity', sub: 'Not enacted · £0 · +25% £ from quests, approval gain halved', checked: false },
  { id: 'so-4', label: 'Open Government', sub: 'Not enacted · £8 · upkeep £5/day · +approval from events', checked: false },
];

export const mockGazette: TaskSection[] = [
  {
    heading: 'Hansard — the record',
    items: [
      { id: 'h-1', title: 'Renew passport — assented', sub: '£15 paid · 25 XP · recorded at midnight', status: 'completed' },
      { id: 'h-2', title: 'Book dentist — struck at midnight', sub: 'Recorded in Hansard. No penalty beyond the record.', status: 'struck' },
      { id: 'h-3', title: 'PMQs answered well', sub: 'Bonus £20 · +3 approval · Wednesday 12:00', status: 'completed' },
      { id: 'h-4', title: 'Select committee grilling', sub: 'The permanent secretary will look at it, Prime Minister.', status: 'inProgress' },
    ],
  },
];

export const mockLedger: SummaryRow[] = [
  { key: 'Today', value: '+£15', sub: 'Passport renewed — statutory instrument' },
  { key: 'Today', value: '-£12', sub: 'Standing order upkeep — Early Riser, No Zero Days' },
  { key: 'Yesterday', value: '+£20', sub: 'PMQs — answered well' },
  { key: 'Yesterday', value: '-£8', sub: 'Groceries — HM Treasury disburses' },
  { key: 'Monday', value: '+£30', sub: 'Private Members\' Bill — first sitting' },
];

export const mockReceipts = [40, 55, 48, 70, 62, 80, 74];
export const mockSpending = [35, 60, 52, 66, 78, 72, 90];
