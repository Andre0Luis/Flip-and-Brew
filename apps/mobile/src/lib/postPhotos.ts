import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { FileSystemUploadType, uploadAsync } from 'expo-file-system/legacy';

/** Lado maior depois de reduzir. Uma foto de celular (4 a 8 MB) costuma virar 150 a 400 KB. */
export const MAX_SIDE = 1280;
const QUALITY = 0.7;

/** Reduz (só se for maior que MAX_SIDE) e grava em JPEG compactado. Devolve o arquivo novo. */
export async function preparePhoto(photo: { uri: string; width: number; height: number }): Promise<string> {
  const ctx = ImageManipulator.manipulate(photo.uri);
  if (Math.max(photo.width, photo.height) > MAX_SIDE) ctx.resize(photo.width >= photo.height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  const image = await ctx.renderAsync();
  const saved = await image.saveAsync({ compress: QUALITY, format: SaveFormat.JPEG });
  return saved.uri;
}

/** Envia o JPEG para o link assinado do armazenamento (PUT com os bytes do arquivo). */
export async function uploadPhoto(url: string, uri: string): Promise<void> {
  const r = await uploadAsync(url, uri, { httpMethod: 'PUT', uploadType: FileSystemUploadType.BINARY_CONTENT, headers: { 'content-type': 'image/jpeg', 'x-upsert': 'false' } });
  if (r.status < 200 || r.status >= 300) throw Object.assign(new Error(`upload ${r.status}`), { status: r.status, code: 'upload_failed' });
}
