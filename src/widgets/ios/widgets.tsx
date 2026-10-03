import { Gauge, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, gaugeStyle, lineLimit, multilineTextAlignment, padding, tint, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { WidgetData } from '@/lib/widgetData';

// Atenção: o código dentro de cada função com 'widget' roda isolado, dentro da extensão do widget.
// Por isso as cores e os ajudantes ficam declarados dentro de cada função, e nada vem de fora além das props.

/** Só a frase do dia. */
const QuoteWidget = (props: WidgetData, env: WidgetEnvironment) => {
  'widget';
  const BG = '#1B120D';
  const FG = '#F6EEE1';
  const MUTED = '#A89886';
  const lock = env.widgetFamily.startsWith('accessory');
  if (env.widgetFamily === 'accessoryInline') return <Text modifiers={[lineLimit(1)]}>{props.quote.text}</Text>;
  return (
    <VStack alignment="leading" spacing={6} modifiers={[padding({ all: lock ? 0 : 14 }), containerBackground(BG, 'widget'), widgetURL('flipandbrew://')]}>
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(MUTED)]}>{props.labels.quote.toUpperCase()}</Text>
      <Text modifiers={[font({ size: lock ? 12 : env.widgetFamily === 'systemSmall' ? 13 : 17, design: 'serif' }), foregroundStyle(FG), lineLimit(lock ? 3 : 7)]}>{props.quote.text}</Text>
      {!lock && <Text modifiers={[font({ size: 10 }), foregroundStyle(MUTED), lineLimit(1)]}>{props.quote.author}</Text>}
    </VStack>
  );
};

/** O copo em andamento. */
const BrewWidget = (props: WidgetData, env: WidgetEnvironment) => {
  'widget';
  const BG = '#1B120D';
  const FG = '#F6EEE1';
  const MUTED = '#A89886';
  const ACCENT = '#D7B15A';
  const b = props.brew;
  const lock = env.widgetFamily.startsWith('accessory');
  if (env.widgetFamily === 'accessoryInline') return <Text modifiers={[lineLimit(1)]}>{b.active ? `${props.labels.brew} ${b.percent}%` : props.labels.idle}</Text>;
  if (env.widgetFamily === 'accessoryCircular') {
    return (
      <Gauge value={b.percent / 100} currentValueLabel={<Text>{`${b.percent}`}</Text>} modifiers={[gaugeStyle('circularCapacity')]}>
        <Text>%</Text>
      </Gauge>
    );
  }
  return (
    <VStack alignment="leading" spacing={6} modifiers={[padding({ all: lock ? 0 : 14 }), containerBackground(BG, 'widget'), widgetURL('flipandbrew://')]}>
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(MUTED)]}>{props.labels.brew.toUpperCase()}</Text>
      {b.active ? (
        <>
          <Text modifiers={[font({ size: lock ? 22 : 34, weight: 'bold' }), foregroundStyle(FG)]}>{`${b.percent}%`}</Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(MUTED), lineLimit(1)]}>{`${b.name} · ${b.remainingMin} ${props.labels.remaining}`}</Text>
          {!lock && <Gauge value={b.percent / 100} modifiers={[gaugeStyle('linearCapacity'), tint(ACCENT)]} />}
        </>
      ) : (
        <Text modifiers={[font({ size: lock ? 14 : 18 }), foregroundStyle(FG)]}>{props.labels.idle}</Text>
      )}
    </VStack>
  );
};

/** Sequência de dias e moedas. */
const StreakWidget = (props: WidgetData, env: WidgetEnvironment) => {
  'widget';
  const BG = '#1B120D';
  const FG = '#F6EEE1';
  const MUTED = '#A89886';
  const ACCENT = '#D7B15A';
  const lock = env.widgetFamily.startsWith('accessory');
  if (env.widgetFamily === 'accessoryInline') return <Text modifiers={[lineLimit(1)]}>{`${props.streak} ${props.labels.days} · ${props.coins}`}</Text>;
  if (env.widgetFamily === 'accessoryCircular') {
    return (
      <VStack spacing={0}>
        <Text modifiers={[font({ size: 22, weight: 'bold' })]}>{String(props.streak)}</Text>
        <Text modifiers={[font({ size: 9 })]}>{props.labels.days}</Text>
      </VStack>
    );
  }
  return (
    <VStack alignment="leading" spacing={6} modifiers={[padding({ all: lock ? 0 : 14 }), containerBackground(BG, 'widget'), widgetURL('flipandbrew://')]}>
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(MUTED)]}>{props.labels.streak.toUpperCase()}</Text>
      <HStack>
        <VStack alignment="leading" spacing={0}>
          <Text modifiers={[font({ size: lock ? 22 : 40, weight: 'bold' }), foregroundStyle(FG)]}>{String(props.streak)}</Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(MUTED)]}>{props.labels.days}</Text>
        </VStack>
        <Spacer />
        <VStack alignment="trailing" spacing={0}>
          <Text modifiers={[font({ size: lock ? 16 : 24, weight: 'bold' }), foregroundStyle(ACCENT)]}>{String(props.coins)}</Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(MUTED)]}>{props.labels.coins}</Text>
        </VStack>
      </HStack>
    </VStack>
  );
};

/** A meta de tempo offline de hoje. */
const GoalWidget = (props: WidgetData, env: WidgetEnvironment) => {
  'widget';
  const BG = '#1B120D';
  const FG = '#F6EEE1';
  const MUTED = '#A89886';
  const ACCENT = '#D7B15A';
  const t = props.today;
  const lock = env.widgetFamily.startsWith('accessory');
  if (env.widgetFamily === 'accessoryInline') return <Text modifiers={[lineLimit(1)]}>{`${t.minutes}/${t.goal} ${props.labels.minutes}`}</Text>;
  if (env.widgetFamily === 'accessoryCircular') {
    return (
      <Gauge value={t.percent / 100} currentValueLabel={<Text>{`${t.percent}`}</Text>} modifiers={[gaugeStyle('circularCapacity')]}>
        <Text>%</Text>
      </Gauge>
    );
  }
  return (
    <VStack alignment="leading" spacing={6} modifiers={[padding({ all: lock ? 0 : 14 }), containerBackground(BG, 'widget'), widgetURL('flipandbrew://')]}>
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(MUTED)]}>{props.labels.goal.toUpperCase()}</Text>
      <Text modifiers={[font({ size: lock ? 16 : 24, weight: 'bold' }), foregroundStyle(FG)]}>{`${t.minutes} / ${t.goal} ${props.labels.minutes}`}</Text>
      {!lock && <Gauge value={t.percent / 100} modifiers={[gaugeStyle('linearCapacity'), tint(ACCENT)]} />}
    </VStack>
  );
};

/** As missões do dia. */
const MissionsWidget = (props: WidgetData, env: WidgetEnvironment) => {
  'widget';
  const BG = '#1B120D';
  const FG = '#F6EEE1';
  const MUTED = '#A89886';
  const ACCENT = '#D7B15A';
  const m = props.missions;
  const lock = env.widgetFamily.startsWith('accessory');
  if (env.widgetFamily === 'accessoryInline') return <Text modifiers={[lineLimit(1)]}>{`${props.labels.missions} ${m.done}/${m.total}`}</Text>;
  if (env.widgetFamily === 'accessoryCircular') {
    return (
      <Gauge value={m.total ? m.done / m.total : 0} currentValueLabel={<Text>{`${m.done}`}</Text>} modifiers={[gaugeStyle('circularCapacity')]}>
        <Text>{`/${m.total}`}</Text>
      </Gauge>
    );
  }
  return (
    <VStack alignment="leading" spacing={6} modifiers={[padding({ all: lock ? 0 : 14 }), containerBackground(BG, 'widget'), widgetURL('flipandbrew://')]}>
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(MUTED)]}>{props.labels.missions.toUpperCase()}</Text>
      <Text modifiers={[font({ size: lock ? 22 : 40, weight: 'bold' }), foregroundStyle(FG), multilineTextAlignment('leading')]}>{`${m.done} / ${m.total}`}</Text>
      {!lock && <Gauge value={m.total ? m.done / m.total : 0} modifiers={[gaugeStyle('linearCapacity'), tint(ACCENT)]} />}
    </VStack>
  );
};

export const FlipQuote = createWidget('FlipQuote', QuoteWidget);
export const FlipBrew = createWidget('FlipBrew', BrewWidget);
export const FlipStreak = createWidget('FlipStreak', StreakWidget);
export const FlipGoal = createWidget('FlipGoal', GoalWidget);
export const FlipMissions = createWidget('FlipMissions', MissionsWidget);
