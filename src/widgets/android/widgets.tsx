import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetData } from '@/lib/widgetData';

// As cores são fixas: o widget roda fora do app e não tem acesso ao tema.
const BG = '#1B120D';
const FG = '#F6EEE1';
const MUTED = '#A89886';
const ACCENT = '#D7B15A';
const TRACK = '#3A2A22';

type P = { data: WidgetData };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <FlexWidget clickAction="OPEN_APP" style={{ height: 'match_parent', width: 'match_parent', backgroundColor: BG, borderRadius: 24, padding: 16, flexDirection: 'column', justifyContent: 'space-between' }}>
      {children}
    </FlexWidget>
  );
}

const Label = ({ text }: { text: string }) => <TextWidget text={text.toUpperCase()} style={{ fontSize: 11, color: MUTED, letterSpacing: 1.2 }} />;

/** Barra de progresso: duas caixas lado a lado, uma preenchida e outra vazia. */
function Bar({ percent, width = 220 }: { percent: number; width?: number }) {
  const filled = Math.max(0, Math.min(100, percent)) * (width / 100);
  return (
    <FlexWidget style={{ flexDirection: 'row', width, height: 8, borderRadius: 4, backgroundColor: TRACK }}>
      <FlexWidget style={{ width: Math.max(0, filled), height: 8, borderRadius: 4, backgroundColor: ACCENT }} />
    </FlexWidget>
  );
}

/** Só a frase do dia. */
export function QuoteWidget({ data }: P) {
  return (
    <Shell>
      <Label text={data.labels.quote} />
      <TextWidget text={data.quote.text} maxLines={6} style={{ fontSize: 18, color: FG, fontFamily: 'serif' }} />
      <TextWidget text={data.quote.author} maxLines={1} truncate="END" style={{ fontSize: 11, color: MUTED }} />
    </Shell>
  );
}

/** O copo em andamento: nome da cafeteira, porcentagem e minutos restantes. */
export function BrewWidget({ data }: P) {
  const b = data.brew;
  return (
    <Shell>
      <Label text={data.labels.brew} />
      {b.active ? (
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={`${b.percent}%`} style={{ fontSize: 34, color: FG, fontWeight: 'bold' }} />
          <TextWidget text={`${b.name} · ${b.remainingMin} ${data.labels.remaining}`} maxLines={1} truncate="END" style={{ fontSize: 12, color: MUTED }} />
        </FlexWidget>
      ) : (
        <TextWidget text={data.labels.idle} style={{ fontSize: 18, color: FG }} />
      )}
      <Bar percent={b.percent} />
    </Shell>
  );
}

/** Sequência de dias e moedas. */
export function StreakWidget({ data }: P) {
  return (
    <Shell>
      <Label text={data.labels.streak} />
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={String(data.streak)} style={{ fontSize: 40, color: FG, fontWeight: 'bold' }} />
          <TextWidget text={data.labels.days} style={{ fontSize: 12, color: MUTED }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <TextWidget text={String(data.coins)} style={{ fontSize: 24, color: ACCENT, fontWeight: 'bold' }} />
          <TextWidget text={data.labels.coins} style={{ fontSize: 12, color: MUTED }} />
        </FlexWidget>
      </FlexWidget>
    </Shell>
  );
}

/** A meta de tempo offline de hoje. */
export function GoalWidget({ data }: P) {
  const t = data.today;
  return (
    <Shell>
      <Label text={data.labels.goal} />
      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget text={`${t.minutes} / ${t.goal} ${data.labels.minutes}`} style={{ fontSize: 24, color: FG, fontWeight: 'bold' }} />
        <TextWidget text={`${t.percent}%`} style={{ fontSize: 12, color: MUTED }} />
      </FlexWidget>
      <Bar percent={t.percent} />
    </Shell>
  );
}

/** As missões do dia. */
export function MissionsWidget({ data }: P) {
  const m = data.missions;
  return (
    <Shell>
      <Label text={data.labels.missions} />
      <TextWidget text={`${m.done} / ${m.total}`} style={{ fontSize: 40, color: FG, fontWeight: 'bold' }} />
      <Bar percent={m.total ? (m.done / m.total) * 100 : 0} />
    </Shell>
  );
}

export const WIDGETS = {
  FlipQuote: QuoteWidget,
  FlipBrew: BrewWidget,
  FlipStreak: StreakWidget,
  FlipGoal: GoalWidget,
  FlipMissions: MissionsWidget,
} as const;

export type WidgetName = keyof typeof WIDGETS;
