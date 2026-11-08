import test from 'node:test';
import assert from 'node:assert/strict';
import { TUTORIAL_STEPS } from './tutorial';
import { dictionaries, LANGS } from '../i18n';

test('o tutorial termina no passo final e todo passo tem título e texto nos três idiomas', () => {
  assert.equal(TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1].id, 'done');
  assert.equal(new Set(TUTORIAL_STEPS.map((s) => s.id)).size, TUTORIAL_STEPS.length);
  for (const lang of LANGS) {
    for (const s of TUTORIAL_STEPS) {
      const d = dictionaries[lang] as Record<string, string>;
      assert.ok(d[`tutorial.${s.id}.title`], `${lang} tutorial.${s.id}.title`);
      assert.ok(d[`tutorial.${s.id}.body`], `${lang} tutorial.${s.id}.body`);
    }
  }
});
