import { describe, expect, it } from 'vitest'
import { SKEPTIC_MUTATIONS } from './builtin'
import { demoReducer, initialDemoState } from './reducer'

describe('demo reducer', () => {
  it('starts and resets the deterministic flow', () => {
    const started = demoReducer(initialDemoState, { type: 'start' })
    expect(started.running).toBe(true)
    expect(started.activeAgent).toBe('meridian')
    expect(demoReducer(started, { type: 'reset' })).toEqual(initialDemoState)
  })

  it('does not reveal the same artifact twice', () => {
    const event = { at: 0, type: 'claim' as const, claimId: 'stable-floor', activeAgent: 'stableAdvocate' as const }
    const once = demoReducer(initialDemoState, { type: 'timeline', event })
    const twice = demoReducer(once, { type: 'timeline', event })
    expect(twice.visibleClaimIds).toEqual(['stable-floor'])
  })

  it('does not duplicate timeline ledger entries', () => {
    const event = {
      at: 0,
      type: 'mutation' as const,
      mutation: SKEPTIC_MUTATIONS[0],
      ledger: {
        id: 'one',
        actor: 'Skeptic' as const,
        title: 'Changed',
        detail: 'Reason',
        tone: 'risk' as const,
      },
    }
    const once = demoReducer(initialDemoState, { type: 'timeline', event })
    const twice = demoReducer(once, { type: 'timeline', event })
    expect(twice.ledger).toHaveLength(1)
  })
})
