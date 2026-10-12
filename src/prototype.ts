/** Opt-in migration adapter. Root imports never mutate Number.prototype. */
import { calc, SafeCalcError, type DecimalInput } from './decimal.js';
import { formatMoney } from './money.js';

declare global {
  interface Number {
    add(value: DecimalInput, digits?: number): number;
    subtract(value: DecimalInput, digits?: number): number;
    multiply(value: DecimalInput, digits?: number): number;
    divide(value: DecimalInput, digits?: number): number;
    remainder(value?: DecimalInput, digits?: number): number;
    percent(digits?: number): number;
    format(currency?: string, digits?: number, locale?: string): string;
  }
}

const marker = Symbol.for('@geo318/safe-calc/prototype/v2');
const methods = {
  add(this: number, value: DecimalInput, digits = 2): number { return calc(this.valueOf()).add(value).round(digits).toNumber(); },
  subtract(this: number, value: DecimalInput, digits = 2): number { return calc(this.valueOf()).subtract(value).round(digits).toNumber(); },
  multiply(this: number, value: DecimalInput, digits = 2): number { return calc(this.valueOf()).multiply(value).round(digits).toNumber(); },
  divide(this: number, value: DecimalInput, digits = 2): number { return calc(this.valueOf()).divide(value, { precision: digits }).toNumber(); },
  remainder(this: number, value: DecimalInput = 2, digits = 2): number { return calc(this.valueOf()).remainder(value).round(digits).toNumber(); },
  percent(this: number, digits = 2): number { return calc(this.valueOf()).percent().round(digits).toNumber(); },
  format(this: number, currency = 'EUR', digits = 2, locale = 'en-US'): string { return formatMoney(this.valueOf(), { currency, digits, locale }); },
};
const names = Object.keys(methods) as (keyof typeof methods)[];
// Preflight every method before writing anything; never overwrite another library.
if (!Object.isExtensible(Number.prototype) && names.some(name => !Object.hasOwn(Number.prototype, name))) {
  throw new SafeCalcError('PROTOTYPE_CONFLICT', 'Number.prototype is not extensible. Use the pure API instead.');
}
for (const name of names) {
  const descriptor = Object.getOwnPropertyDescriptor(Number.prototype, name);
  if (descriptor && !(typeof descriptor.value === 'function' && Object.prototype.hasOwnProperty.call(descriptor.value, marker))) {
    throw new SafeCalcError('PROTOTYPE_CONFLICT', `Number.prototype.${name} already exists.`);
  }
}
for (const name of names) {
  if (!Object.getOwnPropertyDescriptor(Number.prototype, name)) {
    Object.defineProperty(methods[name], marker, { value: true });
    Object.defineProperty(Number.prototype, name, { value: methods[name], enumerable: false, writable: true, configurable: true });
  }
}
export {};
