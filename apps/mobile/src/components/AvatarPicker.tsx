import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AvatarArt } from '@/art/Avatars';
import { Avatar } from '@/components/Avatar';
import { Button, Card, Txt } from '@/components/ui';
import { useI18n, type Key } from '@/i18n';
import { AVATAR_IDS, DEFAULT_AVATAR } from '@/lib/avatar';
import { deleteAvatarPhoto, pickAvatarPhoto } from '@/lib/avatarPhoto';
import { useApp } from '@/store/useApp';
import { useTheme } from '@/theme/ThemeProvider';

/** Escolher a foto do perfil: da galeria ou um dos 5 desenhos. */
export function AvatarPicker() {
  const { c } = useTheme();
  const { t } = useI18n();
  const avatar = useApp((s) => s.avatar);
  const setAvatar = useApp((s) => s.setAvatar);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const current = avatar ?? DEFAULT_AVATAR;

  const choosePreset = (id: (typeof AVATAR_IDS)[number]) => {
    deleteAvatarPhoto(avatar);
    setAvatar({ kind: 'preset', id });
  };

  const fromGallery = async () => {
    setError(false);
    setBusy(true);
    try {
      const next = await pickAvatarPhoto();
      if (next) {
        deleteAvatarPhoto(avatar);
        setAvatar(next);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ gap: 14, alignItems: 'center' }}>
      <Txt v="title" style={{ alignSelf: 'flex-start' }}>
        {t('avatar.title')}
      </Txt>
      <Avatar avatar={avatar} size={96} />
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        {AVATAR_IDS.map((id) => {
          const on = current.kind === 'preset' && current.id === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t(`avatar.${id}` as Key)}
              onPress={() => choosePreset(id)}
              style={{ borderRadius: 999, padding: 3, borderWidth: 2, borderColor: on ? c.accent : 'transparent' }}
            >
              <AvatarArt id={id} size={44} />
            </Pressable>
          );
        })}
      </View>
      <View style={{ alignSelf: 'stretch', gap: 8 }}>
        <Button label={t('avatar.gallery')} tone="quiet" disabled={busy} onPress={() => void fromGallery()} />
        {current.kind === 'photo' && <Button label={t('avatar.remove')} tone="quiet" onPress={() => choosePreset('bean')} />}
      </View>
      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t('avatar.error')}
        </Txt>
      )}
      <Txt v="small" color="muted" style={{ alignSelf: 'stretch' }}>
        {t('avatar.hint')}
      </Txt>
    </Card>
  );
}
