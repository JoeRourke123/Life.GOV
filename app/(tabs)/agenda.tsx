/** Agenda — the Order Paper (DESIGN.md §11). Placeholder until M3. */
import { GovScreen, InsetText, TaskList } from '@/components/gov';
import { mockOrderPaper } from '@/data/mock';
import { type } from '@/theme';
import { Text } from 'react-native';

export default function AgendaScreen() {
  return (
    <GovScreen>
      <Text style={type.display}>Order paper</Text>
      <InsetText style={{ marginTop: 12 }}>
        The Order Paper is being prepared by the clerks. The House moves on.
      </InsetText>
      <TaskList sections={mockOrderPaper} />
    </GovScreen>
  );
}
