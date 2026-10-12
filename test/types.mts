import { calc, add, average, formatMoney, toMinorUnits, Decimal, type DecimalInput, type RoundingMode } from '@geo318/safe-calc';
const input: DecimalInput = '0.1';
const mode: RoundingMode = 'half-even';
const result: Decimal = add(input, 2n).round(2, mode);
const text: string = result.toString();
const num: number = result.toNumber();
const cents: bigint = toMinorUnits('1.00');
const formatted: string = formatMoney(result, { currency: 'GEL', locale: 'ka-GE' });
average([input, 1], { precision: 3, rounding: mode });
void [text, num, cents, formatted];
// @ts-expect-error unsupported input
calc({ amount: 2 });
// @ts-expect-error invalid rounding mode
calc(1).round(2, 'bankers');
// @ts-expect-error currency required
formatMoney(1, {});
// @ts-expect-error Decimal is not a JS number
const invalid: number = calc(1);
void invalid;
// @ts-expect-error root import must not augment Number globally
(1).add(2);
