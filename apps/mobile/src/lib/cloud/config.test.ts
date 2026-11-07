import test from 'node:test';
import assert from 'node:assert/strict';
import { isApiConfigured, looksLikeSupabaseKey } from './config';

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.c2lnbmF0dXJl';
const base = { apiUrl: 'https://api.exemplo.com', supabaseUrl: 'https://abc.supabase.co' };

test('só uma chave com cara de chave do Supabase liga o backend próprio', () => {
  assert.equal(looksLikeSupabaseKey(JWT), true);
  assert.equal(looksLikeSupabaseKey('sb_publishable_AbC123-x_y'), true);
  assert.equal(looksLikeSupabaseKey('COLE_A_CHAVE_ANON'), false); // texto de exemplo esquecido no EAS
  assert.equal(looksLikeSupabaseKey('sb_secret_abc123'), false);
  assert.equal(looksLikeSupabaseKey(''), false);
  assert.equal(isApiConfigured({ ...base, supabaseAnonKey: JWT }), true);
  assert.equal(isApiConfigured({ ...base, supabaseAnonKey: 'COLE_A_CHAVE_ANON' }), false);
  assert.equal(isApiConfigured({ ...base, apiUrl: '', supabaseAnonKey: JWT }), false);
});
