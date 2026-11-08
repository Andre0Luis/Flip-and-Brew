import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Art } from '@/art/Art';
import { Button, Card, Segmented, Txt } from '@/components/ui';
import { CATALOG, brewers, byId, cups, localize, packs, type CatalogItem } from '@/data/catalog';
import { useI18n, type Key } from '@/i18n';
import { useApp } from '@/store/useApp';
import { equippedFirst } from '@/lib/shelf';
import { useTheme } from '@/theme/ThemeProvider';

type Tab = 'cup' | 'brewer' | 'beans';

/** Pedido vindo de fora (por exemplo, tocar na xícara ou no pacote no Início): abre na aba certa. `key` muda a cada pedido novo. */
export type CollectionRequest = { tab: Tab | null; key: string };

function Shelf({ items, owned, selected, onSelect }: { items: (CatalogItem & { name: string })[]; owned: string[]; selected: string; onSelect: (id: string) => void }) {
  const { c, r } = useTheme();
  const { t } = useI18n();
  const rows: (CatalogItem & { name: string })[][] = [];
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
                accessibilityLabel={`${it.name}. ${has ? t('col.a11yOn') : t('col.a11yOff')}`}
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

/** A coleção do usuário (prateleira, cafeteiras e cafés). Fica dentro da Guia, ao lado da loja. */
export function ColecaoView({ request }: { request: CollectionRequest }) {
  const { lang, t } = useI18n();
  const { owned, brewerId, cupId, packId, sessions } = useApp();
  const equip = useApp((s) => s.equip);
  const [tab, setTab] = useState<Tab>(request.tab ?? 'cup');
  const [sel, setSel] = useState<{ cup: string; brewer: string; beans: string }>({ cup: cupId, brewer: brewerId, beans: packId });

  // Ajusta o estado durante a renderização quando chega um pedido novo, em vez de usar um efeito.
  const [seenRequest, setSeenRequest] = useState(request.key);
  if (seenRequest !== request.key) {
    setSeenRequest(request.key);
    if (request.tab) {
      setTab(request.tab);
      setSel({ cup: cupId, brewer: brewerId, beans: packId });
    }
  }

  const total = CATALOG.length;
  const have = owned.filter((id) => byId(id)).length;
  const finished = sessions.filter((s) => s.status === 'done').length;

  const detailBase = byId(sel[tab]);
  const detail = detailBase ? localize(lang, detailBase) : undefined;
  const equipped = detail && (detail.kind === 'cup' ? cupId : detail.kind === 'beans' ? packId : brewerId) === detail.id;
  const hasDetail = detail && owned.includes(detail.id);

  const inUse: { kind: Tab; id: string; label: Key }[] = [
    { kind: 'brewer', id: brewerId, label: 'col.inUseBrewer' },
    { kind: 'cup', id: cupId, label: 'col.inUseCup' },
    { kind: 'beans', id: packId, label: 'col.inUsePack' },
  ];

  return (
    <>
      <Txt v="label" color="muted">
        {t('col.count', { a: have, b: total })}
      </Txt>

      <Card style={{ gap: 12 }}>
        <Txt v="title">{t('col.inUseTitle')}</Txt>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {inUse.map(({ kind, id, label }) => {
            const item = byId(id);
            return (
              <Pressable
                key={kind}
                accessibilityRole="button"
                accessibilityLabel={`${t(label)}: ${item ? localize(lang, item).name : ''}`}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setTab(kind);
                  setSel((v) => ({ ...v, [kind]: id }));
                }}
                style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 4 }}
              >
                <Art id={id} size={64} />
                <Txt v="label" color="muted" style={{ textAlign: 'center' }}>
                  {t(label)}
                </Txt>
                <Txt v="small" style={{ textAlign: 'center' }} numberOfLines={2}>
                  {item ? localize(lang, item).name : ''}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'cup', label: t('col.tabShelf') },
          { value: 'brewer', label: t('col.tabBrewers') },
          { value: 'beans', label: t('col.tabPacks') },
        ]}
      />
      <Shelf
        items={equippedFirst((tab === 'cup' ? cups() : tab === 'beans' ? packs() : brewers()).map((i) => localize(lang, i)), tab === 'cup' ? cupId : tab === 'beans' ? packId : brewerId)}
        owned={owned}
        selected={sel[tab]}
        onSelect={(id) => {
          Haptics.selectionAsync().catch(() => {});
          setSel((v) => ({ ...v, [tab]: id }));
        }}
      />
      {detail && (
        <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Art id={detail.id} size={72} />
          <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
            <Txt v="title">{detail.name}</Txt>
            <Txt v="small" color="muted">
              {hasDetail ? detail.blurb : detail.streakUnlock ? t('col.unlockStreak', { n: detail.streakUnlock }) : t('col.availableGuide', { n: detail.price })}
            </Txt>
            {hasDetail && (
              <Button label={equipped ? t('col.inUse') : t('col.use')} disabled={!!equipped} tone="dark" onPress={() => equip(detail.id)} style={{ paddingVertical: 9, marginTop: 6 }} />
            )}
          </View>
        </Card>
      )}
      <Txt v="small" color="muted">
        {t('col.footer', { n: finished })}
      </Txt>
    </>
  );
}
