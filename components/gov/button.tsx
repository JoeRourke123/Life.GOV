/**
 * Button — full-width, 50px min-height, hard 2px shadow that collapses on press (SYSTEM.md §3/§4).
 * One primary per view; secondary and warning variants below.
 */
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { buttonShadow, colors, radius, shadowStyle, spacing, type } from '@/theme';

type Variant = keyof typeof buttonShadow;

export function Button({
  title,
  variant = 'primary',
  onPress,
  disabled,
  style,
}: {
  title: string;
  variant?: Variant;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = buttonShadow[variant];
  const textColor = variant === 'secondary' ? colors.black : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: v.backgroundColor,
          borderRadius: radius.md,
          minHeight: 50,
          paddingHorizontal: 18,
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed ? 2 : 0 }],
          ...(pressed ? {} : shadowStyle(v.shadowColor)),
        },
        style,
      ]}
    >
      <Text style={[type.button, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

/** Primary + secondary side by side, 12px gap (SYSTEM.md §3). */
export function ButtonRow({
  primary,
  secondary,
}: {
  primary: { title: string; onPress?: () => void };
  secondary: { title: string; onPress?: () => void };
}) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.gap }}>
      <Button title={primary.title} onPress={primary.onPress} style={{ flex: 1 }} />
      <Button title={secondary.title} variant="secondary" onPress={secondary.onPress} style={{ flex: 1 }} />
    </View>
  );
}
