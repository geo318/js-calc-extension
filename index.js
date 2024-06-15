/**
 * Subtracts one number from another, with support for string inputs.
 *
 * @param {number|string} num - The number or string to be subtracted.
 * @param {number} round - The number to subtract from.
 * @returns {number} The result of the subtraction.
 * @description
 * This method subtracts `num` from `round`. It accepts either numbers or numeric strings as input.
 * If a string is provided, it is parsed into a number before performing the subtraction.
 */

Number.prototype.subtract = function (num, round) {
  return parseFloatingPoint(purge(this.valueOf()) - purge(num), round)
}

/**
 * Adds two numbers, with support for string inputs and optional rounding.
 *
 * @param {number|string} num - The first number or numeric string to add.
 * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
 * @returns {number} The result of the addition, rounded to the specified decimal places.
 * @description
 * This method adds `num` to another number. It accepts either numbers or numeric strings as input.
 * If a string is provided, it is parsed into a number before performing the addition.
 * To avoid floating point errors, the result is rounded to the nearest hundredth by default.
 * You can specify the number of decimal places to round to by passing the `round` parameter.
 */
Number.prototype.add = function (num, round) {
  return parseFloatingPoint(purge(this.valueOf()) + purge(num), round)
}

/**
 * Multiplies two numbers, with support for string inputs and optional rounding.
 *
 * @param {number|string} num - The first number or numeric string to multiply.
 * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
 * @returns {number} The result of the multiplication, rounded to the specified decimal places.
 * @description
 * This method multiplies `num` with another number. It accepts either numbers or numeric strings as input.
 * If a string is provided, it is parsed into a number before performing the multiplication.
 * To avoid floating point errors, the result is rounded to the nearest hundredth by default.
 * You can specify the number of decimal places to round to by passing the `round` parameter.
 */

Number.prototype.multiply = function (num, round) {
  return parseFloatingPoint(purge(this.valueOf()) * purge(num), round)
}

/**
 * Multiplies a number by 100, with support for string inputs and optional rounding.
 *
 * @param {number|string} num - The number or numeric string to multiply by 100.
 * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
 * @returns {number} The result of the multiplication, rounded to the specified decimal places.
 * @description
 * This method multiplies `num` by 100. It accepts either numbers or numeric strings as input.
 * If a string is provided, it is parsed into a number before performing the multiplication.
 * To avoid floating point errors, the result is rounded to the nearest hundredth by default.
 * You can specify the number of decimal places to round to by passing the `round` parameter.
 */

Number.prototype.percent = function (round = 0) {
  return parseFloatingPoint(purge(this.valueOf()) * 100, round)
}

/**
 * Divides two numbers, with support for string inputs and optional rounding.
 *
 * @param {number|string} num - The numerator, which can be a number or numeric string.
 * @param {number|string} divisor - The divisor, which can be a number or numeric string.
 * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
 * @returns {number} The result of the division, rounded to the specified decimal places, or 0 if the divisor is 0.
 * @description
 * This method divides `num` by `divisor`. It accepts either numbers or numeric strings as input.
 * If a string is provided, it is parsed into a number before performing the division.
 * If the divisor is 0, the result will be 0 to avoid errors.
 * To avoid floating point errors, the result is rounded to the nearest hundredth by default.
 * You can specify the number of decimal places to round to by passing the `round` parameter.
 */

Number.prototype.divide = function (num, round) {
  return parseFloatingPoint(
    purge(num) ? purge(this.valueOf()) / purge(num) : 0,
    round
  )
}

/**
 * Gets the remainder of a division operation, with support for string inputs and optional rounding.
 *
 * @param {number|string} [num=2] - The numerator, which can be a number or numeric string. Defaults to 2.
 * @param {number|string} divisor - The divisor, which can be a number or numeric string.
 * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
 * @returns {number} The remainder of the division, rounded to the specified decimal places, or 0 if the divisor is 0.
 * @description
 * This method calculates the remainder of `num` divided by `divisor`. It accepts either numbers or numeric strings as input.
 * If a string is provided, it is parsed into a number before performing the operation.
 * If the divisor is 0, the result will be 0 to avoid errors.
 * To avoid floating point errors, the result is rounded to the nearest hundredth by default.
 * You can specify the number of decimal places to round to by passing the `round` parameter.
 */


Number.prototype.remainder = function (num = 2, round) {
  return parseFloatingPoint(purge(this.valueOf()) % purge(num), round)
}
/**
 * Formats a number as currency.
 *
 * @param {string} [currency='EUR'] - The currency symbol to use. Defaults to 'EUR'.
 * @param {number} [digits=2] - The number of decimal digits to include. Defaults to 2.
 * @param {string} [locale='us'] - The locale to use for formatting. Defaults to 'us'.
 * @returns {string} The formatted currency string.
 * @description
 * This method formats a number as currency using the specified currency symbol, number of decimal digits, and locale.
 * - `currency`: The currency symbol to use. Default is 'EUR'.
 * - `digits`: The number of decimal digits to include. Default is 2.
 * - `locale`: The locale to use for formatting. Default is 'us'.
 */

Number.prototype.format = function (
  currency = 'EUR',
  digits = 2,
  locale = 'us'
) {
  const formatted = formatNumber(
    formatCurrency(currency, digits, locale),
    purge(this.valueOf())
  )
  const [int, float] = (formatted || '0.0').split('.')
  return /^0+$/.test(float) ? int : formatted
}

function parseFloatingPoint(num, digits = 2) {
  return parseFloat(num.toFixed(digits))
}

function purge(x) {
  let toBePurged

  if (typeof x === 'number') {
    toBePurged = x
  } else if (typeof x === 'string') {
    const cantBeParsed = Number.isNaN(parseFloat(x))
    const parsedNum = cantBeParsed
      ? Number(x.replace(/[^\d]/g, '') || 0)
      : parseFloat(x)
    toBePurged = parsedNum
  } else {
    console.log('Invalid number:', x)
    toBePurged = 0
  }

  return toBePurged
}

function formatCurrency(
  currency = 'EUR',
  maximumFractionDigits = 2,
  locale = 'us'
) {
  return new Intl.NumberFormat(locale, {
    currency,
    style: 'currency',
    maximumFractionDigits,
    currencyDisplay: 'narrowSymbol',
  })
}

const CURRENCY_SYMBOL_REGEX = /(\$|€|£|\s|GEL|₾)/g

function formatNumber(formatter = formatCurrency(), number = 0) {
  if (!number) return '0'
  return formatter.format(number)
}