/** Returns the CSS colour variable for a signed financial value. */
export function valueColor(n: number): string {
  if (n > 0) return 'var(--color-seafoam)'
  if (n < 0) return 'var(--color-flame)'
  return 'var(--color-fog)'
}

/** Returns a colour for the Freedom Gauge bar based on pct (0–100+). */
export function gaugeColor(pct: number): string {
  if (pct >= 100) return 'var(--color-seafoam)'
  if (pct >= 50) return 'var(--color-honey)'
  return 'var(--color-flame)'
}
