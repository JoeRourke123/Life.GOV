/**
 * Panel — thick 5px green border. Ceremony only: royal assent, election results (SYSTEM.md §3).
 * If you're tempted to use it for a streak, close the editor.
 * Body children are text (possibly with nested <Text> for bold spans).
 */
import type { ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fontFamily, type } from '@/theme';

export function Panel({ title, children, style }: { title: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ borderWidth: 5, borderColor: colors.green, padding: 20 }, style]}>
      <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 27, lineHeight: 31, color: colors.green }}>{title}</Text>
      <Text style={[type.body, { fontSize: 16, lineHeight: 23, marginTop: 10 }]}>{children}</Text>
    </View>
  );
}
