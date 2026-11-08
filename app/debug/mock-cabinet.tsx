/** Mock data page: the seven ministries as summary rows with level and bonus. */
import { GovScreen, SummaryList } from '@/components/gov';
import { mockCabinet } from '@/data/mock';
import { type } from '@/theme';
import { Text } from 'react-native';

export default function MockCabinetScreen() {
  return (
    <GovScreen meta="Debug · Mock data">
      <Text style={type.display}>Mock cabinet</Text>
      <SummaryList rows={mockCabinet} />
    </GovScreen>
  );
}
