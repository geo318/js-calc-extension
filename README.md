# @geo318/safe-calc

Zero-runtime-dependency, TypeScript-first decimal arithmetic and currency formatting.

```ts
import { calc, formatMoney, sum, toMinorUnits } from '@geo318/safe-calc';

calc('0.1').add('0.2').toString();          // "0.3"
calc('0.001').add('0.001').toString();      // "0.002"
calc('1.005').round(2).toString();          // "1.01"
calc('1.005').round(2, 'half-even').toFixed(2); // "1.00"

const subtotal = sum(['19.99', '4.50']);
const total = subtotal.add(subtotal.percentOf('18')).round(2);
formatMoney(total, { currency: 'GEL', locale: 'ka-GE' });
toMinorUnits(total);                      // 2890n
```

**v2 is a breaking release.** Root imports no longer modify `Number.prototype`.
See [MIGRATION.md](./MIGRATION.md) and [CHANGELOG.md](./CHANGELOG.md).

## Install and import

```sh
npm install @geo318/safe-calc
```

```ts
import { calc, add, formatMoney } from '@geo318/safe-calc';
```

```js
const { calc, add, formatMoney } = require('@geo318/safe-calc');
```

Node.js 22+ is supported. Browser builds need ES2022/BigInt and modern
`Intl.NumberFormat` decimal-string support. Formatting feature-detects that
support and throws instead of silently converting through a binary number.
The pure root entry is side-effect-free for bundlers. There are no runtime
packages, network calls, global precision settings, or automatic prototype patches.

## Arithmetic contract

`calc(value)` and `new Decimal(value)` accept a decimal string, a finite number,
a `bigint`, or a Decimal from the same module instance. Instances are immutable.
All arithmetic and aggregate functions return Decimal objects.

Prefer **strings at data boundaries**. `calc(0.1 + 0.2)` receives the already
rounded JavaScript value; it cannot recover the intended `0.3`. Use
`calc('0.1').add('0.2')`. Unsafe integer number inputs are rejected; use strings
or bigint for values beyond `Number.MAX_SAFE_INTEGER`.

Addition, subtraction, multiplication, remainder, and percentage calculations
are exact within the documented resource limits. They do **not** round each
step. Division is different: it rounds to **20 decimal places by default**, with
half-up rounding. Choose precision explicitly when that default is unsuitable.

```ts
calc('1').divide('3').toString();                    // "0.33333333333333333333"
calc('1').divide('3', { precision: 6 }).toString();   // "0.333333"
calc('5').divide('2', { precision: 0, rounding: 'half-even' }).toString(); // "2"
calc('1').divide('3').multiply('3').toString();        // "0.99999999999999999999"
```

A terminating quotient requiring more than the requested precision is rounded
too. This is a finite-decimal library, not an exact rational or symbolic system.
Rounding policy belongs at your domain boundary; do not assume that rounding
only a grand total is appropriate for every tax or billing system.

### Fluent and functional APIs

| API | Meaning |
| --- | --- |
| `calc(a).add(b)`, `add(a, b)` | Exact addition |
| `.subtract(b)`, `subtract(a, b)` | Exact subtraction |
| `.multiply(b)`, `multiply(a, b)` | Exact multiplication |
| `.divide(b, options)`, `divide(a, b, options)` | Division with decimal-place precision |
| `.remainder(b)` | JS-style remainder; sign follows the dividend |
| `.round(digits = 2, mode = 'half-up')`, `round(value, digits, mode)` | Explicit rounding |
| `.percent()` | Ratio to percentage points: `0.456` becomes `45.6` |
| `.percentOf(rate)` | `rate` percent of this amount: `calc(200).percentOf(15)` is `30` |
| `.abs()`, `.negate()` | Absolute value and sign change |
| `.compare(b)` | Returns `-1`, `0`, or `1` |
| `.eq/.lt/.lte/.gt/.gte(b)` | Exact comparisons |
| `.isZero()`, `.isInteger()`, `.decimalPlaces` | Inspect the normalized value |
| `.clamp(lower, upper)` | Clamp to inclusive bounds; reversed bounds throw |
| `sum(values)`, `average(values, divisionOptions?)`, `min(values)`, `max(values)` | Iterable aggregates |

`sum([])` is zero. Empty `average`, `min`, and `max` throw `EMPTY_INPUT`.
Passing a zero divisor to division or remainder throws `DIVISION_BY_ZERO`.

### Rounding modes

| Mode | Rule | `2.5` to integer | `-2.5` to integer |
| --- | --- | --- | --- |
| `half-up` | Nearest; ties away from zero | 3 | -3 |
| `half-even` | Nearest; ties to even | 2 | -2 |
| `down` | Toward zero | 2 | -2 |
| `up` | Away from zero | 3 | -3 |
| `floor` | Toward negative infinity | 2 | -3 |
| `ceil` | Toward positive infinity | 3 | -2 |

### Output and serialization

```ts
calc('3').toString();             // "3"
calc('3').toFixed(3);             // "3.000"
calc('0.1').toNumber();           // 0.1
JSON.stringify({ amount: calc('12.30') }); // '{"amount":"12.3"}'
```

`toNumber()` requires a safe-magnitude decimal-string round trip. It rejects
lost significant digits and underflow. This does **not** make binary numbers
exact: once converted, native JavaScript arithmetic has its normal limitations.
An intentional lossy conversion uses `toNumber({ allowPrecisionLoss: true })`;
non-finite results still throw. Native operators and `Number(decimal)` throw;
use arithmetic methods and explicit conversion. `String(decimal)` works.

Decimal JSON is a **string**, never a JSON number. Rehydrate with `calc(value)`.
Crossing different installed copies or ESM/CommonJS constructor instances also
uses `toString()` and `calc()`; do not rely on cross-instance `instanceof`.

## Parsing and errors

Accepted examples: `'12.50'`, `'-.5'`, `'1.'`, `'1e-7'`, `'+001.2'`, with
optional surrounding whitespace. Grouped, currency-prefixed, and partially
numeric strings are deliberately rejected: `'1,234.50'`, `'€12.50'`, `'12px'`.
There is no ambiguous automatic locale parsing, coercion of null/booleans to
zero, `eval`, or expression-string execution.

```ts
import { calc, SafeCalcError } from '@geo318/safe-calc';
try {
  calc('€12.50');
} catch (error) {
  if (error instanceof SafeCalcError && error.code === 'INVALID_INPUT') {
    // Ask the caller for an unformatted decimal value.
  } else {
    throw error;
  }
}
```

Stable error codes: `INVALID_INPUT`, `DIVISION_BY_ZERO`, `INVALID_PRECISION`,
`INVALID_ROUNDING`, `LIMIT_EXCEEDED`, `PRECISION_LOSS`, `EMPTY_INPUT`,
`INVALID_RANGE`, `UNSUPPORTED_INTL`, and `PROTOTYPE_CONFLICT`. Invalid locale or
other native Intl option values may also produce native `RangeError`/`TypeError`.
Unknown keys in calculation/formatting options are rejected to catch typos.

### Resource limits

Normalized coefficients have at most **2,000 decimal digits**; scales and
precision have at most **1,000 decimal places**. Input strings have at most
4,096 characters, fractional input parts at most 1,000 digits, and exponent
magnitudes at most 1,000. These checks bound per-operation work and avoid an
unbounded power-of-ten cache. This is not unlimited arbitrary precision.

Intl formatting supports at most **20 fraction digits** in this API and rejects
magnitudes that would format as infinity. Arithmetic may hold larger values;
use `toString()` or `toFixed()` for those. No promise is made about old browsers,
missing locale data, or formatting output identical across ICU/CLDR releases.

## Money and localized numbers

```ts
formatMoney('0', { currency: 'USD' });                 // "$0.00"
formatMoney('1234.5', { currency: 'EUR', locale: 'de-DE' }); // "1.234,50 €" (nonbreaking space)
formatMoney('9007199254740993.12', { currency: 'USD' }); // "$9,007,199,254,740,993.12"
formatMoney('12.6', { currency: 'JPY' });               // "¥13"
formatMoney('1.005', { currency: 'USD', rounding: 'half-even' }); // "$1.00"
```

`formatMoney(value, options)` requires a three-letter `currency`. Optional:
`locale` (default `en-US`), `digits` (currency default), `rounding`,
`currencyDisplay` (`symbol`, `narrowSymbol`, `code`, `name`), `currencySign`
(`standard`, `accounting`), and `useGrouping`.

`formatNumber(value, options?)` supports `locale`, `minimumFractionDigits`
(default 0), `maximumFractionDigits` (default max of 3 and the minimum),
`rounding`, and `useGrouping`. Separators and symbols are delegated to Intl;
formatted strings are never split on a hard-coded decimal separator.

### Integer minor units

```ts
import { toMinorUnits, fromMinorUnits } from '@geo318/safe-calc';
toMinorUnits('12.34');                   // 1234n
toMinorUnits('1.005');                   // throws PRECISION_LOSS
toMinorUnits('1.005', 2, 'half-up');      // 101n: explicit rounding
fromMinorUnits(1234n).toString();        // "12.34"
fromMinorUnits('12345', 3).toString();   // "12.345"
```

These helpers use an explicitly supplied digit count (default 2), not a
currency lookup. Minor units are bigint; do not pass them to a payment API as
numbers without checking that API's limits and converting explicitly.

## Optional v1-style adapter

```ts
import '@geo318/safe-calc/prototype';
(0.1).add(0.2);                   // 0.3
(1.005).add(0);                   // 1.01
(0.456).percent();               // 45.6
(0).format('USD');               // "$0.00"
```

The adapter retains per-operation rounding (default two decimal places) and
number results, so it is a migration aid, not the preferred precision API.
It installs non-enumerable methods, refuses existing conflicting methods, and
supports repeated ESM/CommonJS adapter imports. It intentionally does not
preserve v1's silent invalid-input coercion, zero-division result, or formatting
bugs. Never load both the old v1 patch and this adapter in the same process.

## Development

```sh
npm ci --ignore-scripts
npm run check             # strict type checks, regression tests, packed consumer checks
npm run test:reference    # Python 3 required: independent decimal oracle + properties
```

The reference check uses a fixed seed and Python's standard-library `decimal`
implementation, not a second copy of our algorithm. Python is development-only.
`PYTHON=/path/to/python` overrides the executable. CI checks Node 22 and 24;
release publishing repeats validation and requires an explicit release trigger.
See [docs/RELEASING.md](./docs/RELEASING.md).

## License

MIT. See [LICENSE](./LICENSE).
