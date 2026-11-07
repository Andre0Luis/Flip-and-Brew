import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CHECKIN_HOUR, DEFAULT_MORNING_HOUR, REMINDER_DAYS, normalizeHour, planReminders } from './reminders';

const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m).getTime();
const base = { morning: true, checkin: true, morningHour: 8, checkinHour: 20, checkedToday: false };

test('de manhã cedo, hoje ainda tem os dois avisos e o plano cobre os dias seguintes', () => {
  const plan = planReminders({ ...base, now: at(7, 6) });
  assert.equal(plan.length, REMINDER_DAYS * 2);
  assert.equal(plan[0].kind, 'morning');
  assert.equal(plan[0].at, at(7, 8));
  assert.equal(plan[1].kind, 'checkin');
  assert.equal(plan[1].at, at(7, 20));
});

test('horário que já passou hoje não é agendado', () => {
  const plan = planReminders({ ...base, now: at(7, 9) });
  assert.equal(plan[0].kind, 'checkin');
  assert.equal(plan[0].at, at(7, 20));
  assert.equal(plan.length, REMINDER_DAYS * 2 - 1);
  const late = planReminders({ ...base, now: at(7, 21) });
  assert.equal(late[0].at, at(8, 8));
});

test('check-in já feito hoje tira só o lembrete de hoje', () => {
  const plan = planReminders({ ...base, now: at(7, 6), checkedToday: true });
  assert.equal(plan.find((p) => p.kind === 'checkin' && p.at === at(7, 20)), undefined);
  assert.ok(plan.find((p) => p.kind === 'checkin' && p.at === at(8, 20)));
  assert.ok(plan.find((p) => p.kind === 'morning' && p.at === at(7, 8)));
});

test('cada aviso se liga e desliga sozinho, e desligados não agendam nada', () => {
  assert.ok(planReminders({ ...base, now: at(7, 6), checkin: false }).every((p) => p.kind === 'morning'));
  assert.ok(planReminders({ ...base, now: at(7, 6), morning: false }).every((p) => p.kind === 'checkin'));
  assert.equal(planReminders({ ...base, now: at(7, 6), morning: false, checkin: false }).length, 0);
});

test('os ids são únicos por tipo e dia, para reagendar sem duplicar', () => {
  const ids = planReminders({ ...base, now: at(7, 6) }).map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids[0], 'daily-morning-2026-11-07');
});

test('horas fora do limite ou inválidas são corrigidas', () => {
  assert.equal(normalizeHour('morning', 2), 5);
  assert.equal(normalizeHour('morning', 15), 11);
  assert.equal(normalizeHour('checkin', 9), 12);
  assert.equal(normalizeHour('checkin', 23), 22);
  assert.equal(normalizeHour('morning', NaN), DEFAULT_MORNING_HOUR);
  assert.equal(normalizeHour('checkin', NaN), DEFAULT_CHECKIN_HOUR);
});
