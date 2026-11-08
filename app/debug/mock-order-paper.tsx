/** Mock data page: the order paper with mocked bills across all three tiers. */
import { GovScreen, TaskList } from '@/components/gov';
import { mockOrderPaper } from '@/data/mock';
import { type } from '@/theme';
import { Text } from 'react-native';

export default function MockOrderPaperScreen() {
  return (
    <GovScreen meta="Debug · Mock data">
      <Text style={type.display}>Mock order paper</Text>
      <TaskList sections={mockOrderPaper} />
    </GovScreen>
  );
}
