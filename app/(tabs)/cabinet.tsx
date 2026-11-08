/** Cabinet — the seven ministers (DESIGN.md §11). Placeholder until M4. */
import { GovScreen, InsetText, SummaryList } from '@/components/gov';
import { mockCabinet } from '@/data/mock';
import { type } from '@/theme';
import { Text } from 'react-native';

export default function CabinetScreen() {
  return (
    <GovScreen>
      <Text style={type.display}>Cabinet</Text>
      <InsetText style={{ marginTop: 12 }}>Your ministers await instruction, Prime Minister.</InsetText>
      <SummaryList rows={mockCabinet} />
    </GovScreen>
  );
}
