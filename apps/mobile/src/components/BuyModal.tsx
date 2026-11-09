import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Art, Coin } from '@/art/Art';
import { Button, Txt } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { itemText, type LocalizedItem } from '@/data/catalog';
import { formatNumber, useI18n } from '@/i18n';
import { afterPurchase, itemBenefits } from '@/lib/benefits';
import { useTheme } from '@/theme/ThemeProvider';

type Result = 'ok' | 'owned' | 'poor' | 'locked';

/**
 * Confirmação de compra no meio da tela, onde a pessoa está olhando: o item, o que ele rende e o preço.
 * Depois de comprar, a própria janela mostra que deu certo (o item já entra em uso), em vez de uma faixa lá em cima da lista.
 */
export function BuyModal({ item, price, discountPercent, coins, onBuy, onClose, onGetCoins }: { item: LocalizedItem; price: number; discountPercent: number; coins: number; onBuy: () => Result; onClose: () => void; onGetCoins: () => void }) {
  const { c, r, f } = useTheme();
  const { lang, t } = useI18n();
  const num = (n: number) => formatNumber(lang, n);
  const [bought, setBought] = useState(false);
  const b = itemBenefits(item);
  const after = afterPurchase(coins, price);

  const rows: { text: string }[] = [];
  if (b.earn > 0) rows.push({ text: t('guide.benefitEarn', { n: b.earn }) });
  if (b.minutes !== null) rows.push({ text: t('guide.benefitMinutes', { n: b.minutes }) });
  for (const id of b.partners) rows.push({ text: t('guide.benefitSynergy', { name: itemText(lang, id).name, n: b.synergyBonus }) });
  if (b.collectionOnly) rows.push({ text: t('guide.benefitCollection') });
  rows.push({ text: t('guide.benefitEquip') });

  const confirm = () => {
    const res = onBuy();
    if (res === 'ok') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setBought(true);
    } else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Pressable accessibilityLabel={t('guide.cancel')} onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#000', opacity: 0.6 }} />
        <View style={{ backgroundColor: c.surface, borderRadius: r.lg, borderWidth: 1, borderColor: c.line, maxHeight: '92%', overflow: 'hidden' }}>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 14, alignItems: 'center' }}>
            <View style={{ backgroundColor: c.soft, borderRadius: r.lg, padding: 14 }}>
              <Art id={item.id} size={132} />
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Txt v="display" style={{ textAlign: 'center' }}>
                {item.name}
              </Txt>
              <Txt v="small" color="muted" style={{ textAlign: 'center' }}>
                {item.blurb}
              </Txt>
            </View>

            {bought ? (
              <View style={{ alignItems: 'center', gap: 12, alignSelf: 'stretch' }} accessibilityLiveRegion="polite">
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={28} color={c.accentFg} />
                </View>
                <Txt v="title" style={{ textAlign: 'center' }}>
                  {t('guide.bought', { name: item.name })}
                </Txt>
                <Button label={t('guide.close')} onPress={onClose} style={{ alignSelf: 'stretch' }} />
              </View>
            ) : (
              <>
                <View style={{ alignSelf: 'stretch', gap: 8, backgroundColor: c.soft, borderRadius: r.md, padding: 14 }}>
                  <Txt v="label" color="muted">
                    {t('guide.benefitsTitle')}
                  </Txt>
                  {rows.map((row) => (
                    <View key={row.text} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                      <View style={{ paddingTop: 2 }}>
                        <Icon name="check" size={16} color={c.accent} />
                      </View>
                      <Txt v="body" style={{ flex: 1 }}>
                        {row.text}
                      </Txt>
                    </View>
                  ))}
                </View>

                <View style={{ alignSelf: 'stretch', gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Coin size={26} />
                    <Txt v="numBig" accessibilityLabel={t('guide.a11yPrice', { n: num(price) })}>
                      {num(price)}
                    </Txt>
                    {price < item.price && (
                      <View style={{ gap: 2 }}>
                        <Txt v="small" color="muted" style={{ textDecorationLine: 'line-through' }}>
                          {num(item.price)}
                        </Txt>
                        <Txt v="label" color="accent">
                          {t('guide.discountOff', { n: discountPercent })}
                        </Txt>
                      </View>
                    )}
                  </View>
                  <Txt v="small" color={after.ok ? 'muted' : 'bad'} style={{ textAlign: 'center', fontFamily: after.ok ? f.body : f.bodySemi }}>
                    {after.ok ? t('guide.afterBuy', { have: num(coins), left: num(after.balance) }) : t('guide.missing', { n: num(after.missing), name: item.name })}
                  </Txt>
                </View>

                <View style={{ alignSelf: 'stretch', gap: 10 }}>
                  {after.ok ? (
                    <Button label={t('guide.buy')} onPress={confirm} />
                  ) : (
                    <Button label={t('guide.getCoins')} onPress={onGetCoins} />
                  )}
                  <Button label={t('guide.notNow')} tone="quiet" onPress={onClose} />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
