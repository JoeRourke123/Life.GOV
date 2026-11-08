/** Spike PoC (issue #24): state & persistence — markdown save file, migration chain, day cycle, local notifications. */
import { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import { ButtonRow, GovScreen, Panel } from '@/components/gov';
import { useGame } from '@/state/store';
import { colors, spacing, type } from '@/theme';

export default function SpikeStateScreen() {
  const hydrated = useGame((s) => s.hydrated);
  const lastMigration = useGame((s) => s.lastMigration);
  const player = useGame((s) => s.player);
  const billCount = useGame((s) => s.bills.length);
  const gazetteCount = useGame((s) => s.gazette.length);
  const lastDailyReset = useGame((s) => s.lastDailyReset);
  const log = useGame((s) => s.log);
  const hydrate = useGame((s) => s.hydrate);
  const persistNow = useGame((s) => s.persistNow);
  const plantFakeV0 = useGame((s) => s.plantFakeV0);
  const rollDayNow = useGame((s) => s.rollDayNow);
  const bumpXp = useGame((s) => s.bumpXp);
  const scheduleTestNotification = useGame((s) => s.scheduleTestNotification);
  const exportSave = useGame((s) => s.exportSave);
  const importSave = useGame((s) => s.importSave);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  const web = Platform.OS === 'web';

  return (
    <GovScreen meta="Debug · Spike #24">
      <Text style={type.display}>State & persistence</Text>
      <Text style={[type.body, { marginTop: 8 }]}>
        The save is an open markdown file, <Text style={type.mono}>lifegov/save.md</Text>. Kill the app, reopen — state
        restores. {lastMigration ? `Last migration: ${lastMigration}.` : 'No migration needed on last load.'}
      </Text>

      <Panel title="State" style={{ marginTop: spacing.section }}>
        <Text style={type.body}>
          {player.name} · level {player.level} · {player.xp} XP · £{player.currency} · approval {player.approval} · streak{' '}
          {player.streak}
        </Text>
        <Text style={[type.sub, { color: colors.secondary, marginTop: 6 }]}>
          Bills: {billCount} · Hansard entries: {gazetteCount} · last daily reset: {lastDailyReset}
        </Text>
      </Panel>

      <View style={{ marginTop: spacing.section, gap: 12 }}>
        <ButtonRow
          primary={{ title: 'Hydrate from file', onPress: () => void hydrate() }}
          secondary={{ title: 'Save now', onPress: () => void persistNow() }}
        />
        <ButtonRow
          primary={{ title: 'Plant fake v0 + migrate', onPress: () => void plantFakeV0() }}
          secondary={{ title: 'Roll day now', onPress: rollDayNow }}
        />
        <ButtonRow
          primary={{ title: 'Bump +10 XP', onPress: () => bumpXp(10) }}
          secondary={{ title: 'Test notification (60s)', onPress: () => void scheduleTestNotification(60), }}
        />
        <ButtonRow
          primary={{ title: 'Export save (share sheet)', onPress: () => void exportSave() }}
          secondary={{ title: 'Import save (picker)', onPress: () => void importSave() }}
        />
      </View>
      {web ? (
        <Text style={[type.small, { color: colors.secondary, marginTop: 12 }]}>
          Web build: file save uses localStorage, export downloads the .md; the document picker and notifications are
          native-only (Expo Go).
        </Text>
      ) : null}

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
