import test from 'node:test';
import assert from 'node:assert/strict';
import { GOOGLE_TEST_BANNER, pickBannerUnit, shouldShowAds } from './adsRules';

test('em desenvolvimento o banner usa sempre o bloco de teste', () => {
  assert.equal(pickBannerUnit(true, 'ca-app-pub-1/2'), GOOGLE_TEST_BANNER);
  assert.equal(pickBannerUnit(true, undefined), GOOGLE_TEST_BANNER);
});

test('no release o bloco vem do painel; sem ele, não há anúncio', () => {
  assert.equal(pickBannerUnit(false, ' ca-app-pub-1/2 '), 'ca-app-pub-1/2');
  assert.equal(pickBannerUnit(false, ''), null);
  assert.equal(pickBannerUnit(false, undefined), null);
});

test('quem removeu os anúncios, ou não tem bloco, ou está num ambiente sem SDK não vê banner', () => {
  const base = { adFree: false, unitId: 'x', supported: true };
  assert.equal(shouldShowAds(base), true);
  assert.equal(shouldShowAds({ ...base, adFree: true }), false);
  assert.equal(shouldShowAds({ ...base, unitId: null }), false);
  assert.equal(shouldShowAds({ ...base, supported: false }), false);
});
