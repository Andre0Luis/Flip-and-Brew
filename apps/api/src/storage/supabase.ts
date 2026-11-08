import type { StorageProvider } from './provider.js';

/**
 * Supabase Storage pela API REST, com a chave `service_role` (só no servidor). O balde é privado e nasce sozinho
 * na primeira vez (só JPEG, até 2 MB por arquivo: o app reduz e compacta antes de enviar).
 */
export function supabaseStorage(o: { url: string; serviceRoleKey: string; bucket?: string; fetchFn?: typeof fetch }): StorageProvider {
  const base = `${o.url.replace(/\/$/, '')}/storage/v1`;
  const bucket = o.bucket ?? 'posts';
  const doFetch = o.fetchFn ?? fetch;
  const headers = { apikey: o.serviceRoleKey, authorization: `Bearer ${o.serviceRoleKey}`, 'content-type': 'application/json' };
  let ready: Promise<void> | undefined;

  const ensureBucket = () =>
    (ready ??= doFetch(`${base}/bucket`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: bucket, name: bucket, public: false, file_size_limit: 2 * 1024 * 1024, allowed_mime_types: ['image/jpeg'] }),
    }).then(async (r) => {
      // 200 criado; 400/409 "already exists" também serve.
      if (!r.ok && r.status !== 400 && r.status !== 409) {
        ready = undefined;
        throw new Error(`storage bucket ${r.status}`);
      }
    }));

  return {
    async signUpload(path) {
      await ensureBucket();
      const r = await doFetch(`${base}/object/upload/sign/${bucket}/${path}`, { method: 'POST', headers });
      if (!r.ok) throw new Error(`storage sign upload ${r.status}`);
      const j = (await r.json()) as { url?: string };
      if (!j.url) throw new Error('storage sign upload sem url');
      return `${base}${j.url}`;
    },
    async signRead(paths, expiresIn) {
      const out = new Map<string, string>();
      if (!paths.length) return out;
      const r = await doFetch(`${base}/object/sign/${bucket}`, { method: 'POST', headers, body: JSON.stringify({ expiresIn, paths }) });
      if (!r.ok) return out;
      const list = (await r.json()) as { path?: string; signedURL?: string | null; error?: string | null }[];
      for (const it of list) if (it.path && it.signedURL && !it.error) out.set(it.path, `${base}${it.signedURL}`);
      return out;
    },
    async remove(paths) {
      if (!paths.length) return;
      await doFetch(`${base}/object/${bucket}`, { method: 'DELETE', headers, body: JSON.stringify({ prefixes: paths }) });
    },
  };
}
