import React from 'react';
import { Pressable, View } from 'react-native';
import { Txt } from '@/components/ui';
import type { Person } from '@/lib/cloud/apiClient';
import { personInitial, personName } from '@/lib/community';
import { useTheme } from '@/theme/ThemeProvider';

/** Uma pessoa numa lista: inicial em círculo, nome e apelido; ações opcionais à direita. */
export function PersonRow({ person, onPress, right }: { person: Person; onPress?: () => void; right?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={personName(person)} onPress={onPress} disabled={!onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Txt v="title" color="accent">
            {personInitial(person)}
          </Txt>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt v="body" numberOfLines={1}>
            {personName(person)}
          </Txt>
          {!!person.handle && !!person.displayName && (
            <Txt v="small" color="muted" numberOfLines={1}>
              @{person.handle}
            </Txt>
          )}
        </View>
      </Pressable>
      {right}
    </View>
  );
}
