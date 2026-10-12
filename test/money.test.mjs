import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calc, formatMoney, formatNumber, toMinorUnits, fromMinorUnits } from '../dist/esm/index.js';
const throws = (fn, code) => assert.throws(fn, { code });
test('money preserves zero, significant integer digits, and rounding', () => {
  assert.equal(formatMoney(0, { currency: 'USD' }), '$0.00');
  assert.equal(formatMoney('9007199254740993.12', { currency: 'USD' }), '$9,007,199,254,740,993.12');
  assert.equal(formatMoney('1.005', { currency: 'USD' }), '$1.01');
  assert.equal(formatMoney('1.005', { currency: 'USD', rounding: 'half-even' }), '$1.00');
  assert.equal(formatMoney(-10, { currency: 'USD', currencySign: 'accounting' }), '($10.00)');
  assert.equal(formatMoney(1234.5, { currency: 'EUR', locale: 'de-DE' }), '1.234,50\u00a0€');
  assert.equal(formatMoney('12.6', { currency: 'JPY' }), '¥13');
  assert.ok(formatMoney('1.2345', { currency: 'KWD' }).endsWith('1.235'));
  assert.ok(formatMoney('1234.5', { currency: 'GEL', locale: 'ka-GE' }).includes('₾'));
  assert.equal(formatMoney(0, { currency: 'USD', digits: 0 }), '$0');
  assert.equal(formatMoney(1234, { currency: 'USD', useGrouping: false }), '$1234.00');
});
test('decimal formatting supports localized separators and explicit precision', () => {
  assert.equal(formatNumber('1234.5678'), '1,234.568');
  assert.equal(formatNumber('1234.5', { locale: 'de-DE', minimumFractionDigits: 2 }), '1.234,50');
  assert.equal(formatNumber(1, { minimumFractionDigits: 5 }), '1.00000');
  assert.equal(formatNumber('1.005', { maximumFractionDigits: 2, rounding: 'half-even' }), '1');
  assert.equal(formatNumber('9007199254740993.12', { useGrouping: false }), '9007199254740993.12');
});
test('formatting rejects invalid precision, currency, and overflow', () => {
  for (const currency of ['', '$', 'US', 'USDD', null]) throws(() => formatMoney(1, { currency }), 'INVALID_INPUT');
  throws(() => formatMoney(1, { currency: 'USD', digits: -1 }), 'INVALID_PRECISION');
  throws(() => formatMoney(1, { currency: 'USD', digits: 21 }), 'INVALID_PRECISION');
  throws(() => formatNumber(1, { minimumFractionDigits: 4, maximumFractionDigits: 2 }), 'INVALID_PRECISION');
  throws(() => formatNumber('1e1000'), 'LIMIT_EXCEEDED');
  throws(() => formatMoney('1e1000', { currency: 'USD' }), 'LIMIT_EXCEEDED');
  assert.throws(() => formatMoney(1, { currency: 'USD', locale: '_' }), RangeError);
});
test('minor units remain bigint, reject hidden rounding, and round-trip', () => {
  assert.equal(toMinorUnits('12.34'), 1234n);
  assert.equal(toMinorUnits('-0.01'), -1n);
  assert.equal(toMinorUnits('12.34', 3), 12340n);
  assert.equal(toMinorUnits('9007199254740993.12'), 900719925474099312n);
  throws(() => toMinorUnits('1.005'), 'PRECISION_LOSS');
  assert.equal(toMinorUnits('1.005', 2, 'half-up'), 101n);
  assert.equal(toMinorUnits('1.005', 2, 'half-even'), 100n);
  assert.equal(fromMinorUnits(-1n).toString(), '-0.01');
  assert.equal(fromMinorUnits('12345', 3).toString(), '12.345');
  assert.equal(fromMinorUnits(12, 0).toString(), '12');
  throws(() => fromMinorUnits('1.2'), 'INVALID_INPUT');
  throws(() => fromMinorUnits(9007199254740992), 'PRECISION_LOSS');
  for (let i = -1000; i <= 1000; i++) assert.ok(fromMinorUnits(toMinorUnits(calc(i).divide(100))).eq(calc(i).divide(100)));
});
test('formatting options reject typos and null precision', () => {
  for (const options of [null, [], { currency: 'USD', digit: 2 }]) throws(() => formatMoney(1, options), 'INVALID_INPUT');
  throws(() => formatMoney(1, { currency: 'USD', digits: null }), 'INVALID_PRECISION');
  throws(() => formatNumber(1, { maxFractionDigits: 2 }), 'INVALID_INPUT');
});
