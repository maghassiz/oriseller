export function formatIDRShort(cents: number): string {
  const amount = cents / 100
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`
  return `Rp ${amount.toFixed(0)}`
}

export function formatIDR(cents: number): string {
  const amount = cents / 100
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}
