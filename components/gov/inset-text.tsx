/**
 * InsetText — 10px blue left bar, secondary text. The record: notices, rules, quotes from the whips.
 */
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, type } from '@/theme';

export function InsetText({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ borderLeftWidth: 10, borderLeftColor: colors.blue, paddingVertical: 4, paddingLeft: 16 }, style]}>
      {typeof children === 'string' ? <Text style={[type.body, { color: colors.secondary }]}>{children}</Text> : children}
    </View>
  );
}
