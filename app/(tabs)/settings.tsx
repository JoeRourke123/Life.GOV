/**
 * Settings — profile, save, reset (DESIGN.md §11). Placeholder until M6.
 * Hosts the debug menu: kitchen sink + mocked data pages.
 */
import { router } from 'expo-router';
import { GovScreen, InsetText, TaskList, type TaskSection } from '@/components/gov';
import { type } from '@/theme';
import { Text } from 'react-native';

const debugMenu: TaskSection[] = [
  {
    heading: 'Debug menu',
    items: [
      { id: 'dbg-ks', title: 'Kitchen sink', sub: 'Every gov/ component on one page', chevron: true, onPress: () => router.push('/debug/kitchen-sink') },
      { id: 'dbg-op', title: 'Mock order paper', sub: 'Bills by tier with tags', chevron: true, onPress: () => router.push('/debug/mock-order-paper') },
      { id: 'dbg-cab', title: 'Mock cabinet', sub: 'Seven ministers as summary rows', chevron: true, onPress: () => router.push('/debug/mock-cabinet') },
      { id: 'dbg-gaz', title: 'Mock gazette', sub: 'Event banner + Hansard', chevron: true, onPress: () => router.push('/debug/mock-gazette') },
      { id: 'dbg-tre', title: 'Mock treasury', sub: 'Fund, figure chart, ledger', chevron: true, onPress: () => router.push('/debug/mock-treasury') },
    ],
  },
];

export default function SettingsScreen() {
  return (
    <GovScreen>
      <Text style={type.display}>Settings</Text>
      <InsetText style={{ marginTop: 12 }}>
        The administration office is not yet open. The permanent secretary will look at it.
      </InsetText>
      <TaskList sections={debugMenu} />
    </GovScreen>
  );
}
