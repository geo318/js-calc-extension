/** Decimal arithmetic with no binary floating-point operations on coefficients. */
export type DecimalInput = Decimal | string | number | bigint;
export type RoundingMode = 'half-up' | 'half-even' | 'down' | 'up' | 'floor' | 'ceil';
export type ErrorCode = 'INVALID_INPUT' | 'DIVISION_BY_ZERO' | 'INVALID_PRECISION' | 'INVALID_ROUNDING' | 'LIMIT_EXCEEDED' | 'PRECISION_LOSS' | 'EMPTY_INPUT' | 'INVALID_RANGE' | 'UNSUPPORTED_INTL' | 'PROTOTYPE_CONFLICT';
export interface DivisionOptions { precision?: number; rounding?: RoundingMode }
export interface NumberOptions { allowPrecisionLoss?: boolean }
export const MAX_SCALE = 1000;
export const MAX_DIGITS = 2000;
const MAX_INPUT_LENGTH = 4096;
const MODES: readonly RoundingMode[] = ['half-up', 'half-even', 'down', 'up', 'floor', 'ceil'];

export class SafeCalcError extends Error {
  constructor(public readonly code: ErrorCode, message: string) {
    super(message);
    this.name = 'SafeCalcError';
  }
}

export function validatePrecision(value: number, max = MAX_SCALE): void {
  if (!Number.isInteger(value) || value < 0 || value > max) {
    throw new SafeCalcError('INVALID_PRECISION', `Precision must be an integer between 0 and ${max}.`);
  }
}

/** Reject misspelled options instead of silently choosing a different calculation. */
export function validateOptions(value: unknown, allowed: readonly string[]): void {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) {
    throw new SafeCalcError('INVALID_INPUT', `Expected an options object with only: ${allowed.join(', ')}.`);
  }
}

function validateRounding(mode: RoundingMode): void {
  if (!MODES.includes(mode)) throw new SafeCalcError('INVALID_ROUNDING', 'Unknown rounding mode.');
}

function abs(value: bigint): bigint { return value < 0n ? -value : value; }
function pow10(exponent: number): bigint { return 10n ** BigInt(exponent); }

function normalize(coefficient: bigint, scale: number): [bigint, number] {
  if (coefficient === 0n) return [0n, 0];
  while (scale > 0 && coefficient % 10n === 0n) { coefficient /= 10n; scale--; }
  if (scale > MAX_SCALE || abs(coefficient).toString().length > MAX_DIGITS) {
    throw new SafeCalcError('LIMIT_EXCEEDED', `Decimal exceeds ${MAX_DIGITS} coefficient digits or ${MAX_SCALE} decimal places.`);
  }
  return [coefficient, scale];
}

/** Round a rational integer quotient; ties are evaluated without floating point. */
function quotient(numerator: bigint, denominator: bigint, mode: RoundingMode): bigint {
  validateRounding(mode);
  if (denominator === 0n) throw new SafeCalcError('DIVISION_BY_ZERO', 'Cannot divide by zero.');
  if (denominator < 0n) { numerator = -numerator; denominator = -denominator; }
  const q = numerator / denominator;
  const r = numerator % denominator;
  if (r === 0n) return q;
  const direction = numerator < 0n ? -1n : 1n;
  const twice = abs(r) * 2n;
  const increment = mode === 'up'
    || (mode === 'floor' && direction < 0n)
    || (mode === 'ceil' && direction > 0n)
    || (mode === 'half-up' && twice >= denominator)
    || (mode === 'half-even' && (twice > denominator || (twice === denominator && abs(q) % 2n === 1n)));
  return increment ? q + direction : q;
}

function parse(value: Exclude<DecimalInput, Decimal>): [bigint, number] {
  if (typeof value === 'bigint') return normalize(value, 0);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new SafeCalcError('INVALID_INPUT', 'Input must be finite.');
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new SafeCalcError('PRECISION_LOSS', 'Unsafe integer input: pass a string or bigint instead.');
    }
    value = String(value);
  }
  if (typeof value !== 'string' || value.length > MAX_INPUT_LENGTH) {
    throw new SafeCalcError(typeof value === 'string' ? 'LIMIT_EXCEEDED' : 'INVALID_INPUT', 'Expected a decimal string, finite number, bigint, or Decimal.');
  }
  const match = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(value.trim());
  if (!match) throw new SafeCalcError('INVALID_INPUT', 'Invalid decimal. Currency symbols, grouping separators, and trailing text are not accepted.');
  const fraction = match[3] ?? match[4] ?? '';
  const exponent = Number(match[5] ?? 0);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > MAX_SCALE || fraction.length > MAX_SCALE) {
    throw new SafeCalcError('LIMIT_EXCEEDED', 'Input exponent or scale exceeds the supported limit.');
  }
  let coefficient = BigInt((match[1] === '-' ? '-' : '') + (match[2] ?? '0') + fraction);
  let scale = fraction.length - exponent;
  if (scale < 0) { coefficient *= pow10(-scale); scale = 0; }
  return normalize(coefficient, scale);
}

/** Immutable base-10 decimal. Prefer string inputs at external data boundaries. */
export class Decimal {
  readonly #coefficient: bigint;
  readonly #scale: number;

  constructor(value: DecimalInput) {
    [this.#coefficient, this.#scale] = value instanceof Decimal
      ? [value.#coefficient, value.#scale]
      : parse(value);
    Object.freeze(this);
  }

  private static from(coefficient: bigint, scale: number): Decimal {
    const [c, s] = normalize(coefficient, scale);
    // Reuse the validated constructor without exposing internal representation.
    const digits = abs(c).toString().padStart(s + 1, '0');
    const text = s ? `${digits.slice(0, -s)}.${digits.slice(-s)}` : digits;
    return new Decimal((c < 0n ? '-' : '') + text);
  }

  private aligned(value: DecimalInput): [bigint, bigint, number] {
    const other = calc(value);
    const scale = Math.max(this.#scale, other.#scale);
    return [this.#coefficient * pow10(scale - this.#scale), other.#coefficient * pow10(scale - other.#scale), scale];
  }

  add(value: DecimalInput): Decimal {
    const [a, b, scale] = this.aligned(value);
    return Decimal.from(a + b, scale);
  }
  subtract(value: DecimalInput): Decimal {
    const [a, b, scale] = this.aligned(value);
    return Decimal.from(a - b, scale);
  }
  multiply(value: DecimalInput): Decimal {
    const other = calc(value);
    return Decimal.from(this.#coefficient * other.#coefficient, this.#scale + other.#scale);
  }
  /** Division rounds to 20 decimal places by default; choose precision explicitly. */
  divide(value: DecimalInput, options: DivisionOptions = {}): Decimal {
    validateOptions(options, ['precision', 'rounding']);
    const { precision = 20, rounding = 'half-up' } = options;
    validatePrecision(precision);
    const other = calc(value);
    const shift = precision + other.#scale - this.#scale;
    const numerator = this.#coefficient * pow10(Math.max(shift, 0));
    const denominator = other.#coefficient * pow10(Math.max(-shift, 0));
    return Decimal.from(quotient(numerator, denominator, rounding), precision);
  }
  /** Truncated-division remainder: its sign follows the dividend, like JS %. */
  remainder(value: DecimalInput): Decimal {
    const [a, b, scale] = this.aligned(value);
    if (b === 0n) throw new SafeCalcError('DIVISION_BY_ZERO', 'Cannot take remainder with a zero divisor.');
    return Decimal.from(a % b, scale);
  }
  round(precision = 2, rounding: RoundingMode = 'half-up'): Decimal {
    validatePrecision(precision);
    validateRounding(rounding);
    return precision >= this.#scale ? this : Decimal.from(quotient(this.#coefficient, pow10(this.#scale - precision), rounding), precision);
  }
  abs(): Decimal { return Decimal.from(abs(this.#coefficient), this.#scale); }
  negate(): Decimal { return Decimal.from(-this.#coefficient, this.#scale); }
  /** Convert a ratio to percentage points: 0.456 -> 45.6 (no implicit rounding). */
  percent(): Decimal { return this.multiply(100); }
  /** Calculate rate percent of this amount: calc(200).percentOf(15) -> 30. */
  percentOf(rate: DecimalInput): Decimal {
    const other = calc(rate);
    return Decimal.from(this.#coefficient * other.#coefficient, this.#scale + other.#scale + 2);
  }
  compare(value: DecimalInput): -1 | 0 | 1 {
    const [a, b] = this.aligned(value);
    return a < b ? -1 : a > b ? 1 : 0;
  }
  eq(value: DecimalInput): boolean { return this.compare(value) === 0; }
  lt(value: DecimalInput): boolean { return this.compare(value) < 0; }
  lte(value: DecimalInput): boolean { return this.compare(value) <= 0; }
  gt(value: DecimalInput): boolean { return this.compare(value) > 0; }
  gte(value: DecimalInput): boolean { return this.compare(value) >= 0; }
  isZero(): boolean { return this.#coefficient === 0n; }
  isInteger(): boolean { return this.#scale === 0; }
  get decimalPlaces(): number { return this.#scale; }
  clamp(lower: DecimalInput, upper: DecimalInput): Decimal {
    const lo = calc(lower), hi = calc(upper);
    if (lo.gt(hi)) throw new SafeCalcError('INVALID_RANGE', 'Lower bound must not exceed upper bound.');
    return this.lt(lo) ? lo : this.gt(hi) ? hi : this;
  }
  toString(): string {
    const digits = abs(this.#coefficient).toString().padStart(this.#scale + 1, '0');
    const text = this.#scale ? `${digits.slice(0, -this.#scale)}.${digits.slice(-this.#scale)}` : digits;
    return (this.#coefficient < 0n ? '-' : '') + text;
  }
  toFixed(precision = 2, rounding: RoundingMode = 'half-up'): string {
    const rounded = this.round(precision, rounding);
    const [whole, fraction = ''] = rounded.toString().split('.');
    return precision ? `${whole}.${fraction.padEnd(precision, '0')}` : whole!;
  }
  /** Decimal-string round-trip guard, not a claim that binary numbers are exact. */
  toNumber(options: NumberOptions = {}): number {
    validateOptions(options, ['allowPrecisionLoss']);
    if (options.allowPrecisionLoss !== undefined && typeof options.allowPrecisionLoss !== 'boolean') throw new SafeCalcError('INVALID_INPUT', 'allowPrecisionLoss must be boolean.');
    const result = Number(this.toString());
    if (!Number.isFinite(result)) throw new SafeCalcError('PRECISION_LOSS', 'Decimal cannot be represented as a finite number.');
    if (!options.allowPrecisionLoss && (Math.abs(result) > Number.MAX_SAFE_INTEGER || !calc(result).eq(this))) {
      throw new SafeCalcError('PRECISION_LOSS', 'Conversion loses decimal digits. Keep a string or explicitly allow precision loss.');
    }
    return result;
  }
  /** JSON deliberately stores a decimal string, never an imprecise JSON number. */
  toJSON(): string { return this.toString(); }
  [Symbol.toPrimitive](hint: string): string {
    if (hint === 'string') return this.toString();
    throw new SafeCalcError('PRECISION_LOSS', 'Use decimal methods or explicit toNumber(), not JavaScript arithmetic operators.');
  }
}

export function calc(value: DecimalInput): Decimal { return value instanceof Decimal ? value : new Decimal(value); }
export function add(a: DecimalInput, b: DecimalInput): Decimal { return calc(a).add(b); }
export function subtract(a: DecimalInput, b: DecimalInput): Decimal { return calc(a).subtract(b); }
export function multiply(a: DecimalInput, b: DecimalInput): Decimal { return calc(a).multiply(b); }
export function divide(a: DecimalInput, b: DecimalInput, options?: DivisionOptions): Decimal { return calc(a).divide(b, options); }
export function round(value: DecimalInput, precision = 2, rounding: RoundingMode = 'half-up'): Decimal { return calc(value).round(precision, rounding); }
export function sum(values: Iterable<DecimalInput>): Decimal {
  let total = calc(0);
  for (const value of values) total = total.add(value);
  return total;
}
export function average(values: Iterable<DecimalInput>, options?: DivisionOptions): Decimal {
  let total = calc(0), count = 0n;
  for (const value of values) { total = total.add(value); count++; }
  if (!count) throw new SafeCalcError('EMPTY_INPUT', 'Cannot average an empty iterable.');
  return total.divide(count, options);
}
export function min(values: Iterable<DecimalInput>): Decimal {
  let result: Decimal | undefined;
  for (const value of values) { const d = calc(value); if (!result || d.lt(result)) result = d; }
  if (!result) throw new SafeCalcError('EMPTY_INPUT', 'Cannot find the minimum of an empty iterable.');
  return result;
}
export function max(values: Iterable<DecimalInput>): Decimal {
  let result: Decimal | undefined;
  for (const value of values) { const d = calc(value); if (!result || d.gt(result)) result = d; }
  if (!result) throw new SafeCalcError('EMPTY_INPUT', 'Cannot find the maximum of an empty iterable.');
  return result;
}
