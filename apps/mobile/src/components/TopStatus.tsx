import React from 'react';
import { View } from 'react-native';
import { CoinBadge } from '@/components/ui';
import { ProfileChip } from '@/components/ProfileChip';

/** O que fica no topo das telas com moedas: o perfil e o contador, lado a lado. */
export function TopStatus({ coins }: { coins: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minWidth: 0 }}>
      <ProfileChip />
      <CoinBadge coins={coins} />
    </View>
  );
}
