/**
 * Panel — thick 5px green border. Ceremony only: royal assent, election results (SYSTEM.md §3).
 * If you're tempted to use it for a streak, close the editor.
 */
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing, type } from '@/theme';

export function Panel({ title, children, style }: { title: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ borderWidth: 5, borderColor: colors.green, padding: 20 }, style]}>
      <Text style={[type.display, { color: colors.green, fontSize: 27, lineHeight: 31 }]}>{title}</Text>
      <View style={{ marginTop: 10 }}>
        {typeof children === 'string' ? <Text style={[type.body, { fontSize: 16, lineHeight: 23 }]}>{children}</Text> : children}
      </View>
    </View>
  );
}

export const panelSpacing = spacing.section;
