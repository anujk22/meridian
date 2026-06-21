import { describe, expect, it } from 'vitest'
import { createDebatedModel } from '../scenario/builtin'
import { explainAllPaths } from './explain'

describe('path explanations', () => {
  it('finds a deterministic leading condition set for every path', () => {
    const explanations = explainAllPaths(createDebatedModel())

    expect(explanations.map(({ optionId }) => optionId)).toEqual(['stable', 'startup', 'research'])
    explanations.forEach((explanation) => {
      expect(explanation.achievesLead).toBe(true)
      expect(explanation.changes.length).toBeGreaterThan(0)
      expect(explanation.projectedShare).toBeGreaterThan(0)
    })
  })

  it('is stable across repeated runs', () => {
    const model = createDebatedModel()
    expect(explainAllPaths(model)).toEqual(explainAllPaths(model))
  })
})
