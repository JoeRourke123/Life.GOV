/** Mock data page: fund stat cards, receipts/spending figure, and the ledger. */
import { Figure, GovScreen, StatCard, StatRow, SummaryList } from '@/components/gov';
import { mockLedger, mockPlayer, mockReceipts, mockSpending } from '@/data/mock';
import { colors, spacing, type } from '@/theme';
import { Text, View } from 'react-native';

export default function MockTreasuryScreen() {
  return (
    <GovScreen meta="Debug · Mock data">
      <Text style={type.display}>Mock treasury</Text>
      <View style={{ marginTop: 12 }}>
        <StatRow>
          <StatCard label="Fund" figure={`£${mockPlayer.currency}`} />
          <StatCard label="This week" figure="+£23" />
        </StatRow>
      </View>
      <View style={{ marginTop: spacing.section }}>
        <Figure caption="Receipts vs spending, £" figNumber={1} receipts={mockReceipts} spending={mockSpending} />
      </View>
      <Text style={[type.section, { marginTop: spacing.section, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: colors.black }]}>
        Ledger
      </Text>
      <SummaryList rows={mockLedger} />
    </GovScreen>
  );
}
