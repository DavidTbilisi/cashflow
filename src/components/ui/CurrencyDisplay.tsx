import { formatCurrency } from '../../utils/currency'

interface Props {
  amount: number
  className?: string
}

export function CurrencyDisplay({ amount, className = '' }: Props) {
  return (
    <span
      className={`font-semibold ${className}`}
      style={{
        color: amount >= 0 ? 'var(--color-seafoam)' : 'var(--color-flame)',
        fontFamily: 'var(--font-data)',
      }}
    >
      {formatCurrency(amount)}
    </span>
  )
}
