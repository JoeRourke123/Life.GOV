/**
 * Figure — 1px border card containing an SVG chart: hairline axes, faint gridlines,
 * blue receipts / red spending lines, hatched deficit area. Caption row: description
 * left, `Fig. N` right (SYSTEM.md §3).
 */
import { Text, View } from 'react-native';
import Svg, { Defs, Line, Path, Pattern, Polyline, Rect } from 'react-native-svg';
import { colors, radius, type } from '@/theme';

const W = 320;
const H = 130;
const PAD = { l: 8, r: 8, t: 10, b: 18 };

export function Figure({
  caption,
  figNumber,
  receipts,
  spending,
}: {
  caption: string;
  figNumber: number;
  receipts: number[];
  spending: number[];
}) {
  const n = Math.max(receipts.length, spending.length);
  const max = Math.max(...receipts, ...spending, 1);
  const x = (i: number) => PAD.l + (i / Math.max(1, n - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  const line = (data: number[]) => data.map((v, i) => `${x(i)},${y(v)}`).join(' ');

  // Deficit area: polygon between the two lines wherever spending > receipts.
  const deficit: string[] = [];
  for (let i = 0; i < n; i++) {
    if (spending[i] > receipts[i]) deficit.push(`${x(i)},${y(receipts[i])}`, `${x(i)},${y(spending[i])}`);
  }

  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12 }}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <Pattern id="hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect width={6} height={6} fill={colors.red} fillOpacity={0.08} />
            <Line x1={0} y1={0} x2={0} y2={6} stroke={colors.red} strokeWidth={1.4} strokeOpacity={0.55} />
          </Pattern>
        </Defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <Line key={g} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + g * (H - PAD.t - PAD.b)} y2={PAD.t + g * (H - PAD.t - PAD.b)} stroke={colors.border} strokeWidth={0.6} strokeOpacity={0.5} />
        ))}
        <Line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke={colors.secondary} strokeWidth={1} />
        <Line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke={colors.secondary} strokeWidth={1} />
        {deficit.length > 0 ? <Path d={`M${deficit.join(' L')} Z`} fill="url(#hatch)" stroke="none" /> : null}
        <Polyline points={line(receipts)} fill="none" stroke={colors.blue} strokeWidth={2} />
        <Polyline points={line(spending)} fill="none" stroke={colors.red} strokeWidth={2} />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={[type.sub, { fontSize: 11.5, letterSpacing: 0.4 }]}>{caption}</Text>
        <Text style={[type.sub, { fontSize: 11.5, letterSpacing: 0.4 }]}>Fig. {figNumber}</Text>
      </View>
    </View>
  );
}
