/** Debug menu — entry list for the kitchen sink and mocked data pages. */
import { router } from 'expo-router';
import { GovScreen, TaskList, type TaskSection } from '@/components/gov';
import { type } from '@/theme';
import { Text } from 'react-native';

const pages: TaskSection[] = [
  {
    heading: 'Debug pages',
    items: [
      { id: 'ks', title: 'Kitchen sink', sub: 'All gov/ primitives, incl. event-mode toggle', chevron: true, onPress: () => router.push('/debug/kitchen-sink') },
      { id: 'op', title: 'Mock order paper', sub: 'SI / PMB / Government Bill tiers with tags', chevron: true, onPress: () => router.push('/debug/mock-order-paper') },
      { id: 'cab', title: 'Mock cabinet', sub: 'Ministers as SummaryList rows', chevron: true, onPress: () => router.push('/debug/mock-cabinet') },
      { id: 'gaz', title: 'Mock gazette', sub: 'NotificationBanner + Hansard TaskList', chevron: true, onPress: () => router.push('/debug/mock-gazette') },
      { id: 'tre', title: 'Mock treasury', sub: 'StatCards, Figure chart, ledger', chevron: true, onPress: () => router.push('/debug/mock-treasury') },
      { id: 'spike', title: 'Spike: state & persistence', sub: 'Issue #24 PoC — markdown save, migrations, day cycle, notifications', chevron: true, onPress: () => router.push('/debug/spike-state') },
    ],
  },
];

export default function DebugIndexScreen() {
  return (
    <GovScreen meta="Debug">
      <Text style={type.display}>Debug menu</Text>
      <TaskList sections={pages} />
    </GovScreen>
  );
}
