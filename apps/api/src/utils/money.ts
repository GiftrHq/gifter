export function formatMoney(amountCents: number, currency: string = 'GBP'): string {
  const amount = amountCents / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function centsToDecimal(cents: number): number {
  return cents / 100;
}

export function decimalToCents(decimal: number): number {
  return Math.round(decimal * 100);
}
