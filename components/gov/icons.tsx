/**
 * Line icons — 19px, 1.5 stroke (docs/design/SYSTEM.md §3 TabBar).
 * Drawn with react-native-svg; no emoji, no icon font.
 */
import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme';

type IconProps = { color?: ColorValue; size?: number };

function base({ color = colors.secondary, size = 19 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color as string,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

/** Crown crest for the header wordmark. */
export function CrownIcon({ color = colors.white, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M3 17.5 4.6 8l4.4 4L12 5l3 7 4.4-4L21 17.5H3Z" />
      <Rect x="3" y="19" width="18" height="1.6" rx="0.8" />
    </Svg>
  );
}

export function No10Icon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Path d="M4 18 5.4 9.5l4 3.4L12 7l2.6 5.9 4-3.4L20 18H4Z" />
      <Line x1="4" y1="20.5" x2="20" y2="20.5" />
    </Svg>
  );
}

export function AgendaIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <Line x1="8.5" y1="8" x2="15.5" y2="8" />
      <Line x1="8.5" y1="12" x2="15.5" y2="12" />
      <Line x1="8.5" y1="16" x2="13" y2="16" />
    </Svg>
  );
}

export function CabinetIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Circle cx="9" cy="8.5" r="3" />
      <Path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
      <Circle cx="16.5" cy="9.5" r="2.4" />
      <Path d="M15.5 14.6c2.4.2 4.3 1.6 4.9 4.4" />
    </Svg>
  );
}

export function OrdersIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Rect x="4" y="4" width="16" height="16" rx="2" />
      <Path d="m8.5 12.2 2.4 2.4 4.8-5" />
    </Svg>
  );
}

export function GazetteIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <Line x1="6.5" y1="9" x2="12" y2="9" />
      <Line x1="6.5" y1="12" x2="17.5" y2="12" />
      <Line x1="6.5" y1="15" x2="17.5" y2="15" />
      <Rect x="13.5" y="8" width="4" height="2.6" />
    </Svg>
  );
}

export function TreasuryIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Rect x="3" y="6.5" width="18" height="11" rx="1.5" />
      <Circle cx="12" cy="12" r="2.6" />
      <Line x1="6.2" y1="9.5" x2="6.2" y2="9.6" />
      <Line x1="17.8" y1="14.4" x2="17.8" y2="14.5" />
    </Svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...base(props)}>
      <Line x1="4" y1="7" x2="20" y2="7" />
      <Circle cx="9" cy="7" r="2" fill={colors.white} />
      <Line x1="4" y1="12" x2="20" y2="12" />
      <Circle cx="15" cy="12" r="2" fill={colors.white} />
      <Line x1="4" y1="17" x2="20" y2="17" />
      <Circle cx="7" cy="17" r="2" fill={colors.white} />
    </Svg>
  );
}

export function ChevronIcon({ color = colors.secondary, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m9 5 7 7-7 7" />
    </Svg>
  );
}
