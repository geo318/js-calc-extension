# Migrating from 1.0.9 to 2.0.0

## Recommended: stop patching Number.prototype

```ts
// v1
import '@geo318/safe-calc';
const before = (0.1).add(0.2);

// v2
import { calc } from '@geo318/safe-calc';
const after = calc('0.1').add('0.2').toString(); // "0.3"
```

The v2 root has named exports and no global mutation. Functions return an
immutable Decimal, not a number. Keep strings for storage/transport and use
`toNumber()` only at deliberate integration boundaries.

## Smaller initial migration

Change your side-effect import to `@geo318/safe-calc/prototype`. Number methods
keep their argument order, number return values, and default per-step rounding
of two decimal places (`remainder` still defaults its divisor to 2). Prefer the
pure API for new code; the adapter cannot keep arbitrary decimal precision in
native-number chains.

## Intentional behavior changes

| Before | v2 |
| --- | --- |
| Root import patches all Numbers | Pure root; prototype entry is explicit |
| Every arithmetic step rounds to 2 places | Pure API preserves decimals; division defaults to 20 places |
| Invalid inputs can become 0 or partially parsed values | Strict parsing and explicit errors |
| Division by zero returns 0 | Throws `DIVISION_BY_ZERO` |
| Remainder by zero returns NaN | Throws `DIVISION_BY_ZERO` |
| Rounding `1.005` to 2 can produce 1 | Produces `1.01` with half-up |
| `percent()` defaults to integer rounding in code | Pure method does not round; adapter defaults to 2 places |
| Currency zero is `"0"` | Correct currency output, e.g. `"$0.00"` |
| Global methods enumerable and overwrite collisions | Non-enumerable; conflicts fail before installation |
| Unsafe numbers can appear exact | Unsafe integer inputs and lossy conversion are rejected |
| README numeric results show trailing zeros | Use `toFixed()` for fixed-width string output |

Use `.divide(value, { precision: 2, rounding: 'half-up' })`, not a numeric second
argument, in the pure API. `round(2, 'half-even')` requests ties-to-even.
Unknown option keys are errors, including misspelled precision options.

Remove currency symbols/grouping at a locale-aware UI boundary, or transmit a
canonical decimal string. Do not replace the old coercion with another regex
that can silently change an amount.

`formatMoney()` requires a currency and uses that currency's default fraction
digits. The adapter's `.format(currency, digits, locale)` keeps its positional
arguments but uses `en-US` instead of the old `us` default.

JSON serializes Decimals as strings. Arithmetic operators are intentionally
blocked; use `.add()`, `.compare()`, etc. For Decimals coming from another
installed copy or module format, pass `.toString()` into your local `calc()`.

Node 22+ is the declared runtime baseline. There are separate ESM/CommonJS
entry points and generated declarations; unpublished root `index.js` and the
handwritten global declarations are removed. Deep imports outside the exports
map are unsupported.

The old chain example was also arithmetically incorrect in the README:
`115611 - 111`, divided by 5, minus 9, plus 1 is **23092**, not 23100.8.
