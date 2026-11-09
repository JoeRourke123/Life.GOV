/**
 * Agenda — the Order Paper (DESIGN.md §4/§11, mockups v4 screen 02).
 * Real state: bills grouped by tier, one-tap SIs, draft legislation, start sittings.
 */
import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button, ButtonRow, GovScreen, InsetText, Input, TaskList, type TaskItem, type TaskSection } from '@/components/gov';
import { useGame } from '@/state/store';
import { MINISTRY_IDS, type Bill, type BillStatus, type BillTier, type MinistryId } from '@/state/types';
import { colors, radius, spacing, type } from '@/theme';
import type { TagStatus } from '@/theme';

const MINISTRY_LABELS: Record<MinistryId, string> = {
  treasury: 'Treasury',
  home: 'Home',
  health: 'Health',
  education: 'Education',
  foreign: 'Foreign',
  business: 'Business',
  culture: 'Culture',
};

const TIER_LABELS: Record<BillTier, string> = { si: 'Statutory instrument', pmb: "Private Members' Bill", gov: 'Government Bill' };

const tagFor = (status: BillStatus): TagStatus =>
  status === 'assented'
    ? 'completed'
    : status === 'third'
      ? 'awaitingAssent'
      : status === 'proposed'
        ? 'notStarted'
        : status === 'failed' || status === 'abandoned'
          ? 'struck'
          : 'inProgress';

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        borderWidth: 2,
        borderColor: selected ? colors.black : colors.border,
        backgroundColor: selected ? colors.light : colors.white,
        borderRadius: radius.md,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Text style={[type.sub, { color: colors.black }]}>{label}</Text>
    </Pressable>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <View style={{ marginTop: spacing.row }}>
      <Text style={[type.sub, { color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.7 }]}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.gap, marginTop: 8, alignItems: 'center' }}>
        <Button title="−" variant="secondary" style={{ minWidth: 50 }} onPress={() => onChange(Math.max(min, value - 1))} />
        <Text style={[type.title, { flex: 1, textAlign: 'center' }]}>{value}</Text>
        <Button title="+" variant="secondary" style={{ minWidth: 50 }} onPress={() => onChange(Math.min(max, value + 1))} />
      </View>
    </View>
  );
}

export default function AgendaScreen() {
  const bills = useGame((s) => s.bills);
  const sitting = useGame((s) => s.sitting);
  const player = useGame((s) => s.player);
  const laySI = useGame((s) => s.laySI);
  const startSitting = useGame((s) => s.startSitting);
  const divide = useGame((s) => s.divide);
  const abandonBill = useGame((s) => s.abandonBill);
  const draftBill = useGame((s) => s.draftBill);

  const [title, setTitle] = useState('');
  const [tier, setTier] = useState<BillTier>('si');
  const [stars, setStars] = useState(1);
  const [clauses, setClauses] = useState(1);
  const [ministry, setMinistry] = useState<MinistryId>('home');

  const starRange = tier === 'si' ? [1, 2] : tier === 'pmb' ? [3, 3] : [4, 5];
  const clauseRange = tier === 'si' ? [1, 1] : tier === 'pmb' ? [1, 2] : [1, 12];
  const starsClamped = Math.min(Math.max(stars, starRange[0]), starRange[1]);
  const clausesClamped = Math.min(Math.max(clauses, clauseRange[0]), clauseRange[1]);

  const pickTier = (t: BillTier) => {
    setTier(t);
    const r = t === 'si' ? [1, 2] : t === 'pmb' ? [3, 3] : [4, 5];
    setStars((s) => Math.min(Math.max(s, r[0]), r[1]));
  };

  const submit = () => {
    const clean = title.trim();
    if (!clean) return;
    draftBill({ title: clean, tier, ministry, stars: starsClamped, clauses: clausesClamped });
    if (tier === 'si') {
      // One tap: laid before the House, instant reward (DESIGN.md §4).
      const fresh = useGame.getState().bills;
      const just = fresh[fresh.length - 1];
      if (just && just.tier === 'si' && just.status === 'proposed') laySI(just.id);
    }
    setTitle('');
  };

  const rowFor = (b: Bill): TaskItem => {
    const sittable = ['proposed', 'reading', 'committee'].includes(b.status) && b.clausesDone < b.clauses;
    const reward = `£${Math.round(10 * b.stars)} · ${Math.round(20 * b.stars)} XP`;
    const sub =
      b.tier === 'si'
        ? `${b.stars} star${b.stars === 1 ? '' : 's'} · ${reward} · ${MINISTRY_LABELS[b.ministry]}`
        : `${b.stars} stars · ${b.clausesDone}/${b.clauses} clauses · ${reward} · ${MINISTRY_LABELS[b.ministry]}`;
    const onPress = () => {
      if (b.tier === 'si' && b.status === 'proposed') return laySI(b.id);
      if (sittable) {
        startSitting(b.id);
        router.push('/sitting');
        return;
      }
      if (b.status === 'third') divide(b.id);
    };
    return {
      id: b.id,
      title: b.title,
      sub,
      status: tagFor(b.status),
      chevron: sittable || b.status === 'third' || (b.tier === 'si' && b.status === 'proposed'),
      onPress: sittable || b.status === 'third' || (b.tier === 'si' && b.status === 'proposed') ? onPress : undefined,
      danger: ['proposed', 'reading', 'committee', 'third'].includes(b.status) ? { label: 'Abandon', onPress: () => abandonBill(b.id) } : undefined,
    };
  };

  const sections: TaskSection[] = (
    [
      ['si', 'Statutory instruments'],
      ['pmb', "Private Members' Bills"],
      ['gov', 'Government Bills'],
    ] as [BillTier, string][]
  )
    .map(([t, heading]) => ({ heading, items: bills.filter((b) => b.tier === t).map(rowFor) }))
    .filter((s) => s.items.length > 0);

  const drafting = title.trim().length > 0;

  return (
    <GovScreen meta="Agenda">
      <Text style={type.display}>Order paper</Text>
      <Text style={[type.body, { color: colors.secondary, marginTop: 8 }]}>
        {sitting
          ? 'The House is sitting — one sitting completes one clause.'
          : `${bills.filter((b) => b.status !== 'assented' && b.status !== 'failed' && b.status !== 'abandoned').length} items on the paper.`}
      </Text>

      {sections.length === 0 ? (
        <InsetText style={{ marginTop: spacing.section }}>
          The Order Paper is empty. Draft legislation below, or wait for the clerks to table today’s instruments.
        </InsetText>
      ) : (
        <TaskList sections={sections} />
      )}

      <Text style={[type.section, { marginTop: spacing.section, marginBottom: 4, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: colors.black }]}>
        Draft legislation
      </Text>
      <Input label="Title" hint="e.g. Water the ferns" value={title} onChangeText={setTitle} placeholder="Title of the bill" />
      <View style={{ marginTop: spacing.row }}>
        <Text style={[type.sub, { color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.7 }]}>Tier</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {(['si', 'pmb', 'gov'] as BillTier[]).map((t) => (
            <Chip key={t} label={TIER_LABELS[t]} selected={tier === t} onPress={() => pickTier(t)} />
          ))}
        </View>
      </View>
      <Stepper label={`Stars (${starRange[0]}–${starRange[1]})`} value={starsClamped} min={starRange[0]} max={starRange[1]} onChange={setStars} />
      {tier !== 'si' ? (
        <Stepper label={`Clauses — one per sitting (${clauseRange[0]}–${clauseRange[1]})`} value={clausesClamped} min={clauseRange[0]} max={clauseRange[1]} onChange={setClauses} />
      ) : null}
      <View style={{ marginTop: spacing.row }}>
        <Text style={[type.sub, { color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.7 }]}>Ministry</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {MINISTRY_IDS.map((m) => (
            <Chip key={m} label={MINISTRY_LABELS[m]} selected={ministry === m} onPress={() => setMinistry(m)} />
          ))}
        </View>
      </View>
      <ButtonRow
        primary={{ title: tier === 'si' ? 'Lay before the House' : 'Draft the bill', onPress: drafting ? submit : undefined }}
        secondary={{ title: 'Clear', onPress: () => setTitle('') }}
      />
      <Text style={[type.small, { color: colors.secondary, marginTop: 8 }]}>
        {tier === 'si'
          ? `One tap lays it — instant reward (${starsClamped} star${starsClamped === 1 ? '' : 's'}).`
          : `${TIER_LABELS[tier]} · ${clausesClamped} clause${clausesClamped === 1 ? '' : 's'} = ${clausesClamped} sitting${clausesClamped === 1 ? '' : 's'}, then a division.`}
        {` Reward ≈ £${Math.round(10 * starsClamped)} · ${Math.round(20 * starsClamped)} XP (before streak and administration bonuses).`}
      </Text>
      <Text style={[type.small, { color: colors.secondary, marginTop: 4 }]}>
        Player: level {player.level} · £{player.currency} · approval {player.approval} · streak {player.streak}
      </Text>
    </GovScreen>
  );
}
