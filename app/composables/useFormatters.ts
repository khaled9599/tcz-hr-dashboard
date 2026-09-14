export function useFormatters() {
  const number = new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 })
  const decimal = new Intl.NumberFormat('en-EG', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
  const currency = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 })
  const percent = new Intl.NumberFormat('en-EG', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 })

  function metric(value: number, format: string) {
    if (format === 'currency') return currency.format(value)
    if (format === 'percent') return percent.format(value / 100)
    if (format === 'decimal') return decimal.format(value)
    return number.format(value)
  }

  return { number, decimal, currency, percent, metric }
}
