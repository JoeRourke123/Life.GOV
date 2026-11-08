/**
 * GovHeader — black bar: crown, LIFE.GOV wordmark (800), right meta.
 * Event mode: background red-dark, meta reads the event name (SYSTEM.md §3/§4).
 */
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type } from '@/theme';
import { CrownIcon } from './icons';
import { useEventMode } from './event-mode';

export function GovHeader({ meta }: { meta?: string }) {
  const insets = useSafeAreaInsets();
  const event = useEventMode();
  const backgroundColor = event.active ? colors.redDark : colors.black;
  return (
    <View style={{ backgroundColor, paddingTop: insets.top }}>
      <View
        style={{
          height: 56,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <CrownIcon />
        <Text style={[type.section, { color: colors.white, fontSize: 21, flex: 1 }]}>LIFE.GOV</Text>
        <Text style={[type.sub, { color: colors.white }]} numberOfLines={1}>
          {event.active && event.eventName ? event.eventName : (meta ?? 'Rt Hon J. Doe MP · Level 4')}
        </Text>
      </View>
    </View>
  );
}
