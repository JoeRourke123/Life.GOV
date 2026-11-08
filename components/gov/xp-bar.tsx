/**
 * XPBar — 9px track, blue fill (SYSTEM.md §3).
 */
import { View } from 'react-native';
import { colors, radius } from '@/theme';

export function XPBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <View style={{ height: 9, backgroundColor: colors.light, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm }}>
      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: colors.blue, borderRadius: 2 }} />
    </View>
  );
}
