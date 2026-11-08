/** Orders — standing orders catalog (DESIGN.md §11). Placeholder until M4. */
import { useState } from 'react';
import { GovScreen, InsetText } from '@/components/gov';
import { Checkbox } from '@/components/gov/checkbox';
import { mockOrders } from '@/data/mock';
import { type } from '@/theme';
import { Text, View } from 'react-native';

export default function OrdersScreen() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockOrders.map((o) => [o.id, o.checked])),
  );
  return (
    <GovScreen>
      <Text style={type.display}>Standing orders</Text>
      <InsetText style={{ marginTop: 12 }}>
        Ticking is legislating. Costs are printed in the sub-line and charged at midnight.
      </InsetText>
      <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#b1b4b6' }}>
        {mockOrders.map((o) => (
          <Checkbox
            key={o.id}
            label={o.label}
            sub={o.sub}
            checked={checked[o.id]}
            onPress={() => setChecked((c) => ({ ...c, [o.id]: !c[o.id] }))}
          />
        ))}
      </View>
    </GovScreen>
  );
}
