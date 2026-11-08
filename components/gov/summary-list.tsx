/**
 * SummaryList — key/value rows with hairlines. Cabinet, consequences, resolutions, envelopes.
 * Key 14/600 secondary in a 130px column; value 16.5/600 with 13px sub; action link right (SYSTEM.md §3).
 */
import { Pressable, Text, View } from 'react-native';
import { colors, type } from '@/theme';

export interface SummaryRow {
  key: string;
  value: string;
  sub?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SummaryList({ rows }: { rows: SummaryRow[] }) {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
      {rows.map((row) => (
        <View
          key={row.key}
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <Text style={[type.body, { width: 130, flexShrink: 0, fontSize: 14, fontWeight: '600', color: colors.secondary, lineHeight: 19 }]}>
            {row.key}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={type.title}>{row.value}</Text>
            {row.sub ? <Text style={[type.sub, { color: colors.secondary, marginTop: 2 }]}>{row.sub}</Text> : null}
          </View>
          {row.actionLabel ? (
            <Pressable accessibilityRole="link" onPress={row.onAction} hitSlop={8}>
              <Text style={[type.body, { color: colors.blue, fontWeight: '700', textDecorationLine: 'underline' }]}>{row.actionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}
