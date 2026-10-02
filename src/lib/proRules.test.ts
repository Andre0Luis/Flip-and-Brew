import test from 'node:test';
import assert from 'node:assert/strict';
import { coinsOf, proFromCustomerInfo } from './proRules';

test('moedas vêm do número no fim do id', () => {
  assert.equal(coinsOf('coins_500'), 500);
  assert.equal(coinsOf('lifetime'), 0);
  assert.equal(coinsOf('yearly'), 0);
});

test('pro ativo só com o entitlement flip_and_brew_pro', () => {
  const none = proFromCustomerInfo({ entitlements: { active: {} } });
  assert.equal(none.active, false);
  const on = proFromCustomerInfo({ entitlements: { active: { flip_and_brew_pro: { expirationDate: null, willRenew: false } } } });
  assert.equal(on.active, true);
  assert.equal(on.expiresAt, null);
});
