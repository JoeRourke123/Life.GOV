/** Gazette — today's event + Hansard archive (DESIGN.md §11). Placeholder until M4. */
import { GovScreen, NotificationBanner, TaskList } from '@/components/gov';
import { mockGazette } from '@/data/mock';
import { type } from '@/theme';
import { Text } from 'react-native';

export default function GazetteScreen() {
  return (
    <GovScreen>
      <Text style={type.display}>The Gazette</Text>
      <NotificationBanner
        title="Today: leaked memo"
        body="A draft of your manifesto has been seen by the lobby. Deny, deflect, or double down."
        actionLabel="Choose a response"
        style={{ marginTop: 12 }}
      />
      <TaskList sections={mockGazette} />
    </GovScreen>
  );
}
