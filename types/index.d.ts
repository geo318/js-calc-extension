declare global {
  interface Number {
    add(num: number | string, round?: number): number
    multiply(num: number | string, round?: number): number
    divide(num: number | string, round?: number): number
    subtract(num: number | string, round?: number): number
    remainder(num: number | string, round?: number): number
    percent(round?: number): number
    format(
      currency?: Currency | Omit<string, Currency>,
      digits?: number,
      locale: Intl.LocalesArgument
    ): number | string
  }
}

type Currency = 'EUR' | 'GEL' | 'USD' | 'RUB' | 'TRY' | 'GBP' | 'AZN'
