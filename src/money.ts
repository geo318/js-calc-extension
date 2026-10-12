import { calc, SafeCalcError, validatePrecision, validateOptions, type Decimal, type DecimalInput, type RoundingMode } from './decimal.js';

export interface MoneyOptions {
  currency: string;
  locale?: string | string[];
  /** Defaults to the currency's standard fraction digits (JPY 0, USD/GEL 2, KWD 3). */
  digits?: number;
  rounding?: RoundingMode;
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  currencySign?: 'standard' | 'accounting';
  useGrouping?: boolean;
}
export interface FormatOptions {
  locale?: string | string[];
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  rounding?: RoundingMode;
  useGrouping?: boolean;
}

let exactIntl: boolean | undefined;
function formatExact(formatter: Intl.NumberFormat, value: string): string {
  // TypeScript's older Intl declarations omit decimal strings. Modern ECMA-402
  // accepts them without Number conversion. Never silently degrade on old engines.
  const format = (f: Intl.NumberFormat, text: string): string => (f.format as unknown as (n: string) => string)(text);
  exactIntl ??= format(new Intl.NumberFormat('en-US', { useGrouping: false, maximumFractionDigits: 20 }), '9007199254740993.12') === '9007199254740993.12';
  if (!exactIntl) throw new SafeCalcError('UNSUPPORTED_INTL', 'This runtime needs Intl.NumberFormat decimal-string support. Use toFixed() or upgrade the runtime.');
  if (!Number.isFinite(Number(value))) throw new SafeCalcError('LIMIT_EXCEEDED', 'Value exceeds the magnitude supported by Intl formatting; use toString() or toFixed().');
  return format(formatter, value);
}

export function formatMoney(value: DecimalInput, options: MoneyOptions): string {
  validateOptions(options, ['currency', 'locale', 'digits', 'rounding', 'currencyDisplay', 'currencySign', 'useGrouping']);
  const { currency, locale = 'en-US', rounding = 'half-up', currencyDisplay = 'symbol', currencySign = 'standard', useGrouping = true } = options;
  if (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency)) {
    throw new SafeCalcError('INVALID_INPUT', 'Currency must be a three-letter currency code.');
  }
  const base = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const digits = options.digits === undefined ? (base.resolvedOptions().maximumFractionDigits ?? 2) : options.digits;
  validatePrecision(digits, 20);
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency', currency, currencyDisplay, currencySign, useGrouping,
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
  return formatExact(formatter, calc(value).toFixed(digits, rounding));
}

export function formatNumber(value: DecimalInput, options: FormatOptions = {}): string {
  validateOptions(options, ['locale', 'minimumFractionDigits', 'maximumFractionDigits', 'rounding', 'useGrouping']);
  const { locale = 'en-US', minimumFractionDigits = 0, maximumFractionDigits = Math.max(3, minimumFractionDigits), rounding = 'half-up', useGrouping = true } = options;
  validatePrecision(minimumFractionDigits, 20);
  validatePrecision(maximumFractionDigits, 20);
  if (minimumFractionDigits > maximumFractionDigits) throw new SafeCalcError('INVALID_PRECISION', 'Minimum fraction digits exceed maximum fraction digits.');
  return formatExact(new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits, useGrouping }), calc(value).round(maximumFractionDigits, rounding).toString());
}

/** Return integer minor units, refusing sub-unit loss unless rounding is explicit. */
export function toMinorUnits(value: DecimalInput, digits = 2, rounding?: RoundingMode): bigint {
  validatePrecision(digits);
  let decimal = calc(value);
  if (rounding !== undefined) decimal = decimal.round(digits, rounding);
  else if (decimal.decimalPlaces > digits) throw new SafeCalcError('PRECISION_LOSS', 'Amount has fractional minor units; supply a rounding mode explicitly.');
  return BigInt(decimal.toFixed(digits).replace('.', ''));
}

export function fromMinorUnits(value: bigint | string | number, digits = 2): Decimal {
  validatePrecision(digits);
  const units = calc(value);
  if (!units.isInteger()) throw new SafeCalcError('INVALID_INPUT', 'Minor units must be an integer.');
  const text = units.toString();
  const negative = text.startsWith('-');
  const padded = (negative ? text.slice(1) : text).padStart(digits + 1, '0');
  return calc((negative ? '-' : '') + (digits ? `${padded.slice(0, -digits)}.${padded.slice(-digits)}` : padded));
}
