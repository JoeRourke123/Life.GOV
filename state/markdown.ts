/**
 * Markdown save codec — ADR-0004. The save is an open, human-readable markdown file
 * (`save.md`), not an opaque blob. Constrained dialect: YAML-ish frontmatter for
 * scalars, `#` sections, `- key: value` bullets, and pipe tables. Pipe characters in
 * free text are written as `¦` so tables never break.
 *
 * Pure module: only `import type`, so it can be unit-tested in plain node.
 */
import type { Bill, EventLogEntry, OrderInstance, SaveState } from './types';

export const SAVE_FORMAT = 'lifegov-save';

/** Escape a free-text cell for a pipe table. */
function cell(s: string): string {
  return s.replace(/\|/g, '¦');
}

function uncell(s: string): string {
  return s.trim().replace(/¦/g, '|');
}

export function parseFrontmatter(text: string): Record<string, string> {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return {};
  const out: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

function frontmatter(fields: Record<string, string | number>): string {
  const lines = Object.entries(fields).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

/** Split the body into `# Section` → lines. */
function sections(text: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let current = '';
  for (const line of text.split(/\r?\n/)) {
    const h = line.match(/^#\s+(.*)$/);
    if (h) {
      current = h[1].trim();
      out.set(current, []);
    } else if (current) {
      out.get(current)!.push(line);
    }
  }
  return out;
}

function bullets(lines: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of lines) {
    const b = line.match(/^-\s+([a-zA-Z]+):\s*(.*)$/);
    if (b) out.set(b[1], b[2]);
  }
  return out;
}

function table(lines: string[]): string[][] {
  return lines
    .filter((l) => l.trim().startsWith('|'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
    .filter((row) => row.length > 0 && !row.every((c) => /^-+$/.test(c)));
}

/** Serialize SaveState v1 to the markdown save file. */
export function serializeSave(s: SaveState): string {
  const parts: string[] = [
    frontmatter({
      format: SAVE_FORMAT,
      version: s.version,
      createdAt: s.createdAt,
      seed: s.seed,
      lastDailyReset: s.lastDailyReset,
    }),
    '# Player',
    '',
    `- name: ${s.player.name}`,
    `- title: ${s.player.title}`,
    `- level: ${s.player.level}`,
    `- xp: ${s.player.xp}`,
    `- currency: ${s.player.currency}`,
    `- approval: ${s.player.approval}`,
    `- streak: ${s.player.streak}`,
    `- bestStreak: ${s.player.bestStreak}`,
    `- administration: ${s.player.administration}`,
    '',
    '# Ministries',
    '',
    '| id | level | xp |',
    '| --- | --- | --- |',
    ...Object.entries(s.ministries).map(([id, m]) => `| ${id} | ${m.level} | ${m.xp} |`),
    '',
    '# Bills',
    '',
    '| id | title | tier | ministry | status | stars | clauses | clausesDone | createdAt |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...s.bills.map(
      (b: Bill) =>
        `| ${b.id} | ${cell(b.title)} | ${b.tier} | ${b.ministry} | ${b.status} | ${b.stars} | ${b.clauses} | ${b.clausesDone} | ${b.createdAt} |`,
    ),
    '',
    '# Orders',
    '',
    '| id | orderId | enactedAt | active |',
    '| --- | --- | --- | --- |',
    ...s.orders.map((o: OrderInstance) => `| ${o.id} | ${o.orderId} | ${o.enactedAt} | ${o.active} |`),
    '',
    '# Hansard',
    '',
    ...(s.gazette.length
      ? s.gazette.map((e: EventLogEntry) => `- ${e.at} · ${e.kind} · ${cell(e.title)} · ${cell(e.detail)}`)
      : ['- (the record is empty)']),
    '',
    '# Manifesto',
    '',
    ...(s.manifesto
      ? [
          `- electionDate: ${s.manifesto.electionDate}`,
          `- termLength: ${s.manifesto.termLength}`,
          `- pledges: ${s.manifesto.pledges.join(', ') || 'none'}`,
        ]
      : ['- none']),
    '',
    '# Stats',
    '',
    `- questsCompleted: ${s.stats.questsCompleted}`,
    `- eventsResolved: ${s.stats.eventsResolved}`,
    `- currencyEarned: ${s.stats.currencyEarned}`,
    `- electionsHeld: ${s.stats.electionsHeld}`,
    `- defeats: ${s.stats.defeats}`,
    '',
    '# Settings',
    '',
    `- sittingMinutes: ${s.settings.sittingMinutes}`,
    '',
  ];
  return parts.join('\n');
}

/** Parse a v1 markdown save file into SaveState. Throws on wrong format. */
export function parseSave(text: string): SaveState {
  const fm = parseFrontmatter(text);
  if (fm.format !== SAVE_FORMAT) throw new Error(`Not a ${SAVE_FORMAT} file`);
  const secs = sections(text);

  const player = bullets(secs.get('Player') ?? []);
  const ministries = {} as SaveState['ministries'];
  for (const row of table(secs.get('Ministries') ?? []).slice(1)) {
    ministries[row[0] as keyof SaveState['ministries']] = { level: Number(row[1]), xp: Number(row[2]) };
  }
  const bills: Bill[] = table(secs.get('Bills') ?? [])
    .slice(1)
    .map((r) => ({
      id: r[0],
      title: uncell(r[1]),
      tier: r[2] as Bill['tier'],
      ministry: r[3] as Bill['ministry'],
      status: r[4] as Bill['status'],
      stars: Number(r[5]),
      clauses: Number(r[6]),
      clausesDone: Number(r[7]),
      createdAt: r[8],
    }));
  const orders: OrderInstance[] = table(secs.get('Orders') ?? [])
    .slice(1)
    .map((r) => ({ id: r[0], orderId: r[1], enactedAt: r[2], active: r[3] === 'true' }));
  const gazette: EventLogEntry[] = (secs.get('Hansard') ?? [])
    .filter((l) => l.startsWith('- ') && !l.includes('(the record is empty)'))
    .map((l) => {
      const [at, kind, title, detail] = l.replace(/^- /, '').split(' · ');
      return { at, kind: kind as EventLogEntry['kind'], title: uncell(title ?? ''), detail: uncell(detail ?? '') };
    });
  const man = bullets(secs.get('Manifesto') ?? []);
  const stats = bullets(secs.get('Stats') ?? []);
  const settings = bullets(secs.get('Settings') ?? []);

  return {
    version: 1,
    createdAt: fm.createdAt ?? new Date().toISOString(),
    seed: Number(fm.seed ?? 0),
    player: {
      name: String(player.get('name') ?? 'Prime Minister'),
      title: String(player.get('title') ?? 'Prime Minister'),
      level: Number(player.get('level') ?? 1),
      xp: Number(player.get('xp') ?? 0),
      currency: Number(player.get('currency') ?? 0),
      approval: Number(player.get('approval') ?? 50),
      streak: Number(player.get('streak') ?? 0),
      bestStreak: Number(player.get('bestStreak') ?? 0),
      administration: Number(player.get('administration') ?? 1),
    },
    ministries,
    bills,
    manifesto:
      man.size === 0 || man.get('none') !== undefined
        ? null
        : {
            electionDate: String(man.get('electionDate') ?? ''),
            termLength: String(man.get('termLength') ?? ''),
            pledges: String(man.get('pledges') ?? 'none')
              .split(',')
              .map((p) => p.trim())
              .filter((p) => p && p !== 'none'),
          },
    orders,
    gazette,
    stats: {
      questsCompleted: Number(stats.get('questsCompleted') ?? 0),
      eventsResolved: Number(stats.get('eventsResolved') ?? 0),
      currencyEarned: Number(stats.get('currencyEarned') ?? 0),
      electionsHeld: Number(stats.get('electionsHeld') ?? 0),
      defeats: Number(stats.get('defeats') ?? 0),
    },
    lastDailyReset: fm.lastDailyReset ?? dayKeyLocal(),
    settings: { sittingMinutes: Number(settings.get('sittingMinutes') ?? 25) },
  };
}

function dayKeyLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${String(d.getDate()).padStart(2, '0')}`;
}
