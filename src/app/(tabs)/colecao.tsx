import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Art } from '@/art/Art';
import { Button, Card, Header, Screen, Segmented, Txt } from '@/components/ui';
import { CATALOG, brewers, byId, cups, type CatalogItem } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { streak } from '@/lib/stats';
import { minutesLabel } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

type Tab = 'cup' | 'brewer' | 'feitos';

function Shelf({ items, owned, selected, onSelect }: { items: CatalogItem[]; owned: string[]; selected: string; onSelect: (id: string) => void }) {
  const { c, r } = useTheme();
  const rows: CatalogItem[][] = [];
  for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
  return (
    <View style={{ gap: 14 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8, borderBottomWidth: 6, borderBottomColor: c.accent, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, paddingHorizontal: 6 }}>
          {row.map((it) => {
            const has = owned.includes(it.id);
            const sel = selected === it.id;
            return (
              <Pressable
                key={it.id}
                accessibilityRole="button"
                accessibilityLabel={`${it.name}. ${has ? 'Na prateleira' : 'Ainda não conquistada'}`}
                onPress={() => onSelect(it.id)}
                style={{ flex: 1, alignItems: 'center', borderRadius: r.md, backgroundColor: sel ? c.soft : 'transparent', paddingTop: 4 }}
              >
                <View style={{ opacity: has ? 1 : 0.18 }}>
                  <Art id={it.id} size={92} />
                </View>
              </Pressable>
            );
          })}
          {row.length < 3 && Array.from({ length: 3 - row.length }, (_, k) => <View key={k} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

export default function Colecao() {
  const { c } = useTheme();
  const { owned, brewerId, cupId, sessions, articlesRead, practicesDone } = useApp();
  const equip = useApp((s) => s.equip);
  const [tab, setTab] = useState<Tab>('cup');
  const [sel, setSel] = useState<{ cup: string; brewer: string }>({ cup: cupId, brewer: brewerId });

  const total = CATALOG.length;
  const have = owned.filter((id) => byId(id)).length;
  const finished = sessions.filter((s) => s.status === 'done').length;

  const detail = tab === 'cup' ? byId(sel.cup) : tab === 'brewer' ? byId(sel.brewer) : undefined;
  const equipped = detail && (detail.kind === 'cup' ? cupId : brewerId) === detail.id;
  const hasDetail = detail && owned.includes(detail.id);

  const totalMin = sessions.reduce((a, s) => a + s.elapsedMs / 60_000, 0);
  const best = Math.max(0, ...sessions.map((s) => s.elapsedMs / 60_000));
  const stats: [string, string][] = [
    ['Copos terminados', String(finished)],
    ['Tempo offline total', minutesLabel(totalMin)],
    ['Maior sessão', best ? minutesLabel(best) : '—'],
    ['Sequência atual', `${streak(sessions)} dias`],
    ['Copos encorpados', String(sessions.filter((s) => s.quality === 'encorpado').length)],
    ['Artigos lidos', `${articlesRead.length} de 9`],
    ['Práticas feitas', String(practicesDone.length)],
  ];

  return (
    <Screen>
      <Header title="Coleção" right={<Txt v="label" color="muted">{have} de {total}</Txt>} />
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'cup', label: 'Prateleira' },
          { value: 'brewer', label: 'Cafeteiras' },
          { value: 'feitos', label: 'Conquistas' },
        ]}
      />

      {tab === 'feitos' ? (
        <Card style={{ gap: 0, paddingVertical: 4 }}>
          {stats.map(([k, v], i) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              <Txt v="body" color="muted">
                {k}
              </Txt>
              <Txt v="num" style={{ fontSize: 16 }}>
                {v}
              </Txt>
            </View>
          ))}
        </Card>
      ) : (
        <>
          <Shelf
            items={tab === 'cup' ? cups() : brewers()}
            owned={owned}
            selected={tab === 'cup' ? sel.cup : sel.brewer}
            onSelect={(id) => {
              Haptics.selectionAsync().catch(() => {});
              setSel((s) => ({ ...s, [tab]: id }));
            }}
          />
          {detail && (
            <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <Art id={detail.id} size={72} />
              <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
                <Txt v="title">{detail.name}</Txt>
                <Txt v="small" color="muted">
                  {hasDetail ? detail.blurb : detail.streakUnlock ? `Libera com ${detail.streakUnlock} dias de sequência.` : `Disponível no Guia por ${detail.price} moedas.`}
                </Txt>
                {hasDetail && (
                  <Button label={equipped ? 'Em uso' : 'Usar'} disabled={!!equipped} tone="dark" onPress={() => equip(detail.id)} style={{ paddingVertical: 9, marginTop: 6 }} />
                )}
              </View>
            </Card>
          )}
          <Txt v="small" color="muted">
            {finished} {finished === 1 ? 'copo terminado' : 'copos terminados'}. Itens conquistados aparecem na prateleira, os outros ficam em silhueta.
          </Txt>
        </>
      )}
    </Screen>
  );
}
