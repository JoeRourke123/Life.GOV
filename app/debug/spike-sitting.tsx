/** Spike PoC (issue #25): sittings timer survives backgrounding/force-quit; bill pipeline state machine. ADR-0005. */
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ButtonRow, GovScreen, Panel, Tag } from '@/components/gov';
import { isElapsed, remainingMs } from '@/state/sitting';
import { useGame } from '@/state/store';
import type { Bill, BillStatus } from '@/state/types';
import { colors, spacing, type } from '@/theme';
import type { TagStatus } from '@/theme';

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

function fmtClock(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function SpikeSittingScreen() {
  const hydrated = useGame((s) => s.hydrated);
  const sitting = useGame((s) => s.sitting);
  const bills = useGame((s) => s.bills);
  const player = useGame((s) => s.player);
  const sittingMinutes = useGame((s) => s.settings.sittingMinutes);
  const log = useGame((s) => s.log);
  const hydrate = useGame((s) => s.hydrate);
  const persistNow = useGame((s) => s.persistNow);
  const setSittingMinutes = useGame((s) => s.setSittingMinutes);
  const draftBill = useGame((s) => s.draftBill);
  const startSitting = useGame((s) => s.startSitting);
  const adjournSitting = useGame((s) => s.adjournSitting);
  const settleSitting = useGame((s) => s.settleSitting);
  const divide = useGame((s) => s.divide);
  const rewindSitting = useGame((s) => s.rewindSitting);

  const [, tick] = useState(0);
  useEffect(() => {
    if (!sitting) return;
    const t = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(t);
  }, [sitting]);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  const activeBill = sitting ? bills.find((b) => b.id === sitting.billId) : undefined;
  const nextBill = bills.find((b) => ['proposed', 'reading', 'committee'].includes(b.status) && b.clausesDone < b.clauses);
  const thirdBill = bills.find((b) => b.status === 'third');
  const remaining = sitting ? remainingMs(sitting) : 0;
  const elapsed = sitting ? isElapsed(sitting) : false;

  return (
    <GovScreen meta="Debug · Spike #25">
      <Text style={type.display}>Sittings & pipeline</Text>
      <Text style={[type.body, { marginTop: 8 }]}>
        Timestamp-based timer (ADR-0005): the sitting lives in <Text style={type.mono}>save.md</Text> as{' '}
        <Text style={type.mono}>startedAt/endsAt</Text>, so a force-quit loses nothing — remaining is computed from the wall
        clock on relaunch. expo-task-manager gives no background execution in Expo Go, so a background timer is not an
        option.
      </Text>

      <Panel title="The House" style={{ marginTop: spacing.section }}>
        {sitting && activeBill ? (
          <>
            <Text style={type.monoClock}>{fmtClock(remaining)}</Text>
            <Text style={[type.body, { marginTop: 4 }]}>
              Clause {sitting.clauseIndex + 1} of {activeBill.clauses} — {activeBill.title}
            </Text>
            <Text style={[type.sub, { color: colors.secondary, marginTop: 6 }]}>
              {elapsed ? 'Time is up — settle to pass the clause.' : 'The clock is running.'} started{' '}
              {new Date(sitting.startedAt).toLocaleTimeString()} · ends {new Date(sitting.endsAt).toLocaleTimeString()}
            </Text>
          </>
        ) : (
          <Text style={type.body}>The House is not sitting.</Text>
        )}
        <Text style={[type.sub, { color: colors.secondary, marginTop: 6 }]}>
          {player.name} · level {player.level} · {player.xp} XP · £{player.currency} · approval {player.approval} · streak{' '}
          {player.streak} · sitting length {sittingMinutes} min
        </Text>
      </Panel>

      <Panel title="Order paper" style={{ marginTop: spacing.section }}>
        {bills.length === 0 ? <Text style={type.small}>No bills — draft one below.</Text> : null}
        {bills.map((b: Bill) => (
          <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
            <Tag status={tagFor(b.status)} />
            <Text style={[type.body, { flex: 1 }]}>
              {b.title} · {b.clausesDone}/{b.clauses} clauses
            </Text>
          </View>
        ))}
      </Panel>

      <View style={{ marginTop: spacing.section, gap: 12 }}>
        <ButtonRow
          primary={{ title: 'Set sitting 1 min', onPress: () => setSittingMinutes(1) }}
          secondary={{
            title: 'Draft 4★ bill · 4 clauses',
            onPress: () => draftBill({ title: 'The Spike Bill', tier: 'gov', ministry: 'home', stars: 4, clauses: 4 }),
          }}
        />
        <ButtonRow
          primary={{ title: nextBill ? 'Start sitting' : 'Start sitting (draft first)', onPress: () => nextBill && startSitting(nextBill.id) }}
          secondary={{ title: 'Adjourn — suspend', onPress: adjournSitting }}
        />
        <ButtonRow
          primary={{ title: 'Force-quit sim: save + rehydrate', onPress: () => void persistNow().then(() => hydrate()).then(() => settleSitting()) }}
          secondary={{ title: 'Rewind 65s + settle', onPress: () => { rewindSitting(65); settleSitting(); } }}
        />
        <ButtonRow
          primary={{ title: thirdBill ? 'Divide — Royal Assent' : 'Divide (needs 3rd reading)', onPress: () => thirdBill && divide(thirdBill.id) }}
          secondary={{ title: 'Settle now', onPress: settleSitting }}
        />
      </View>

      <Panel title="Log" style={{ marginTop: spacing.section }}>
        {log.length === 0 ? <Text style={type.small}>Nothing yet.</Text> : null}
        {log.map((line, i) => (
          <Text key={`${i}-${line}`} style={[type.small, { fontFamily: type.mono.fontFamily }]}>
            {line}
          </Text>
        ))}
      </Panel>
    </GovScreen>
  );
}
