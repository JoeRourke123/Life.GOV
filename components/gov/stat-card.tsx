/**
 * StatCard — light bg, centred: caps label + big figure. Only ever in rows of 2–4 (SYSTEM.md §3).
 */
import { Text, View } from 'react-native';
import { colors, radius, type } from '@/theme';

export function StatCard({ label, figure }: { label: string; figure: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.light, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center' }}>
      <Text style={[type.statLabel, { color: colors.secondary, textTransform: 'uppercase' }]} numberOfLines={1}>{label}</Text>
      <Text style={[type.statFigure, { marginTop: 4 }]} numberOfLines={1}>{figure}</Text>
    </View>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 10 }}>{children}</View>;
}
