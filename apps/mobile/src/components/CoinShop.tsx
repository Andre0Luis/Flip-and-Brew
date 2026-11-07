import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Txt } from '@/components/ui';
import { formatNumber, useI18n } from '@/i18n';
import { buyCoinPack, loadCoinPacks, purchasesBlockedByExpoGo, purchasesConfigured, type CoinPack } from '@/lib/purchases';
import { useApp } from '@/store/useApp';

/** A venda de moedas: os pacotes vêm da loja (RevenueCat). Fica na tela Moedas e no fim da Guia. */
export function CoinShop() {
  const { lang, t } = useI18n();
  const addCoins = useApp((s) => s.addCoins);
  const [packs, setPacks] = useState<CoinPack[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (purchasesConfigured) loadCoinPacks().then(setPacks);
  }, []);

  const buy = async (p: CoinPack) => {
    if (busy) return;
    setBusy(true);
    try {
      const got = await buyCoinPack(p);
      if (got) {
        addCoins(got);
        setMessage(t('guide.packAdded', { n: formatNumber(lang, got) }));
      } else setMessage(t('guide.packCancel'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ gap: 8 }}>
      <Txt v="title">{t('guide.coinsTitle')}</Txt>
      {purchasesConfigured ? (
        packs.length ? (
          <View style={{ gap: 8 }}>
            {packs.map((p) => (
              <Button key={p.id} tone="quiet" label={t('guide.packLine', { n: formatNumber(lang, p.coins), price: p.price })} onPress={() => buy(p)} disabled={busy} />
            ))}
          </View>
        ) : (
          <Txt v="small" color="muted">
            {t('guide.packsFail')}
          </Txt>
        )
      ) : (
        <Txt v="small" color="muted">
          {purchasesBlockedByExpoGo ? t('guide.coinsExpoGo') : t('guide.coinsInfo')}
        </Txt>
      )}
      {message && (
        <Txt v="small" color="good" accessibilityLiveRegion="polite">
          {message}
        </Txt>
      )}
      <Txt v="small" color="muted">
        {t('guide.coinsHow')}
      </Txt>
    </Card>
  );
}
