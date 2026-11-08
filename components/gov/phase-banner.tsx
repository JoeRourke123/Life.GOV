/**
 * PhaseBanner — light grey strip under the header. Left: term/day. Right: mini progress bar.
 * Every screen shows it (SYSTEM.md §3).
 */
import { Text, View } from 'react-native';
import { colors, fontFamily, spacing, type } from '@/theme';

export function PhaseBanner({
  parliament = 3,
  day = 9,
  of = 14,
  status,
}: {
  parliament?: number;
  day?: number;
  of?: number;
  status?: string;
}) {
  const progress = of > 0 ? Math.min(1, day / of) : 0;
  return (
    <View
      style={{
        backgroundColor: colors.light,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: spacing.screen,
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={[type.sub, { color: colors.secondary }]}>
        <Text style={{ color: colors.black, fontFamily: fontFamily.bold }}>Parliament {parliament}</Text>
        {`  ·  Day ${day} of ${of}`}
      </Text>
      {status ? (
        <Text style={[type.sub, { color: colors.secondary }]}>{status}</Text>
      ) : (
        <View style={{ width: 90, height: 8, backgroundColor: colors.miniTrack, borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: colors.green }} />
        </View>
      )}
    </View>
  );
}
