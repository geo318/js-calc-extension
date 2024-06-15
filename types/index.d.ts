export {}
declare global {
  interface Number {
    /**
     * Subtracts one number from another, with support for string inputs.
     *
     * @param {number|string} num - The number or string to be subtracted.
     * @param {number} round - The number to subtract from.
     * @returns {number} The result of the subtraction.
     */
    subtract(num: number | string, round: number): number

    /**
     * Adds two numbers, with support for string inputs and optional rounding.
     *
     * @param {number|string} num - The first number or numeric string to add.
     * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
     * @returns {number} The result of the addition, rounded to the specified decimal places.
     */
    add(num: number | string, round?: number): number

    /**
     * Multiplies two numbers, with support for string inputs and optional rounding.
     *
     * @param {number|string} num - The first number or numeric string to multiply.
     * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
     * @returns {number} The result of the multiplication, rounded to the specified decimal places.
     */
    multiply(num: number | string, round?: number): number

    /**
     * Multiplies a number by 100, with support for string inputs and optional rounding.
     *
     * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
     * @returns {number} The result of the multiplication, rounded to the specified decimal places.
     */
    percent(round?: number): number

    /**
     * Divides two numbers, with support for string inputs and optional rounding.
     *
     * @param {number|string} num - The numerator, which can be a number or numeric string.
     * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
     * @returns {number} The result of the division, rounded to the specified decimal places, or 0 if the divisor is 0.
     */
    divide(num: number | string, round?: number): number

    /**
     * Gets the remainder of a division operation, with support for string inputs and optional rounding.
     *
     * @param {number|string} [num=2] - The numerator, which can be a number or numeric string. Defaults to 2.
     * @param {number|string} divisor - The divisor, which can be a number or numeric string.
     * @param {number} [round=2] - The number of decimal places to round the result to. Defaults to 2.
     * @returns {number} The remainder of the division, rounded to the specified decimal places, or 0 if the divisor is 0.
     */
    remainder(num?: number | string, round?: number): number

    /**
     * Formats a number as currency.
     *
     * @param {string} [currency='EUR'] - The currency symbol to use. Defaults to 'EUR'.
     * @param {number} [digits=2] - The number of decimal digits to include. Defaults to 2.
     * @param {string} [locale='us'] - The locale to use for formatting. Defaults to 'us'.
     * @returns {string} The formatted currency string.
     */
    format(currency?: string, digits?: number, locale?: string): string
  }
}
