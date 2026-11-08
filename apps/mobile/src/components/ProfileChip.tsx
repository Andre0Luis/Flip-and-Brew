import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/Avatar';
import { Txt } from '@/components/ui';
import { useI18n } from '@/i18n';
import { coffeeEmoji, firstName } from '@/lib/avatar';
import { useApp } from '@/store/useApp';
import { useTheme } from '@/theme/ThemeProvider';

/** Foto redonda, primeiro nome e o emoji do café, no topo das telas. Toca para abrir o perfil. */
export function ProfileChip() {
  const { c, r } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const name = firstName(useApp((s) => s.profile.name));
  const method = useApp((s) => s.profile.method);
  const avatar = useApp((s) => s.avatar);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('profile.chipA11y', { name: name || t('profile.chip') })}
      onPress={() => router.push('/perfil')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, minWidth: 0, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: r.pill, paddingVertical: 4, paddingLeft: 4, paddingRight: 10 }}
    >
      <Avatar avatar={avatar} size={26} />
      <Txt v="small" numberOfLines={1} style={{ flexShrink: 1 }}>
        {name || t('profile.chip')}
      </Txt>
      {!!name && <Txt v="small">{coffeeEmoji(method)}</Txt>}
    </Pressable>
  );
}
