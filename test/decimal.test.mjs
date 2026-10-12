import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calc, Decimal, SafeCalcError, MAX_SCALE, MAX_DIGITS, add, subtract, multiply, divide, round, sum, average, min, max } from '../dist/esm/index.js';
const throws = (fn, code) => assert.throws(fn, error => error instanceof SafeCalcError && error.code === code);

for (const [input, expected] of [ ['.001', '0.001'], ['+001.200', '1.2'], ['-.5', '-0.5'], ['1.', '1'], ['1e-7', '0.0000001'], ['-12.34e2', '-1234'], ['1E+3', '1000'], [' 2.50 ', '2.5'], ['-0.000', '0'], [0.1, '0.1'], [10n, '10'], [Number.MIN_VALUE, '0.' + '0'.repeat(323) + '5'] ]) {
  test(`parse ${String(input)}`, () => assert.equal(calc(input).toString(), expected));
}
for (const input of ['', ' ', 'foo', '€12.50', '1,000', '12cats', '1_000', '0x10', '0b10', '1e', '1 2', '.', '--1', 'Infinity', 'NaN', NaN, Infinity, -Infinity, null, undefined, true, {}, [], new Number(1), Symbol('1')]) {
  test(`reject invalid ${String(input)}`, () => throws(() => calc(input), 'INVALID_INPUT'));
}
for (const digits of [-1, 1.2, NaN, Infinity, '2', null, MAX_SCALE + 1]) {
  test(`reject precision ${String(digits)}`, () => {
    throws(() => calc(1).round(digits), 'INVALID_PRECISION');
    throws(() => calc(1).divide(2, { precision: digits }), 'INVALID_PRECISION');
  });
}
test('exact arithmetic and no per-step rounding', () => {
  assert.equal(calc('.1').add('.2').toString(), '0.3');
  assert.equal(calc('.001').add('.001').toString(), '0.002');
  assert.equal(calc('1.005').round(2).toString(), '1.01');
  assert.equal(calc('.01').multiply('.01').toString(), '0.0001');
  assert.equal(calc('100.001').subtract('.002').toString(), '99.999');
  assert.equal(calc('.3333').multiply(3).toString(), '0.9999');
  assert.equal(calc('9007199254740993').add(1).toString(), '9007199254740994');
  assert.equal(calc(115611).subtract('111').divide(5).subtract(9).add(1).toString(), '23092');
});
test('standalone functions match fluent methods', () => {
  assert.equal(add('.1', '.2').toString(), '0.3');
  assert.equal(subtract(3, 1).toString(), '2');
  assert.equal(multiply(3, '.1').toString(), '0.3');
  assert.equal(divide(1, 8, { precision: 3 }).toString(), '0.125');
  assert.equal(round('2.675').toString(), '2.68');
});
const ties = { 'half-up': ['3', '-3'], 'half-even': ['2', '-2'], down: ['2', '-2'], up: ['3', '-3'], floor: ['2', '-3'], ceil: ['3', '-2'] };
for (const [mode, [positive, negative]] of Object.entries(ties)) {
  test(`rounding ${mode}`, () => {
    assert.equal(calc('2.5').round(0, mode).toString(), positive);
    assert.equal(calc('-2.5').round(0, mode).toString(), negative);
    assert.equal(calc(5).divide(2, { precision: 0, rounding: mode }).toString(), positive);
    assert.equal(calc(5).divide(-2, { precision: 0, rounding: mode }).toString(), negative);
    assert.equal(calc(4).divide(2, { precision: 0, rounding: mode }).toString(), '2');
  });
}
test('rounding away from ties, parity, and negative near-zero', () => {
  assert.equal(calc('3.5').round(0, 'half-even').toString(), '4');
  assert.equal(calc('2.51').round(0, 'half-even').toString(), '3');
  assert.equal(calc('2.49').round(0, 'half-up').toString(), '2');
  assert.equal(calc('-0.005').round(2).toString(), '-0.01');
  assert.equal(calc('-0.001').round(2, 'ceil').toString(), '0');
  assert.equal(calc('-0.001').round(2, 'floor').toString(), '-0.01');
  throws(() => calc(0).round(2, 'unknown'), 'INVALID_ROUNDING');
  throws(() => calc(1).divide(2, { rounding: 'unknown' }), 'INVALID_ROUNDING');
});
test('division and signed decimal remainder', () => {
  assert.equal(calc(1).divide(3).toString(), '0.33333333333333333333');
  assert.equal(calc(1).divide(6, { precision: 4 }).toString(), '0.1667');
  assert.equal(calc('.001').divide(2, { precision: 4 }).toString(), '0.0005');
  assert.equal(calc(1).divide('.001').toString(), '1000');
  assert.equal(calc('-5.5').remainder(2).toString(), '-1.5');
  assert.equal(calc('5.5').remainder(-2).toString(), '1.5');
  assert.equal(calc('.3').remainder('.1').toString(), '0');
  for (const zero of [0, -0, '0.000', 0n]) {
    throws(() => calc(1).divide(zero), 'DIVISION_BY_ZERO');
    throws(() => calc(1).remainder(zero), 'DIVISION_BY_ZERO');
  }
});
test('percentages have distinct, exact meanings', () => {
  assert.equal(calc('.456').percent().toString(), '45.6');
  assert.equal(calc(200).percentOf(15).toString(), '30');
  assert.equal(calc('.001').percentOf('.001').toString(), '0.00000001');
});
test('comparisons, signs, clamp, and immutable instances', () => {
  const d = calc('1.200');
  assert.equal(d.decimalPlaces, 1);
  assert.equal(calc(d), d);
  assert.ok(new Decimal(d).eq(d));
  d.add(5);
  assert.equal(d.toString(), '1.2');
  assert.ok(Object.isFrozen(d));
  assert.ok(d.eq('1.2') && d.lt(2) && d.lte('1.2') && d.gt(-1) && d.gte('1.2'));
  assert.equal(d.compare(2), -1);
  assert.equal(d.compare(1), 1);
  assert.ok(calc(0).isZero() && calc(10).isInteger() && !d.isInteger());
  assert.equal(d.negate().abs().toString(), '1.2');
  assert.equal(d.clamp(2, 3).toString(), '2');
  assert.equal(d.clamp(-1, 1).toString(), '1');
  assert.equal(d.clamp(0, 2), d);
  throws(() => d.clamp(2, 1), 'INVALID_RANGE');
});
test('iterable aggregations and empty collections', () => {
  assert.equal(sum(['.1', '.2']).toString(), '0.3');
  assert.equal(sum([]).toString(), '0');
  assert.equal(average(['.1', '.2']).toString(), '0.15');
  assert.equal(average([1, 2, 2], { precision: 2 }).toString(), '1.67');
  assert.equal(min(new Set(['3', '-1', '2'])).toString(), '-1');
  assert.equal(max([0, -1, 2]).toString(), '2');
  assert.equal(sum((function* () { yield '.1'; yield '.2'; })()).toString(), '0.3');
  for (const fn of [average, min, max]) throws(() => fn([]), 'EMPTY_INPUT');
});
test('serialization, fixed width, and guarded number conversion', () => {
  assert.equal(calc(3).toFixed(3), '3.000');
  assert.equal(calc('-1.005').toFixed(2), '-1.01');
  assert.equal(calc('-0.001').toFixed(2), '0.00');
  assert.equal(calc('2.5').toFixed(0), '3');
  assert.equal(JSON.stringify({ amount: calc('9007199254740993.12') }), '{"amount":"9007199254740993.12"}');
  assert.equal(String(calc('.1')), '0.1');
  assert.equal(calc('.1').toNumber(), .1);
  assert.equal(calc(Number.MAX_SAFE_INTEGER).toNumber(), Number.MAX_SAFE_INTEGER);
  for (const text of ['9007199254740993', '.1234567890123456789', '1e-1000']) throws(() => calc(text).toNumber(), 'PRECISION_LOSS');
  assert.equal(calc('9007199254740993').toNumber({ allowPrecisionLoss: true }), 9007199254740992);
  throws(() => calc('1e1000').toNumber({ allowPrecisionLoss: true }), 'PRECISION_LOSS');
  throws(() => calc(Number.MAX_SAFE_INTEGER + 1), 'PRECISION_LOSS');
  throws(() => Number(calc(1)), 'PRECISION_LOSS');
  throws(() => calc(1) + 1, 'PRECISION_LOSS');
});
test('resource boundaries and zero normalization', () => {
  assert.equal(calc('1e-1000').decimalPlaces, MAX_SCALE);
  assert.equal(calc('9'.repeat(MAX_DIGITS)).toString().length, MAX_DIGITS);
  assert.equal(calc('0e-1000').toString(), '0');
  assert.equal(calc('1e-500').multiply('1e-500').decimalPlaces, 1000);
  assert.equal(calc('1e-1000').multiply(0).toString(), '0');
  for (const input of ['1e1001', '1e-1001', '1e99999999999999999999', '9'.repeat(MAX_DIGITS + 1), '0'.repeat(4097), '0.' + '0'.repeat(1001)]) throws(() => calc(input), 'LIMIT_EXCEEDED');
  throws(() => calc('1e-1000').multiply('.1'), 'LIMIT_EXCEEDED');
  throws(() => calc('9'.repeat(MAX_DIGITS)).multiply(10), 'LIMIT_EXCEEDED');
});
test('runtime option validation rejects typos and unsafe coercion', () => {
  for (const options of [null, 2, [], { precison: 2 }]) throws(() => calc(1).divide(3, options), 'INVALID_INPUT');
  for (const options of [null, true, { allowPrecisionLoss: 'false' }, { unsafe: true }]) throws(() => calc(1).toNumber(options), 'INVALID_INPUT');
});
