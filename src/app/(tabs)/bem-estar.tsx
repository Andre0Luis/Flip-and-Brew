import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Bar, Card, Header, Insight, Screen, Segmented, Txt } from '@/components/ui';
import { CalendarGrid, HourBars, WeekBars } from '@/components/Charts';
import { Ring } from '@/components/BrewViz';
import { useApp } from '@/store/useApp';
import {
  afterMissInsight, balanceScore, calendar, hourly, lastDays, longestSession, moodSummary, streak, triggerCounts, weekTotals,
} from '@/lib/stats';
import { dateShort, minutesLabel } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

type Tab = 'resumo' | 'padroes';

function Kpi({ label, value, note, good }: { label: string; value: string; note?: string; good?: boolean }) {
  return (
    <Card style={{ flex: 1, padding: 12, gap: 4, minWidth: 0 }}>
      <Txt v="label" color="muted" numberOfLines={2}>
        {label}
      </Txt>
      <Txt v="num" style={{ fontSize: 20 }}>
        {value}
      </Txt>
      {note ? (
        <Txt v="small" color={good ? 'good' : 'muted'} style={{ fontSize: 11, lineHeight: 15 }}>
          {note}
        </Txt>
      ) : null}
    </Card>
  );
}

function Meter({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Txt v="small" color="muted" style={{ flexShrink: 1 }}>
          {label}
        </Txt>
        <Txt v="small" style={{ fontFamily: fonts.bodyBold }}>
          {value}
        </Txt>
      </View>
      <Bar pct={pct} />
    </View>
  );
}

export default function BemEstar() {
  const { c } = useTheme();
  const { sessions, settings } = useApp();
  const loadDemo = useApp((s) => s.loadDemo);
  const [tab, setTab] = useState<Tab>('resumo');
  const goal = settings.goalMin;

  const empty = sessions.length === 0;
  const score = balanceScore(sessions, goal);
  const wk = weekTotals(sessions);
  const week = lastDays(sessions, 7);
  const days = streak(sessions);
  const best = longestSession(sessions, Date.now() - 7 * 86_400_000);
  const miss = afterMissInsight(sessions);
  const trig = triggerCounts(sessions);
  const mood = moodSummary(sessions, goal);
  const hrs = hourly(sessions);

  return (
    <Screen>
      <Header title="Bem-estar" right={<Txt v="label" color="muted">Meta {minutesLabel(goal)}/dia</Txt>} />
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'resumo', label: 'Resumo' },
          { value: 'padroes', label: 'Padrões' },
        ]}
      />

      {empty ? (
        <Card style={{ gap: 12 }}>
          <Txt v="title">Ainda não há copos por aqui</Txt>
          <Txt v="body" color="muted">
            Termine um copo na tela Início e este painel mostra seu tempo offline, os horários em que você consegue largar o celular e o que costuma te interromper.
          </Txt>
          <Button label="Ver com dados de exemplo" tone="quiet" onPress={loadDemo} />
          <Txt v="small" color="muted">
            Os dados de exemplo são fictícios e podem ser apagados em Ajustes.
          </Txt>
        </Card>
      ) : tab === 'resumo' ? (
        <>
          <Card style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            {score ? (
              <>
                <Ring progress={score.value / 100} size={96} stroke={9}>
                  <Txt v="num" style={{ fontSize: 26, lineHeight: 30 }} accessibilityLabel={`Equilíbrio ${score.value} de 100`}>
                    {score.value}
                  </Txt>
                </Ring>
                <View style={{ flex: 1, gap: 10, minWidth: 0 }}>
                  <Meter label="Meta diária (7 dias)" value={`${Math.round(score.goalPct * 100)}%`} pct={score.goalPct} />
                  <Meter label="Copos terminados" value={`${Math.round(score.completionPct * 100)}%`} pct={score.completionPct} />
                  <Meter label="Sequência" value={`${days} ${days === 1 ? 'dia' : 'dias'}`} pct={score.streakPct} />
                </View>
              </>
            ) : (
              <Txt v="body" color="muted">
                Sem copos nos últimos 7 dias. Termine um para ver seu equilíbrio.
              </Txt>
            )}
          </Card>
          <Txt v="small" color="muted" style={{ marginTop: -6 }}>
            Equilíbrio: 50% meta diária, 30% copos terminados e 20% sequência (14 dias enche a barra).
          </Txt>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Kpi label="Offline na semana" value={minutesLabel(wk.minutes)} note={`${wk.deltaMinutes >= 0 ? '+' : '−'}${minutesLabel(Math.abs(wk.deltaMinutes))} vs. anterior`} good={wk.deltaMinutes >= 0} />
            <Kpi label="Maior sessão" value={best ? minutesLabel(best.elapsedMs / 60_000) : '—'} note={best ? dateShort(best.startedAt) : undefined} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Kpi label="Copos cheios" value={String(wk.cups)} note={`de ${wk.sessions} iniciados`} />
            <Kpi label="Interrompidos" value={String(wk.interrupted)} note="você pegou o celular antes do fim" />
          </View>

          <Card style={{ gap: 8 }}>
            <Txt v="label" color="muted">
              Minutos offline por dia
            </Txt>
            <WeekBars days={week} />
          </Card>

          <Card style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt v="label" color="muted">
                Últimas 4 semanas
              </Txt>
              <Txt v="label" color="muted">
                {calendar(sessions, goal).filter((x) => x.missed).length} sem copo
              </Txt>
            </View>
            <CalendarGrid cells={calendar(sessions, goal)} />
          </Card>

          {miss ? (
            miss.percent >= 0 ? (
              <Insight tag="Antifrágil · Taleb">
                Depois de um dia sem copo, você passou {miss.percent}% mais tempo offline que o seu normal. A falha te deixou mais forte.
              </Insight>
            ) : (
              <Insight tag="Antifrágil · Taleb">
                Depois de um dia sem copo, você passou {Math.abs(miss.percent)}% menos tempo offline que o seu normal. Um copo curto no dia seguinte costuma ajudar a retomar.
              </Insight>
            )
          ) : (
            <Insight tag="Antifrágil · Taleb">Um dia perdido não apaga o que você acumulou. Registrar o motivo mostra onde reforçar.</Insight>
          )}
        </>
      ) : (
        <>
          <Card style={{ gap: 8 }}>
            <Txt v="label" color="muted">
              Quando você fica offline · 30 dias
            </Txt>
            <HourBars hours={hrs} />
            {hrs.some((h) => h > 0) && (
              <Txt v="small" color="muted">
                Seus horários mais fortes: {[...hrs.map((m, h) => ({ m, h }))].sort((a, b) => b.m - a.m).slice(0, 3).map((x) => `${x.h}h`).sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}.
              </Txt>
            )}
          </Card>

          <Card style={{ gap: 10 }}>
            <Txt v="label" color="muted">
              O que interrompe seus copos
            </Txt>
            {trig.length ? (
              <>
                {trig.map((t) => (
                  <View key={t.trigger} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Txt v="small" style={{ width: 88 }}>
                      {t.trigger}
                    </Txt>
                    <View style={{ flex: 1 }}>
                      <Bar pct={t.count / trig[0].count} color="cupFill" height={8} />
                    </View>
                    <Txt v="small" color="muted" style={{ width: 28, textAlign: 'right' }}>
                      {t.count}×
                    </Txt>
                  </View>
                ))}
                <Txt v="small" color="muted">
                  {trig[0].trigger === 'Notificação'
                    ? 'Notificações lideram. Desligue as que não pedem resposta.'
                    : trig[0].trigger === 'Tédio'
                      ? 'O tédio aparece mais. Ele passa em alguns minutos se você esperar.'
                      : trig[0].trigger === 'Trabalho'
                        ? 'O trabalho interrompe mais. Combine horários fixos para os copos.'
                        : 'Observe quando isso acontece e escolha um horário mais fácil.'}
                </Txt>
              </>
            ) : (
              <Txt v="small" color="muted">
                Quando você parar um copo cedo, a tela de resultado pergunta o motivo. Os registros aparecem aqui.
              </Txt>
            )}
          </Card>

          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt v="label" color="muted">
                Como você se sentiu depois do copo
              </Txt>
              {mood && (
                <Txt v="label" color="muted">
                  média {mood.average.toFixed(1).replace('.', ',')}
                </Txt>
              )}
            </View>
            {mood ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 52 }}>
                  {mood.ratings.map((m, i) => (
                    <View key={i} style={{ flex: 1, height: m * 10, borderRadius: 3, backgroundColor: m >= 5 ? c.accent : c.cupFill, opacity: m >= 5 ? 1 : 0.55 }} />
                  ))}
                </View>
                {mood.high !== null && mood.low !== null && (
                  <Txt v="small" color="muted">
                    Em dias com mais de {minutesLabel(Math.min(goal, 120))} offline, o humor médio foi {mood.high.toFixed(1).replace('.', ',')}. Nos outros, {mood.low.toFixed(1).replace('.', ',')}.
                  </Txt>
                )}
              </>
            ) : (
              <Txt v="small" color="muted">
                Responda “Como você se sente agora?” ao fim dos copos para ver a relação com o tempo offline.
              </Txt>
            )}
          </Card>

          <Insight tag="Estoicismo · Epicteto">Observe o padrão sem se julgar. O que você vê aqui é o que depende de você ajustar.</Insight>
        </>
      )}
    </Screen>
  );
}
