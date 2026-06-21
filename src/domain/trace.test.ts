import { describe, expect, it } from 'vitest'
import { createInitialModel } from './model'
import { formatRange, rangeBefore, type RangeMutation } from './trace'

describe('decision trace helpers', () => {
  it('reads and formats the pre-mutation range without changing the model', () => {
    const model = createInitialModel()
    const mutation: RangeMutation = {
      kind: 'setRange',
      optionId: 'startup',
      factor: 'financialFloor',
      range: { low: 8, mode: 27, high: 53, confidence: 0.36 },
      reason: 'test',
    }

    const previous = rangeBefore(model, mutation)
    previous.low = 0

    expect(formatRange(rangeBefore(model, mutation))).toBe('26 / 51 / 76')
  })
})
