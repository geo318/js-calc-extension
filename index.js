Number.prototype.subtract = function (num, round) {
  return parseFloatingPoint(purge(this.valueOf()) - purge(num), round)
}

Number.prototype.add = function (num, round) {
  return parseFloatingPoint(purge(this.valueOf()) + purge(num), round)
}

Number.prototype.multiply = function (num, round) {
  return parseFloatingPoint(purge(this.valueOf()) * purge(num), round)
}

Number.prototype.percent = function (round = 0) {
  return parseFloatingPoint(purge(this.valueOf()) * 100, round)
}

Number.prototype.divide = function (num, round) {
  return parseFloatingPoint(
    purge(num) ? purge(this.valueOf()) / purge(num) : 0,
    round
  )
}

Number.prototype.remainder = function (num = 2, round) {
  return parseFloatingPoint(purge(this.valueOf()) % purge(num), round)
}

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
