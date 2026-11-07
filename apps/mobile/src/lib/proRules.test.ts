import test from 'node:test';
import assert from 'node:assert/strict';
import { coinsOf, proFromCustomerInfo } from './proRules';

const none = { entitlements: { active: {} } };

test('moedas vêm do número no fim do id', () => {
  assert.equal(coinsOf('coins_500'), 500);
  assert.equal(coinsOf('lifetime'), 0);
  assert.equal(coinsOf('yearly'), 0);
});

test('pro ativo só com o entitlement flip_and_brew_pro', () => {
  const off = proFromCustomerInfo(none);
  assert.equal(off.active, false);
  const on = proFromCustomerInfo({ entitlements: { active: { flip_and_brew_pro: { expirationDate: null, willRenew: false } } } });
  assert.equal(on.active, true);
  assert.equal(on.expiresAt, null);
});

test('sem compra nenhuma, os anúncios aparecem', () => {
  assert.equal(proFromCustomerInfo(none).adFree, false);
  assert.equal(proFromCustomerInfo({ ...none, allPurchasedProductIdentifiers: ['coins_500'] }).adFree, false);
});

test('comprar a remoção tira os anúncios sem dar o Pro', () => {
  const byEntitlement = proFromCustomerInfo({ entitlements: { active: { remove_ads: { expirationDate: null, willRenew: false } } } });
  assert.equal(byEntitlement.adFree, true);
  assert.equal(byEntitlement.active, false);
  const byProduct = proFromCustomerInfo({ ...none, allPurchasedProductIdentifiers: ['coins_100', 'remove_ads'] });
  assert.equal(byProduct.adFree, true);
  assert.equal(byProduct.active, false);
});

test('o Pro também tira os anúncios', () => {
  const pro = proFromCustomerInfo({ entitlements: { active: { flip_and_brew_pro: { expirationDate: null, willRenew: true } } } });
  assert.equal(pro.active, true);
  assert.equal(pro.adFree, true);
});
