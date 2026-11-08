/**
 * Tag — state is a tag, one word, one glance (SYSTEM.md §3).
 * Completed green · In progress blue · Not started grey · Struck red · Awaiting assent yellow.
 */
import { Text, View, type ViewStyle } from 'react-native';
import { radius, spacing, tagStyles, type TagStatus, type as typeScale } from '@/theme';

export function Tag({ status, style }: { status: TagStatus; style?: ViewStyle }) {
  const s = tagStyles[status];
  return (
    <View style={[{ backgroundColor: s.backgroundColor, borderRadius: radius.md, paddingHorizontal: spacing.tag, paddingVertical: 4 }, style]}>
      <Text style={[typeScale.tag, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}
