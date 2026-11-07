import test from 'node:test';
import assert from 'node:assert/strict';
import { RECOVERY_REDIRECT, parseRecoveryUrl } from './recoveryLink';

test('o link de sucesso traz os tokens no fragmento', () => {
  const r = parseRecoveryUrl(`${RECOVERY_REDIRECT}#access_token=aaa.bbb.ccc&expires_in=3600&refresh_token=xyz&token_type=bearer&type=recovery`);
  assert.deepEqual(r, { kind: 'tokens', accessToken: 'aaa.bbb.ccc', refreshToken: 'xyz' });
});

test('também aceita os tokens na query', () => {
  assert.deepEqual(parseRecoveryUrl(`${RECOVERY_REDIRECT}?access_token=a&refresh_token=b`), { kind: 'tokens', accessToken: 'a', refreshToken: 'b' });
});

test('link vencido ou usado vira erro com o código do Supabase', () => {
  const r = parseRecoveryUrl(`${RECOVERY_REDIRECT}#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`);
  assert.deepEqual(r, { kind: 'error', code: 'otp_expired' });
  assert.deepEqual(parseRecoveryUrl(`${RECOVERY_REDIRECT}#error=access_denied`), { kind: 'error', code: 'access_denied' });
});

test('sem dados, ou só um dos tokens, não é um link de recuperação', () => {
  assert.equal(parseRecoveryUrl(null), null);
  assert.equal(parseRecoveryUrl(RECOVERY_REDIRECT), null);
  assert.equal(parseRecoveryUrl(`${RECOVERY_REDIRECT}#access_token=a`), null);
});
