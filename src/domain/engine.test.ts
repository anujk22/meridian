import { describe, expect, it } from 'vitest'
import { computeDecision } from './engine'
import { applyMutations } from './mutations'
import { createDebatedModel } from '../scenario/builtin'

describe('decision engine', () => {
  it('is deterministic and keeps displayed shares at 100', () => {
    const model = createDebatedModel()
    const first = computeDecision(model)
    const second = computeDecision(model)

    expect(first).toEqual(second)
    expect(first.options.reduce((sum, option) => sum + option.share, 0)).toBe(100)
  })

  it('keeps the default debate close and narrowly favors research', () => {
    const result = computeDecision(createDebatedModel())
    const shares = Object.fromEntries(result.options.map((option) => [option.id, option.share]))

    expect(result.leaderId).toBe('research')
    expect(shares.research).toBeGreaterThanOrEqual(35)
    expect(shares.research).toBeLessThanOrEqual(42)
    expect(shares.stable).toBeGreaterThanOrEqual(27)
    expect(shares.startup).toBeGreaterThanOrEqual(25)
  })

  it('makes the stable job lead under low risk tolerance and income urgency', () => {
    const model = applyMutations(createDebatedModel(), [
      { kind: 'setRisk', value: 0.05, reason: 'test' },
      { kind: 'setToggle', toggle: 'incomeNow', value: true, reason: 'test' },
    ])
    expect(computeDecision(model).leaderId).toBe('stable')
  })

  it('makes research lead when funded AI growth is emphasized', () => {
    const model = applyMutations(createDebatedModel(), [
      { kind: 'setWeight', factor: 'aiGrowth', value: 0.5, reason: 'test' },
      { kind: 'setToggle', toggle: 'mastersFunded', value: true, reason: 'test' },
    ])
    expect(computeDecision(model).leaderId).toBe('research')
  })

  it('makes the startup lead when traction, ownership, and risk tolerance rise', () => {
    const model = applyMutations(createDebatedModel(), [
      { kind: 'setWeight', factor: 'ownershipUpside', value: 0.55, reason: 'test' },
      { kind: 'setRisk', value: 0.88, reason: 'test' },
      { kind: 'setToggle', toggle: 'startupTraction', value: true, reason: 'test' },
      { kind: 'setToggle', toggle: 'preferBuilding', value: true, reason: 'test' },
    ])
    expect(computeDecision(model).leaderId).toBe('startup')
  })

  it('reports bounded floor, mean, and ceiling values', () => {
    const result = computeDecision(createDebatedModel())
    result.options.forEach((option) => {
      expect(option.floor).toBeGreaterThanOrEqual(0)
      expect(option.floor).toBeLessThan(option.mean)
      expect(option.mean).toBeLessThan(option.ceiling)
      expect(option.ceiling).toBeLessThanOrEqual(100)
    })
  })
})
