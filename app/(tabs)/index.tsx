/**
 * No. 10 — the dashboard (DESIGN.md §11). M1 layout with mocked figures:
 * approval meter, stat row, today's business, gazette banner, election notice.
 */
import { useState } from 'react';
import { Text, View } from 'react-native';
import { GovScreen, InsetText, Meter, NotificationBanner, StatCard, StatRow, TaskList, XPBar } from '@/components/gov';
import { mockPlayer, mockTodayBusiness } from '@/data/mock';
import { spacing, type } from '@/theme';

export default function No10Screen() {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const p = mockPlayer;
  return (
    <GovScreen>
      <Text style={[type.display, { marginBottom: 4 }]}>No. 10</Text>
      <Text style={[type.body, { color: '#505a5f', marginBottom: spacing.section }]}>The dashboard. The House is sitting.</Text>

      <Meter value={p.approval} ayes={p.approval} noes={100 - p.approval} />

      <View style={{ marginTop: spacing.section }}>
        <StatRow>
          <StatCard label="Level" figure={String(p.level)} />
          <StatCard label="Fund" figure={`£${p.currency}`} />
          <StatCard label="Streak" figure={String(p.streak)} />
        </StatRow>
      </View>

      <View style={{ marginTop: 10 }}>
        <XPBar value={p.xp} max={p.xpNext} />
        <Text style={[type.sub, { color: '#505a5f', marginTop: 4 }]}>
          {p.xp} / {p.xpNext} XP to level {p.level + 1}
        </Text>
      </View>

      {!bannerDismissed ? (
        <NotificationBanner
          title="The Gazette: minister asleep in the chamber"
          body="The lobby will note it. Choose a response in the Gazette."
          actionLabel="Read the Gazette"
          onDismiss={() => setBannerDismissed(true)}
          style={{ marginTop: spacing.section }}
        />
      ) : null}

      <TaskList sections={mockTodayBusiness} />

      <InsetText style={{ marginTop: spacing.section }}>
        Election in {p.daysTotal - p.day} days. The writ will be dropped at midnight.{' '}
        <Text style={{ fontWeight: '700' }}>No pressure, Prime Minister.</Text>
      </InsetText>
    </GovScreen>
  );
}
