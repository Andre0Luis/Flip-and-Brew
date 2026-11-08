import React from 'react';
import { Image, View } from 'react-native';
import { AvatarArt } from '@/art/Avatars';
import { DEFAULT_AVATAR, type Avatar as AvatarValue } from '@/lib/avatar';
import { useTheme } from '@/theme/ThemeProvider';

/** O avatar do perfil, sempre redondo: foto da galeria ou um dos desenhos. Sem escolha, o grão. */
export function Avatar({ avatar, size = 28 }: { avatar: AvatarValue | null; size?: number }) {
  const { c } = useTheme();
  const a = avatar ?? DEFAULT_AVATAR;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: c.soft }}>
      {a.kind === 'photo' ? <Image source={{ uri: a.uri }} style={{ width: size, height: size }} resizeMode="cover" accessibilityIgnoresInvertColors /> : <AvatarArt id={a.id} size={size} />}
    </View>
  );
}
