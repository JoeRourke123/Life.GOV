/**
 * Kitchen sink — every gov/ component on one page, mirroring docs/design-system/kitchen-sink.html.
 * Includes an event-mode toggle to preview the red-dark header (SYSTEM.md §4).
 */
import { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  ButtonRow,
  Checkbox,
  Figure,
  GovScreen,
  InsetText,
  Input,
  Meter,
  NotificationBanner,
  Panel,
  PhaseBanner,
  StatCard,
  StatRow,
  SummaryList,
  Tag,
  TaskList,
  WarningText,
  XPBar,
  useEventMode,
  type TagStatus,
} from '@/components/gov';
import { mockOrderPaper, mockCabinet, mockPlayer, mockReceipts, mockSpending } from '@/data/mock';
import { colors, spacing, type } from '@/theme';

const allTags: TagStatus[] = ['completed', 'inProgress', 'notStarted', 'struck', 'awaitingAssent'];

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.section }}>
      <Text style={[type.section, { paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: colors.black }]}>{heading}</Text>
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}

export default function KitchenSinkScreen() {
  const [banner, setBanner] = useState(true);
  const [checked, setChecked] = useState(true);
  const { setEvent } = useEventMode();
  const [simulating, setSimulating] = useState(false);

  const toggleEvent = () => {
    const next = !simulating;
    setSimulating(next);
    setEvent(next ? 'Market event: gilt spiral' : null);
  };

  return (
    <GovScreen meta="Debug · Kitchen sink">
      <Text style={type.display}>Kitchen sink</Text>
      <Text style={[type.body, { color: colors.secondary, marginTop: 8 }]}>
        Every primitive in components/gov/, as specced in docs/design/SYSTEM.md §3.
      </Text>

      <Section heading="Header & event mode">
        <Checkbox label="Simulate market event" sub="Header crossfades to red-dark, meta reads the event name" checked={simulating} onPress={toggleEvent} />
        <View style={{ marginTop: 12 }}>
          <PhaseBanner />
        </View>
      </Section>

      <Section heading="Tags">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {allTags.map((s) => (
            <Tag key={s} status={s} />
          ))}
        </View>
      </Section>

      <Section heading="Buttons">
        <View style={{ gap: 12 }}>
          <Button title="Lay before the House" onPress={() => {}} />
          <Button title="Secondary action" variant="secondary" onPress={() => {}} />
          <Button title="Defy the whip" variant="warning" onPress={() => {}} />
          <ButtonRow primary={{ title: 'Content', onPress: () => {} }} secondary={{ title: 'Cancel', onPress: () => {} }} />
        </View>
      </Section>

      <Section heading="Panel (ceremony only — demo)">
        <Panel title="Royal Assent given">
          The Bill has received Royal Assent and is now an Act of your life. Recorded in Hansard.
        </Panel>
      </Section>

      <Section heading="Inset & warning">
        <InsetText>
          The House <Text style={{ fontWeight: '700' }}>notes</Text> the statement of the honourable member.
        </InsetText>
        <WarningText title="Market event: gilt spiral" body="Unfunded commitments have spooked the market. An emergency statement is required." />
      </Section>

      <Section heading="Notification banner">
        {banner ? (
          <NotificationBanner
            title="The Gazette: leaked memo"
            body="A draft manifesto has been seen by the lobby."
            actionLabel="Choose a response"
            onDismiss={() => setBanner(false)}
          />
        ) : (
          <InsetText>Dismissed. The record remembers.</InsetText>
        )}
      </Section>

      <Section heading="Task list">
        <TaskList sections={mockOrderPaper} />
      </Section>

      <Section heading="Summary list">
        <SummaryList rows={mockCabinet.slice(0, 4)} />
      </Section>

      <Section heading="Meters & stat cards">
        <Meter value={mockPlayer.approval} ayes={mockPlayer.approval} noes={100 - mockPlayer.approval} />
        <View style={{ marginTop: 10 }}>
          <XPBar value={mockPlayer.xp} max={mockPlayer.xpNext} />
        </View>
        <View style={{ marginTop: 12 }}>
          <StatRow>
            <StatCard label="Level" figure={String(mockPlayer.level)} />
            <StatCard label="Fund" figure={`£${mockPlayer.currency}`} />
            <StatCard label="Streak" figure={String(mockPlayer.streak)} />
          </StatRow>
        </View>
      </Section>

      <Section heading="Checkbox & input">
        <Checkbox label="Early Riser" sub="Enacted · £5 · upkeep £1/day · +10% XP before noon" checked={checked} onPress={() => setChecked(!checked)} />
        <View style={{ marginTop: 12 }}>
          <Input label="Name of administration" hint="As it will appear in Hansard" defaultValue="The Doe Administration" />
        </View>
      </Section>

      <Section heading="Figure">
        <Figure caption="Receipts vs spending, £" figNumber={1} receipts={mockReceipts} spending={mockSpending} />
      </Section>
    </GovScreen>
  );
}
