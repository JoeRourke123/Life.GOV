/**
 * NotificationBanner — 5px blue border. Gazette stories arrive in these, with an underlined
 * action link. Dismissible; never stacked more than one (SYSTEM.md §3).
 */
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, type } from '@/theme';

export function NotificationBanner({
  title,
  body,
  actionLabel,
  onAction,
  onDismiss,
  style,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ borderWidth: 5, borderColor: colors.blue, padding: 14, paddingLeft: 16 }, style]}>
      <Text style={[type.title, { color: colors.blue }]}>{title}</Text>
      {body ? <Text style={[type.body, { fontSize: 15, lineHeight: 22, marginTop: 6 }]}>{body}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 18, marginTop: 8 }}>
        {actionLabel ? (
          <Pressable accessibilityRole="link" onPress={onAction} hitSlop={8}>
            <Text style={[type.body, { color: colors.blue, fontWeight: '700', textDecorationLine: 'underline' }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notification" onPress={onDismiss} hitSlop={8}>
            <Text style={[type.body, { color: colors.blue, fontWeight: '700', textDecorationLine: 'underline' }]}>Dismiss</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
