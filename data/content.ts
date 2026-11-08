/**
 * Real content catalog — seeded daily/weekly content and Gazette events (DESIGN.md §4/§9).
 * Deadpan civil-service copy per docs/design/PRINCIPLES.md. M4 (#11) expands the Gazette
 * events with choices; here they are title + detail only.
 */
import type { MinistryId } from '@/state/types';

export interface SIContent {
  title: string;
  stars: 1 | 2;
  ministry: MinistryId;
}

/** Daily statutory instruments — small everyday tasks, 1–2 stars (DESIGN.md §4). */
export const SI_POOL: SIContent[] = [
  { title: 'Clear the inbox', stars: 1, ministry: 'home' },
  { title: 'File the paperwork', stars: 2, ministry: 'home' },
  { title: 'Pay the bill', stars: 2, ministry: 'treasury' },
  { title: 'Book the appointment', stars: 2, ministry: 'health' },
  { title: 'Reply to the letter', stars: 1, ministry: 'foreign' },
  { title: 'Water the plants', stars: 1, ministry: 'home' },
  { title: 'Tidy the kitchen', stars: 1, ministry: 'home' },
  { title: 'Stretch for five minutes', stars: 1, ministry: 'health' },
  { title: 'Read ten pages', stars: 1, ministry: 'culture' },
  { title: 'Message an old friend', stars: 1, ministry: 'foreign' },
  { title: 'Update the budget spreadsheet', stars: 2, ministry: 'treasury' },
  { title: 'Plan tomorrow’s agenda', stars: 1, ministry: 'business' },
  { title: 'Do the washing up', stars: 1, ministry: 'home' },
  { title: 'Twenty minutes of learning', stars: 2, ministry: 'education' },
  { title: 'Walk without your phone', stars: 1, ministry: 'health' },
  { title: 'Review one work project', stars: 2, ministry: 'business' },
];

export interface WeeklyContent {
  title: string;
  tier: 'pmb' | 'gov';
  stars: number;
  ministry: MinistryId;
  clauses: number;
}

/** Weekly Private Members' Bills / bigger items (DESIGN.md §4). */
export const WEEKLY_POOL: WeeklyContent[] = [
  { title: 'Reorganise the filing system', tier: 'pmb', stars: 3, ministry: 'home', clauses: 2 },
  { title: 'A course, start to finish', tier: 'pmb', stars: 4, ministry: 'education', clauses: 2 },
  { title: 'Reconcile the budget', tier: 'pmb', stars: 3, ministry: 'treasury', clauses: 2 },
  { title: 'A difficult conversation', tier: 'pmb', stars: 4, ministry: 'foreign', clauses: 2 },
  { title: 'Fix the thing that’s been broken for months', tier: 'pmb', stars: 3, ministry: 'home', clauses: 2 },
  { title: 'Ship the work project', tier: 'gov', stars: 5, ministry: 'business', clauses: 3 },
  { title: 'Get fit properly', tier: 'gov', stars: 4, ministry: 'health', clauses: 3 },
  { title: 'Save a lump sum', tier: 'pmb', stars: 3, ministry: 'treasury', clauses: 2 },
  { title: 'Learn the thing you keep saying you’ll learn', tier: 'gov', stars: 5, ministry: 'education', clauses: 3 },
  { title: 'Repair a relationship', tier: 'gov', stars: 4, ministry: 'foreign', clauses: 3 },
  { title: 'Organise the loft', tier: 'pmb', stars: 3, ministry: 'home', clauses: 2 },
  { title: 'Present at the team meeting', tier: 'pmb', stars: 3, ministry: 'business', clauses: 2 },
];

export interface GazetteContent {
  title: string;
  detail: string;
}

/** The Gazette — events & scandals (DESIGN.md §9). Choices land with M4. */
export const GAZETTE_POOL: GazetteContent[] = [
  { title: 'Minister asleep in the chamber', detail: 'The permanent secretary has been informed.' },
  { title: 'Leaked memo', detail: 'The lobby will note it.' },
  { title: 'Despatch-box gaffe', detail: 'Hansard records the exchange.' },
  { title: 'Select committee grilling', detail: 'The permanent secretary will look into it.' },
  { title: 'By-election jitters', detail: 'The whips are counting noses.' },
  { title: 'Delayed in committee', detail: '“I’ll have the permanent secretary look at it, Prime Minister.”' },
  { title: 'Briefing against the briefing', detail: 'Someone is briefing against someone.' },
  { title: 'A minister’s resignation, declined', detail: 'For now.' },
  { title: 'The diary leak', detail: 'Your movements are in the press.' },
  { title: 'An urgent question, unurgent', detail: 'The Speaker sighs.' },
  { title: 'Photo opportunity backfires', detail: 'The prop was not load-bearing.' },
  { title: 'A spelling error in a white paper', detail: 'Corrected by statutory instrument.' },
];
