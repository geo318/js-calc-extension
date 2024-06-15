require('../index')

describe('Number prototype extensions', () => {
  test('add method adds numbers correctly', () => {
    expect((1).add(2).valueOf()).toBe(3)
  })

  test('subtract method subtracts numbers correctly', () => {
    expect((5).subtract(3).valueOf()).toBe(2)
  })

  test('multiply method multiplies numbers correctly', () => {
    expect((2).multiply(3).valueOf()).toBe(6)
  })

  test('divide method divides numbers correctly', () => {
    expect((6).divide(3).valueOf()).toBe(2)
  })

  test('chain multiple methods', () => {
    expect((10).add(5).multiply(2).subtract(3).divide(9).valueOf()).toBe(3)
  })

  test('handle negative numbers', () => {
    expect((-5).add(3).multiply(2).valueOf()).toBe(-4)
  })

  test('handle floating-point numbers', () => {
    expect((0.1).add(0.2).valueOf()).toBeCloseTo(0.3)
  })

  test('handle division by zero', () => {
    expect((6).divide(0).valueOf()).toBe(0)
  })

  test('handle large numbers', () => {
    expect(Number.MAX_SAFE_INTEGER.add(1).valueOf()).toBe(
      Number.MAX_SAFE_INTEGER + 1
    )
  })

  test('format method formats numbers as currency', () => {
    expect((123456.789).format('USD', 2, 'en-US')).toBe('$123,456.79')
  })

  test('percent method calculates percentages correctly', () => {
    expect((0.1).percent()).toBe(10)
  })
})
