/**
 * Meter — approval: 14px track, green (or red) fill, black marker at the value, AYES/NOES
 * figures above in bold. Never colour alone: figures always printed (SYSTEM.md §3/§5).
 */
import { Text, View } from 'react-native';
import { colors, fontFamily, radius, type } from '@/theme';

export function Meter({
  label = 'Approval',
  value,
  ayes,
  noes,
  red = false,
}: {
  label?: string;
  value: number; // 0–100
  ayes: number;
  noes: number;
  red?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <Text style={[type.meterLabel, { color: colors.secondary, textTransform: 'uppercase' }]}>{label}</Text>
        <Text style={[type.meterFigure, { fontFamily: fontFamily.monoSemibold }]}>
          AYES {ayes} · NOES {noes}
        </Text>
      </View>
      <View style={{ height: 14, backgroundColor: colors.light, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: `${pct}%`,
            backgroundColor: red ? colors.red : colors.green,
            borderRadius: 2,
          }}
        />
        <View style={{ position: 'absolute', top: -4, bottom: -4, left: `${pct}%`, width: 2, backgroundColor: colors.black, marginLeft: -1 }} />
      </View>
    </View>
  );
}
