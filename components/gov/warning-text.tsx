/**
 * WarningText — 10px red left bar + red 19/800 title. Reserved for events that are genuinely
 * happening. If it's on screen, the situation is real (SYSTEM.md §3).
 */
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fontFamily, type } from '@/theme';

export function WarningText({ title, body, style }: { title: string; body?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ borderLeftWidth: 10, borderLeftColor: colors.red, paddingVertical: 4, paddingLeft: 16 }, style]}>
      <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 19, lineHeight: 24, color: colors.red }}>{title}</Text>
      {body ? <Text style={[type.body, { marginTop: 6 }]}>{body}</Text> : null}
    </View>
  );
}
