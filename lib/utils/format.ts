export function formatCurrency(amount: number, currency: string): string {
  const formatters: Record<string, Intl.NumberFormat> = {
    USD: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }),
    EUR: new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }),
    PEN: new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }),
  }

  const formatter = formatters[currency]
  return formatter ? formatter.format(amount) : `${currency} ${amount.toLocaleString()}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
