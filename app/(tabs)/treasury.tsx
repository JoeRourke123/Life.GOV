/** HM Treasury — fund, shop, ledger (DESIGN.md §11). Placeholder until M5. */
import { Figure, GovScreen, InsetText, StatCard, StatRow, SummaryList } from '@/components/gov';
import { mockLedger, mockPlayer, mockReceipts, mockSpending } from '@/data/mock';
import { spacing, type } from '@/theme';
import { Text, View } from 'react-native';

export default function TreasuryScreen() {
  return (
    <GovScreen>
      <Text style={type.display}>HM Treasury</Text>
      <View style={{ marginTop: 12 }}>
        <StatRow>
          <StatCard label="Fund" figure={`£${mockPlayer.currency}`} />
          <StatCard label="This week" figure="+£23" />
        </StatRow>
      </View>
      <InsetText style={{ marginTop: spacing.section }}>
        Receipts against spending, last seven days. The hatched area is the deficit. The market is watching.
      </InsetText>
      <View style={{ marginTop: 12 }}>
        <Figure caption="Receipts vs spending, £" figNumber={1} receipts={mockReceipts} spending={mockSpending} />
      </View>
      <Text style={[type.section, { marginTop: spacing.section, marginBottom: 4, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: '#0b0c0c' }]}>
        Ledger
      </Text>
      <SummaryList rows={mockLedger} />
    </GovScreen>
  );
}
