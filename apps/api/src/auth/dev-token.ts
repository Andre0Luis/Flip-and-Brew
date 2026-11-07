// npm run dev:token -- ana@exemplo.com [--admin]   (imprime um token para testar a API local com curl)
import { randomUUID } from 'node:crypto';
import { loadConfig } from '../config.js';
import { signDevToken } from './dev.js';

const cfg = loadConfig();
if (cfg.authProvider !== 'dev' || cfg.env === 'production' || !cfg.devJwtSecret) {
  throw new Error('dev:token só funciona com AUTH_PROVIDER=dev fora de produção.');
}
const args = process.argv.slice(2);
const email = (args.find((a) => !a.startsWith('--')) ?? 'dev@exemplo.com').toLowerCase();
const id = randomUUID();
const token = await signDevToken(cfg.devJwtSecret, { id, email, emailVerified: true }, 24 * 3600);
console.error(`usuário ${email} (${id})${args.includes('--admin') ? ' — coloque o e-mail em ADMIN_EMAILS para virar admin' : ''}`);
console.log(token);
