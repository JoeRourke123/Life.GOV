/** Mock data page: a gazette event banner plus the Hansard archive. */
import { GovScreen, NotificationBanner, TaskList } from '@/components/gov';
import { mockGazette } from '@/data/mock';
import { type } from '@/theme';
import { Text } from 'react-native';

export default function MockGazetteScreen() {
  return (
    <GovScreen meta="Debug · Mock data">
      <Text style={type.display}>Mock gazette</Text>
      <NotificationBanner
        title="Today: minister asleep in the chamber"
        body="The permanent secretary has been informed. The lobby will note it."
        actionLabel="Choose a response"
        style={{ marginTop: 12 }}
      />
      <TaskList sections={mockGazette} />
    </GovScreen>
  );
}
