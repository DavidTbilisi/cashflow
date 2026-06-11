import { describe, it, expect } from 'vitest'
import { scoreNECST, NECST_QUESTIONS } from '../../domain/rules/necstTest'
import type { NECSTAnswers } from '../../domain/entities/types'

const ALL_YES: NECSTAnswers = { need: true, entry: true, control: true, scale: true, time: true }
const ALL_NO: NECSTAnswers = { need: false, entry: false, control: false, scale: false, time: false }

describe('NECST_QUESTIONS', () => {
  it('has exactly 5 questions', () => {
    expect(NECST_QUESTIONS).toHaveLength(5)
  })

  it('covers all 5 key dimensions', () => {
    const keys = NECST_QUESTIONS.map((q) => q.key)
    expect(keys).toContain('need')
    expect(keys).toContain('entry')
    expect(keys).toContain('control')
    expect(keys).toContain('scale')
    expect(keys).toContain('time')
  })

  it('each question has a non-empty question string', () => {
    NECST_QUESTIONS.forEach((q) => {
      expect(q.question.length).toBeGreaterThan(10)
    })
  })
})

describe('scoreNECST', () => {
  it('passes when all 5 answered true (default threshold 3)', () => {
    const { passed, score } = scoreNECST(ALL_YES)
    expect(passed).toBe(true)
    expect(score).toBe(5)
  })

  it('fails when all 5 answered false', () => {
    const { passed, score } = scoreNECST(ALL_NO)
    expect(passed).toBe(false)
    expect(score).toBe(0)
  })

  it('passes at exactly threshold=3 with 3 true answers', () => {
    const answers: NECSTAnswers = { need: true, entry: true, control: true, scale: false, time: false }
    const { passed, score } = scoreNECST(answers, 3)
    expect(passed).toBe(true)
    expect(score).toBe(3)
  })

  it('fails with 2 true answers at default threshold 3', () => {
    const answers: NECSTAnswers = { need: true, entry: true, control: false, scale: false, time: false }
    const { passed, score } = scoreNECST(answers)
    expect(passed).toBe(false)
    expect(score).toBe(2)
  })

  it('passes with 4 answers at threshold=4', () => {
    const answers: NECSTAnswers = { need: true, entry: true, control: true, scale: true, time: false }
    expect(scoreNECST(answers, 4).passed).toBe(true)
  })

  it('fails with 4 answers at threshold=5', () => {
    const answers: NECSTAnswers = { need: true, entry: true, control: true, scale: true, time: false }
    expect(scoreNECST(answers, 5).passed).toBe(false)
  })

  it('passes with threshold=1 when at least 1 true', () => {
    const answers: NECSTAnswers = { need: true, entry: false, control: false, scale: false, time: false }
    expect(scoreNECST(answers, 1).passed).toBe(true)
  })

  it('score equals exact count of true values', () => {
    const answers: NECSTAnswers = { need: true, entry: false, control: true, scale: false, time: true }
    expect(scoreNECST(answers).score).toBe(3)
  })
})
