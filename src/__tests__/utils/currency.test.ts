import { describe, it, expect } from 'vitest'
import { formatCurrency, formatShort } from '../../utils/currency'

// ── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats a positive amount with no decimals', () => {
    expect(formatCurrency(4000)).toBe('$4,000')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('prefixes negatives with a leading minus', () => {
    expect(formatCurrency(-1500)).toBe('-$1,500')
  })

  it('rounds away fractional cents', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235')
  })
})

// ── formatShort ──────────────────────────────────────────────────────────────

describe('formatShort', () => {
  it('abbreviates millions to one decimal', () => {
    expect(formatShort(2_500_000)).toBe('$2.5M')
  })

  it('abbreviates thousands with no decimals', () => {
    expect(formatShort(12_000)).toBe('$12K')
  })

  it('falls back to full currency below $1,000', () => {
    expect(formatShort(750)).toBe('$750')
  })

  it('uses the millions branch at exactly $1,000,000', () => {
    expect(formatShort(1_000_000)).toBe('$1.0M')
  })
})
