/**
 * Sitting — the live session (DESIGN.md §4/§11, mockups v4 screen 03, ADR-0005).
 * The clock is wall-clock: `remainingMs(sitting)` from the persisted startedAt/endsAt,
 * so it is correct after backgrounding or a force-quit; settle runs on focus/foreground.
 * One sitting completes one clause and pays one slice of the reward ("£10 · 20 XP").
 */
import { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, GovScreen, InsetText, StatCard, TaskList, type TaskSection } from '@/components/gov';
import { isElapsed, remainingMs } from '@/state/sitting';
import { useGame } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const STAGE_LABEL: Record<string, string> = {
  proposed: 'Proposed',
  reading: 'First reading',
  committee: 'Committee',
  third: 'Third reading',
  assented: 'Royal Assent',
  failed: 'Struck off',
  abandoned: 'Abandoned',
};

export default function SittingScreen() {
  const sitting = useGame((s) => s.sitting);
  const bills = useGame((s) => s.bills);
  const gazette = useGame((s) => s.gazette);
  const sittingMinutes = useGame((s) => s.settings.sittingMinutes);
  const log = useGame((s) => s.log);
  const settleSitting = useGame((s) => s.settleSitting);
  const adjournSitting = useGame((s) => s.adjournSitting);
  const divide = useGame((s) => s.divide);
  const setSittingMinutes = useGame((s) => s.setSittingMinutes);

  // Settle on focus — an elapsed-while-away sitting passes the clause on open.
  useFocusEffect(useCallback(() => settleSitting(), [settleSitting]));

  const [, tick] = useState(0);
  useEffect(() => {
    if (!sitting) return;
    const t = setInterval(() => {
      tick((n) => n + 1);
      if (isElapsed(sitting)) settleSitting();
    }, 250);
    return () => clearInterval(t);
  }, [sitting, settleSitting]);

  const bill = sitting ? bills.find((b) => b.id === sitting.billId) : undefined;
  const thirdBill = bills.find((b) => b.status === 'third');

  const clauses: TaskSection[] = bill
    ? [
        {
          heading: 'Before the committee',
          items: Array.from({ length: bill.clauses }, (_, i) => {
            const n = i + 1;
            const passed = i < bill.clausesDone;
            const inDebate = sitting !== null && i === sitting.clauseIndex;
            const passedEntry = gazette.find((e) => e.title === `Clause ${n} of “${bill.title}” passed`);
            const passedAt = passedEntry ? new Date(passedEntry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
            return {
              id: `${bill.id}-c${n}`,
              title: `Clause ${n}`,
              sub: passed ? `Passed at ${passedAt ?? ''}`.trim() : inDebate ? 'Under debate now' : 'Not yet called',
              status: passed ? ('completed' as const) : inDebate ? ('inProgress' as const) : ('notStarted' as const),
            };
          }),
        },
      ]
    : [];

  const totalMs = sittingMinutes * 60_000;
  const remaining = sitting ? remainingMs(sitting) : 0;
  const progress = bill && bill.clauses > 0 ? bill.clausesDone / bill.clauses : 0;

  return (
    <GovScreen meta="Sitting">
      {sitting && bill ? (
        <>
          <Text style={type.display}>{bill.title}</Text>
          <Text style={[type.body, { color: colors.secondary, marginTop: 8 }]}>
            {STAGE_LABEL[bill.status] ?? bill.status} stage — clause {sitting.clauseIndex + 1} of {bill.clauses}. The clock is
            running.
          </Text>

          <View style={{ marginTop: spacing.section, flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                flex: 2.2,
                backgroundColor: colors.light,
                borderRadius: radius.md,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={type.monoClock}>{fmtClock(remaining)}</Text>
              <Text style={[type.statLabel, { color: colors.secondary, marginTop: 4 }]}>of {fmtClock(totalMs)}</Text>
            </View>
            <StatCard label="Clauses passed" figure={`${bill.clausesDone}`} />
            <StatCard label="Remaining" figure={`${bill.clauses - bill.clausesDone}`} />
          </View>

          <View style={{ marginTop: spacing.section }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={[type.meterLabel, { color: colors.secondary, textTransform: 'uppercase' }]}>Progress</Text>
              <Text style={[type.meterFigure, { fontFamily: 'PlexMono-600' }]}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={{ height: 14, backgroundColor: colors.light, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm }}>
              <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: colors.green, borderRadius: 2 }} />
            </View>
          </View>

          <TaskList sections={clauses} />

          <InsetText style={{ marginTop: spacing.section }}>
            Adjourn at any time: the clause stays in committee, nothing is lost, and the record simply notes the hour.
          </InsetText>

          <Button
            title="Adjourn — end sitting"
            variant="warning"
            style={{ marginTop: spacing.section }}
            onPress={() => {
              adjournSitting();
              router.back();
            }}
          />
        </>
      ) : thirdBill ? (
        <>
          <Text style={type.display}>{thirdBill.title}</Text>
          <Text style={[type.body, { color: colors.secondary, marginTop: 8 }]}>
            All {thirdBill.clauses} clauses passed — the bill is at third reading and awaits the division.
          </Text>
          <Button
            title="Divide — Royal Assent"
            style={{ marginTop: spacing.section }}
            onPress={() => {
              divide(thirdBill.id);
              router.back();
            }}
          />
        </>
      ) : (
        <>
          <Text style={type.display}>The House is not sitting</Text>
          <InsetText style={{ marginTop: spacing.section }}>
            Start a sitting from the Order paper. The sitting is timed — default {sittingMinutes} min — and one sitting
            completes one clause of the bill.
          </InsetText>
          <Text style={[type.sub, { color: colors.secondary, marginTop: spacing.section }]}>Sitting length</Text>
          <View style={{ flexDirection: 'row', gap: spacing.gap, marginTop: 8 }}>
            <Button
              title="− 5 min"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => setSittingMinutes(Math.max(1, sittingMinutes - 5))}
            />
            <Button
              title="+ 5 min"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => setSittingMinutes(Math.min(120, sittingMinutes + 5))}
            />
          </View>
        </>
      )}

      {log.length > 0 ? (
        <View style={{ marginTop: spacing.section }}>
          <Text style={[type.sub, { color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.7 }]}>The record</Text>
          {log.slice(0, 6).map((line, i) => (
            <Text key={`${i}-${line}`} style={[type.small, { fontFamily: type.mono.fontFamily, marginTop: 4 }]}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
    </GovScreen>
  );
}
