import type { NECSTAnswers } from '../entities/types'

export const NECST_QUESTIONS = [
  { key: 'need' as const, question: 'Is there a real market need — proven demand beyond your own excitement?' },
  { key: 'entry' as const, question: 'Is the barrier to entry high enough that competitors cannot copy this in a week?' },
  { key: 'control' as const, question: 'Do you own the platform, pricing, and data — not dependent on a third party?' },
  { key: 'scale' as const, question: 'Can it serve 10× more customers without requiring 10× more of your time?' },
  { key: 'time' as const, question: 'Does the income survive a 3-month absence — the Time Commandment test?' },
]

export function scoreNECST(answers: NECSTAnswers, threshold = 3): { passed: boolean; score: number } {
  const score = Object.values(answers).filter(Boolean).length
  return { passed: score >= threshold, score }
}
