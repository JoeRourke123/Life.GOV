/**
 * Life.GOV design system — "GOV.UK Play" v1.0
 * Tokens mirror docs/design/SYSTEM.md §2. Components import from here; screens import components.
 */
import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  black: '#0b0c0c',
  secondary: '#505a5f',
  border: '#b1b4b6',
  light: '#f3f2f1',
  green: '#00703c',
  greenDark: '#002d18',
  blue: '#1d70b8',
  red: '#d4351c',
  redDark: '#55150b',
  yellow: '#ffdd00',
  tagGrey: '#646769',
  white: '#ffffff',
  miniTrack: '#d8dadd',
} as const;

/** Font families loaded via expo-font in app/_layout.tsx. One family per weight. */
export const fontFamily = {
  regular: 'HG-400',
  medium: 'HG-500',
  semibold: 'HG-600',
  bold: 'HG-700',
  extrabold: 'HG-800',
  monoMedium: 'PlexMono-500',
  monoSemibold: 'PlexMono-600',
} as const;

/** Type scale — docs/design/SYSTEM.md §2. Weights ride on the named families above. */
export const type = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 31, lineHeight: 34 } as TextStyle,
  section: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 25 } as TextStyle,
  title: { fontFamily: fontFamily.semibold, fontSize: 16.5, lineHeight: 22 } as TextStyle,
  body: { fontFamily: fontFamily.regular, fontSize: 15.5, lineHeight: 23 } as TextStyle,
  sub: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18 } as TextStyle,
  tag: { fontFamily: fontFamily.bold, fontSize: 12, lineHeight: 12 } as TextStyle,
  small: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 19 } as TextStyle,
  button: { fontFamily: fontFamily.bold, fontSize: 17, lineHeight: 22 } as TextStyle,
  statLabel: { fontFamily: fontFamily.bold, fontSize: 11.5, lineHeight: 15, letterSpacing: 0.7 } as TextStyle,
  statFigure: { fontFamily: fontFamily.extrabold, fontSize: 22, lineHeight: 27 } as TextStyle,
  meterLabel: { fontFamily: fontFamily.bold, fontSize: 13, lineHeight: 17, letterSpacing: 0.6 } as TextStyle,
  meterFigure: { fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 18 } as TextStyle,
  mono: { fontFamily: fontFamily.monoMedium, fontSize: 14, lineHeight: 18 } as TextStyle,
  monoClock: { fontFamily: fontFamily.monoSemibold, fontSize: 34, lineHeight: 40 } as TextStyle,
} as const;

export const spacing = {
  screen: 20,
  section: 30,
  row: 14,
  gap: 12,
  tag: 9,
} as const;

export const radius = {
  md: 4, // buttons, tags, cards, figures, panels
  sm: 3, // meters, inputs, checkboxes
} as const;

/** Hard button shadows: `0 2px 0` darker shade. Nothing else casts a shadow. */
export const buttonShadow = {
  primary: { shadowColor: colors.greenDark, backgroundColor: colors.green },
  secondary: { shadowColor: colors.black, backgroundColor: colors.light },
  warning: { shadowColor: colors.redDark, backgroundColor: colors.red },
} as const;

export const shadowStyle = (color: string): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 2,
});

export const motion = {
  fast: 150, // transitions, press feedback — ease-out
  eventCrossfade: 300, // event-mode header
} as const;

export type TagStatus = 'completed' | 'inProgress' | 'notStarted' | 'struck' | 'awaitingAssent';

export const tagStyles: Record<TagStatus, { label: string; backgroundColor: string; color: string }> = {
  completed: { label: 'Completed', backgroundColor: colors.green, color: colors.white },
  inProgress: { label: 'In progress', backgroundColor: colors.blue, color: colors.white },
  notStarted: { label: 'Not started', backgroundColor: colors.tagGrey, color: colors.white },
  struck: { label: 'Struck', backgroundColor: colors.red, color: colors.white },
  awaitingAssent: { label: 'Awaiting assent', backgroundColor: colors.yellow, color: colors.black },
};
