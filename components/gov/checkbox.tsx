/**
 * Checkbox — 27px, 2px black border, 3px radius. On: green fill + white check.
 * Standing orders are enactable law — the cost prints in the sub-line (SYSTEM.md §3).
 */
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, type } from '@/theme';

export function Checkbox({
  checked,
  onPress,
  label,
  sub,
}: {
  checked: boolean;
  onPress?: () => void;
  label: string;
  sub?: string;
}) {
  const box = (
    <View
      style={{
        width: 27,
        height: 27,
        borderWidth: 2,
        borderColor: checked ? colors.green : colors.black,
        borderRadius: radius.sm,
        backgroundColor: checked ? colors.green : colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
      }}
    >
      {checked ? (
        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
          <Path d="m5 12.5 4.5 4.5L19 7.5" />
        </Svg>
      ) : null}
    </View>
  );
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      {box}
      <View style={{ flex: 1 }}>
        <Text style={[type.title, { fontSize: 17 }]}>{label}</Text>
        {sub ? <Text style={[type.sub, { color: colors.secondary, marginTop: 3 }]}>{sub}</Text> : null}
      </View>
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      {body}
    </Pressable>
  );
}
