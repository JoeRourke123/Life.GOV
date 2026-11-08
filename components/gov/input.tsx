/**
 * Input — label 16/700 above, hint 14/400 secondary between label and field,
 * field 50px, 2px black border, 3px radius, 18/600 text (SYSTEM.md §3).
 */
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fontFamily, radius, type } from '@/theme';

export function Input({ label, hint, ...props }: { label: string; hint?: string } & TextInputProps) {
  return (
    <View>
      <Text style={{ fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 21, color: colors.black }}>{label}</Text>
      {hint ? <Text style={[type.body, { fontSize: 14, color: colors.secondary, marginTop: 4 }]}>{hint}</Text> : null}
      <TextInput
        placeholderTextColor={colors.secondary}
        style={{
          height: 50,
          borderWidth: 2,
          borderColor: colors.black,
          borderRadius: radius.sm,
          paddingHorizontal: 14,
          marginTop: 10,
          fontFamily: type.title.fontFamily,
          fontSize: 18,
          color: colors.black,
        }}
        {...props}
      />
    </View>
  );
}
