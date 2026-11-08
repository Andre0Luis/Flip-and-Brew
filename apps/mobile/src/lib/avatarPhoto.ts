import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { cleanAvatar, type Avatar } from './avatar';

/** Apaga a foto antiga da pasta do app (o arquivo é só do aparelho). Não falha se já não existir. */
export function deleteAvatarPhoto(avatar: Avatar | null): void {
  if (avatar?.kind !== 'photo') return;
  try {
    const f = new File(avatar.uri);
    if (f.exists) f.delete();
  } catch {
    // arquivo já removido: nada a fazer
  }
}

/**
 * Abre a galeria, deixa recortar em quadrado e copia a foto para a pasta do app (a que o seletor devolve é temporária).
 * Devolve o novo avatar, ou null se a pessoa cancelou. Lança erro se não deu para usar a foto.
 */
export async function pickAvatarPhoto(): Promise<Avatar | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
  const asset = res.canceled ? null : res.assets[0];
  if (!asset) return null;
  const dest = new File(Paths.document, `avatar-${Date.now()}.jpg`); // nome novo a cada foto, para a tela não reaproveitar a antiga
  await new File(asset.uri).copy(dest);
  const avatar = cleanAvatar({ kind: 'photo', uri: dest.uri });
  if (!avatar) throw new Error('avatar-uri');
  return avatar;
}
