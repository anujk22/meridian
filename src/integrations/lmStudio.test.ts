import { describe, expect, it } from 'vitest'
import { parseLiveScenario } from './lmStudio'

const validPayload = JSON.stringify({
  context: ['Graduating', 'Limited savings', 'Five-year horizon'],
  goals: ['AI depth', 'Financial independence', 'Future options'],
  claims: Object.fromEntries(['stable', 'startup', 'research'].map((path) => [path, {
    claim: { title: `${path} case`, body: 'A concrete argument.', retrievalQuery: 'career evidence' },
    concession: { title: `${path} caveat`, body: 'A concrete limitation.', retrievalQuery: '' },
  }])),
  hidden: [
    { title: 'Hidden one', body: 'A hidden tradeoff.', retrievalQuery: 'equity liquidity' },
    { title: 'Hidden two', body: 'Another hidden tradeoff.', retrievalQuery: '' },
  ],
  mutations: [
    { low: 8, mode: 30, high: 55, confidence: 0.4, reason: 'Floor is uncertain.' },
    { low: 50, mode: 72, high: 92, confidence: 0.5, reason: 'Upside is uncertain.' },
    { low: 75, mode: 88, high: 96, confidence: 0.8, reason: 'Depth aligns.' },
    { low: 68, mode: 81, high: 91, confidence: 0.8, reason: 'Options remain.' },
  ],
})

describe('LM Studio council response', () => {
  it('maps validated model JSON onto stable timeline IDs', () => {
    const scenario = parseLiveScenario(`Here is the JSON:\n${validPayload}`, 'local-model')
    expect(scenario.claims.map(({ id }) => id)).toEqual([
      'stable-floor', 'stable-concession', 'startup-ownership',
      'startup-concession', 'research-depth', 'research-concession',
    ])
    expect(scenario.mutations).toHaveLength(4)
    expect(scenario.modelId).toBe('local-model')
  })

  it('rejects incomplete output instead of silently inventing content', () => {
    expect(() => parseLiveScenario('{"context":[]}', 'local-model')).toThrow(/incomplete/i)
  })
})
