declare global {
  interface Number {
    add(num: number): number
    multiply(num: number): number
    divide(num: number): number
    subtract(num: number): number
    remainder(num: number): number
    percent(round?: number): number
    format(currency?: Currency): number | string
  }
}

declare function add(num: number | string, round?: number): number
declare function multiply(num: number | string, round?: number): number
declare function subtract(num: number | string, round?: number): number
declare function remainder(num: number | string, round?: number): number
declare function percent(round: number): number
declare function format(a: number, b: number): number
declare function formatNumber(
  formatter: Intl.NumberFormat,
  number: number
): string

export { add, multiply, subtract, remainder, percent, format, formatNumber }