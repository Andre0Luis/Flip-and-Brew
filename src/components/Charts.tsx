import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cell, DayBar } from '@/lib/stats';
import { Txt } from './ui';

export function WeekBars({ days }: { days: DayBar[] }) {
  const { c, f } = useTheme();
  const W = 260, H = 112, top = 8, base = 92;
  const maxMin = Math.max(...days.map((d) => d.minutes), 60);
  const max = Math.ceil(maxMin / 120) * 120; // topo em múltiplos de 2h
  const step = (W - 30) / days.length;
  const bw = Math.min(24, step - 6);
  const ticks = [0, max / 2, max];
  const label = (m: number) => `${Math.round(m / 60 * 10) / 10}h`.replace('.', ',');
  return (
    <Svg width="100%" height={150} viewBox={`0 0 ${W} ${H}`} accessibilityRole="image" accessibilityLabel="Minutos offline por dia na última semana">
      {ticks.map((t) => {
        const y = base - (t / max) * (base - top);
        return (
          <React.Fragment key={t}>
            <Line x1={26} x2={W} y1={y} y2={y} stroke={c.line} strokeWidth={1} />
            <SvgText x={0} y={y + 3} fill={c.muted} fontSize={8} fontFamily={f.monoMedium}>
              {label(t)}
            </SvgText>
          </React.Fragment>
        );
      })}
      {days.map((d, i) => {
        const h = (d.minutes / max) * (base - top);
        const x = 30 + i * step + (step - bw) / 2;
        return (
          <React.Fragment key={d.key}>
            <Rect x={x} y={base - Math.max(h, d.minutes > 0 ? 2 : 0)} width={bw} height={Math.max(h, d.minutes > 0 ? 2 : 0)} rx={4} fill={d.isToday ? c.accent : c.cupFill} opacity={d.isToday ? 1 : 0.55} />
            <SvgText x={x + bw / 2} y={base + 12} textAnchor="middle" fill={d.isToday ? c.fg : c.muted} fontSize={8} fontFamily={f.monoMedium}>
              {d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export function HourBars({ hours }: { hours: number[] }) {
  const { c, f } = useTheme();
  const W = 260, H = 84, base = 62, top = 4;
  const max = Math.max(...hours, 1);
  const peak = [...hours].sort((a, b) => b - a)[2] ?? max; // as três maiores destacam
  const bw = 8, step = (W - 8) / 24;
  return (
    <Svg width="100%" height={110} viewBox={`0 0 ${W} ${H}`} accessibilityRole="image" accessibilityLabel="Tempo offline por hora do dia">
      <Line x1={0} x2={W} y1={base} y2={base} stroke={c.line} strokeWidth={1} />
      {hours.map((m, i) => {
        const h = m > 0 ? Math.max(2, (m / max) * (base - top)) : 0;
        const hot = m > 0 && m >= peak;
        return <Rect key={i} x={4 + i * step} y={base - h} width={bw} height={h} rx={2} fill={hot ? c.accent : c.cupFill} opacity={hot ? 1 : 0.5} />;
      })}
      {[0, 6, 12, 18, 23].map((h) => (
        <SvgText key={h} x={4 + h * step + bw / 2} y={78} textAnchor="middle" fill={c.muted} fontSize={8} fontFamily={f.monoMedium}>
          {h}h
        </SvgText>
      ))}
    </Svg>
  );
}

export function CalendarGrid({ cells }: { cells: Cell[] }) {
  const { c, f } = useTheme();
  const shade = (cell: Cell) => {
    if (cell.level === 3) return c.accent;
    if (cell.level === 2) return `${c.accent}A6`;
    if (cell.level === 1) return `${c.accent}59`;
    return c.soft;
  };
  const header = cells.slice(0, 7).map((x) => x.label);
  return (
    <View style={{ gap: 6 }} accessibilityRole="image" accessibilityLabel="Calendário das últimas quatro semanas">
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {header.map((l, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Txt v="small" color="muted" style={{ fontFamily: f.monoMedium, fontSize: 9, lineHeight: 12 }}>
              {l}
            </Txt>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {cells.map((cell) => (
          <View
            key={cell.key}
            style={{
              width: '13.1%',
              aspectRatio: 1,
              borderRadius: 6,
              backgroundColor: cell.missed ? 'transparent' : shade(cell),
              borderWidth: cell.isToday ? 2 : cell.missed ? 1 : 0,
              borderColor: cell.isToday ? c.fg : c.line,
            }}
          />
        ))}
      </View>
    </View>
  );
}
