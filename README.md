# Number Prototype Extensions

Enhance your JavaScript `Number` prototype with this module, offering robust arithmetic operations and formatting capabilities. This module handles floating point errors, parses string inputs, and ensures precise rounding.

![npm](https://img.shields.io/npm/v/number-prototype-extensions) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![Dependencies: None](https://img.shields.io/badge/Dependencies-None-brightgreen)

## Features

- **Arithmetic Operations:** Add, subtract, multiply, divide, and find remainders.
- **String Parsing:** Handles both numbers and numeric strings.
- **Rounding:** Optional rounding for all operations.
- **Currency Formatting:** Format numbers as currency.
- **Dependence-Free:** No external dependencies.
- **Type Checked:** Uses TypeScript for type checking.
- **Tested:** Utilizes Jest for robust testing.

## Methods

### `Number.prototype.subtract(num, round)`

Subtracts one number from another, with support for string inputs.

- **Parameters:**
  - `num` (number|string): The number or string to be subtracted.
  - `round` (number): The number of decimal places to round the result to.
- **Returns:** `number` - The result of the subtraction.

**Example:**
```javascript
(115611).subtract('111').divide(5).subtract(9).add(1); // Returns 23100.8
```

### `Number.prototype.add(num, round = 2)`

Adds two numbers, with support for string inputs and optional rounding.

- **Parameters:**
  - `num` (number|string): The number or numeric string to add.
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The result of the addition, rounded to the specified decimal places.

**Example:**
```javascript
(100.5).add('200.75', 1); // Returns 301.3
```

### `Number.prototype.multiply(num, round = 2)`

Multiplies two numbers, with support for string inputs and optional rounding.

- **Parameters:**
  - `num` (number|string): The number or numeric string to multiply.
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The result of the multiplication, rounded to the specified decimal places.

**Example:**
```javascript
(10).multiply('3.14159', 3); // Returns 31.416
```

### `Number.prototype.percent(round = 2)`

Converts a number to a percentage, with optional rounding.

- **Parameters:**
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The result as a percentage, rounded to the specified decimal places.

**Example:**
```javascript
(0.456).percent(); // Returns 45.60
```
### `Number.prototype.divide(num, round = 2)`

Divides two numbers, with support for string inputs and optional rounding.

- **Parameters:**
  - `num` (number|string): The number or numeric string to divide by.
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The result of the division, rounded to the specified decimal places, or 0 if the divisor is 0.

**Example:**
```javascript
(100).divide('3', 3); // Returns 33.333
```

### `Number.prototype.remainder(num = 2, round = 2)`

Finds the remainder of a division operation, with support for string inputs and optional rounding.

- **Parameters:**
  - `num` (number|string, optional): The number or numeric string to divide by. Defaults to 2.
  - `round` (number, optional): The number of decimal places to round the result to. Defaults to 2.
- **Returns:** `number` - The remainder of the division, rounded to the specified decimal places, or 0 if the divisor is 0.

**Example:**
```javascript
(10).remainder('3', 1); // Returns 1.0
```

## Installation

To install the module, run the following command:

```sh
npm install number-prototype-extensions
```
## Usage

To use the module in your project, first require it and then you can start using the extended `Number` prototype methods.

```javascript
const NumberExtensions = require('number-prototype-extensions');

// Example usage:
const result = (115611).subtract('111').divide(5).subtract(9).add(1);
console.log(result); // Outputs: 23100.8

// More examples:
console.log((123.456).add('100', 1)); // Outputs: 223.5
console.log((100).multiply('3', 3)); // Outputs: 300.000
console.log((0.456).percent()); // Outputs: 45.60
console.log((100).divide('3', 3)); // Outputs: 33.333
console.log((10).remainder('3', 1)); // Outputs: 1.0
console.log((1234.56).format('USD', 2, 'en-US')); // Outputs: "$1,234.56"
```

## License

This project is licensed under the MIT License.

Enhance your number handling in JavaScript with ease and precision using this comprehensive and dependency-free module!

