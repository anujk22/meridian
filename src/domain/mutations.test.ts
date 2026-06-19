import { describe, expect, it } from 'vitest'
import { createInitialModel } from './model'
import { applyMutation } from './mutations'

describe('model mutations', () => {
  it('does not mutate the previous model', () => {
    const original = createInitialModel()
    const next = applyMutation(original, {
      kind: 'setWeight',
      factor: 'aiGrowth',
      value: 0.8,
      reason: 'test',
    })

    expect(original.assumptions.weights.aiGrowth).toBe(0.27)
    expect(next.assumptions.weights.aiGrowth).toBe(0.8)
    expect(next.revision).toBe(original.revision + 1)
  })

  it('clamps ranges and assumptions to valid bounds', () => {
    const original = createInitialModel()
    const ranged = applyMutation(original, {
      kind: 'setRange',
      optionId: 'startup',
      factor: 'financialFloor',
      range: { low: -50, mode: 140, high: 200, confidence: 2 },
      reason: 'test',
    })
    const risked = applyMutation(ranged, { kind: 'setRisk', value: -1, reason: 'test' })
    const range = risked.options.find((option) => option.id === 'startup')!.factors.financialFloor

    expect(range).toEqual({ low: 0, mode: 100, high: 100, confidence: 1 })
    expect(risked.assumptions.riskTolerance).toBe(0)
  })
})
