# Number Prototype Extensions

This module provides extensions to the `Number` prototype to support various arithmetic operations and formatting with additional features such as parsing string inputs, handling floating point errors, and rounding results.

## Methods

### `Number.prototype.subtract(num, round)`

Subtracts one number from another, with support for string inputs.

- **Parameters:**
  - `num` (number|string): The number or string to be subtracted.
  - `round` (number): The number to subtract from.
- **Returns:** `number` - The result of the subtraction.

### `Number.prototype.add(num, round = 2)`

Adds two numbers, with support for string inputs and optional rounding.

- **Parameters:**
  - `num` (number|string): The first number or numeric string to add.
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The result of the addition, rounded to the specified decimal places.

### `Number.prototype.multiply(num, round = 2)`

Multiplies two numbers, with support for string inputs and optional rounding.

- **Parameters:**
  - `num` (number|string): The first number or numeric string to multiply.
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The result of the multiplication, rounded to the specified decimal places.

### `Number.prototype.percent(round = 2)`

Multiplies a number by 100, with support for string inputs and optional rounding.

- **Parameters:**
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The result of the multiplication, rounded to the specified decimal places.

### `Number.prototype.divide(num, round = 2)`

Divides two numbers, with support for string inputs and optional rounding.

- **Parameters:**
  - `num` (number|string): The numerator, which can be a number or numeric string.
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The result of the division, rounded to the specified decimal places, or 0 if the divisor is 0.

### `Number.prototype.remainder(num = 2, round = 2)`

Gets the remainder of a division operation, with support for string inputs and optional rounding.

- **Parameters:**
  - `num` (number|string, optional): The numerator, which can be a number or numeric string. Defaults to 2.
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The remainder of the division, rounded to the specified decimal places, or 0 if the divisor is 0.

### `Number.prototype.format(currency = 'EUR', digits = 2, locale = 'us')`

Formats a number as currency.

- **Parameters:**
  - `currency` (string, optional): The currency symbol to use. Defaults to 'EUR'.
  - `digits` (number, optional): The number of decimal digits to include. Defaults to 2.
  - `locale` (string, optional): The locale to use for formatting. Defaults to 'us'.
- **Returns:** `string` - The formatted currency string.

## Helper Functions

### `parseFloatingPoint(num, digits = 2)`

Parses a number to a fixed number of decimal places.

- **Parameters:**
  - `num` (number): The number to parse.
  - `digits` (number, optional): The number of decimal places. Defaults to 2.
- **Returns:** `number` - The parsed number.

### `purge(x)`

Parses a string or number to a float, removing any non-numeric characters if necessary.

- **Parameters:**
  - `x` (number|string): The input to purge.
- **Returns:** `number` - The parsed number, or 0 if invalid.

### `formatCurrency(currency = 'EUR', maximumFractionDigits = 2, locale = 'us')`

Formats a number as currency using the specified parameters.

- **Parameters:**
  - `currency` (string, optional): The currency symbol to use. Defaults to 'EUR'.
  - `maximumFractionDigits` (number, optional): The maximum number of decimal digits. Defaults to 2.
  - `locale` (string, optional): The locale to use. Defaults to 'us'.
- **Returns:** `Intl.NumberFormat` - The formatter instance.

### `formatNumber(formatter = formatCurrency(), number = 0)`

Formats a number using a specified formatter.

- **Parameters:**
  - `formatter` (Intl.NumberFormat, optional): The formatter to use. Defaults to the `formatCurrency` function.
  - `number` (number, optional): The number to format. Defaults to 0.
- **Returns:** `string` - The formatted number.
