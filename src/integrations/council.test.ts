import { describe, expect, it, vi } from 'vitest'
import { getEvidenceById, type RetrievalResult } from '../evidence/retrieval'
import type { EvidenceChunk } from '../evidence/corpus'
import { generateLiveScenario, parseVesperReview } from './council'
import type { ChatMessage, LocalChatRequest } from './lmStudio'

const stableEvidence = getEvidenceById('bls-software-outlook')!
const startupEvidence = getEvidenceById('carta-equity-liquidity')!
const researchEvidence = getEvidenceById('nsf-graduate-support')!

function result(chunk: EvidenceChunk): RetrievalResult {
  return { mode: 'keyword', chunks: [chunk] }
}

function memo(name: string, evidenceId: string) {
  return JSON.stringify({
    claim: { title: `${name} case`, body: `${name} makes a grounded case.`, evidenceIds: [evidenceId] },
    concession: { title: `${name} caveat`, body: `${name} acknowledges uncertainty.`, evidenceIds: [] },
    ranges: [
      { low: 45, mode: 65, high: 82, confidence: 0.65, reason: 'First bounded factor.', evidenceIds: [evidenceId] },
      { low: 50, mode: 70, high: 86, confidence: 0.7, reason: 'Second bounded factor.', evidenceIds: [evidenceId] },
    ],
  })
}

function review(evidenceIds = [stableEvidence.id, startupEvidence.id, researchEvidence.id]) {
  const [stableId, startupId, researchId] = evidenceIds
  return JSON.stringify({
    hidden: [
      { title: 'Equity needs diligence', body: 'Liquidity remains uncertain.', evidenceIds: [startupId] },
      { title: 'Funding needs verification', body: 'Funding form and duration matter.', evidenceIds: [researchId] },
    ],
    mutations: [
      { low: 12, mode: 34, high: 58, confidence: 0.4, reason: 'Startup floor remains uncertain.', evidenceIds: [startupId] },
      { low: 48, mode: 72, high: 91, confidence: 0.45, reason: 'Ownership remains conditional.', evidenceIds: [startupId] },
      { low: 74, mode: 87, high: 96, confidence: 0.8, reason: 'Research supports depth.', evidenceIds: [researchId] },
      { low: 67, mode: 80, high: 91, confidence: 0.78, reason: 'Research preserves options.', evidenceIds: [stableId, researchId] },
    ],
  })
}

describe('grounded multi-agent council', () => {
  it('retrieves before three independent advocates and sends their memos to Vesper', async () => {
    const events: string[] = []
    const calls: ChatMessage[][] = []
    const retrieve = vi.fn(async (query: string) => {
      events.push(`retrieve:${query.includes('startup survival') ? 'startup' : query.includes('funded AI') ? 'research' : 'stable'}`)
      if (query.includes('startup survival')) return result(startupEvidence)
      if (query.includes('funded AI')) return result(researchEvidence)
      return result(stableEvidence)
    })
    const request: LocalChatRequest = vi.fn(async (messages) => {
      calls.push(messages)
      const system = messages[0].content
      if (system.includes('Harbor')) {
        events.push('request:Harbor')
        return memo('Harbor', stableEvidence.id)
      }
      if (system.includes('Aster')) {
        events.push('request:Aster')
        return memo('Aster', startupEvidence.id)
      }
      if (system.includes('Lumen')) {
        events.push('request:Lumen')
        return memo('Lumen', researchEvidence.id)
      }
      events.push('request:Vesper')
      return review()
    })
    const progress: string[] = []

    const scenario = await generateLiveScenario('Choose among three career paths.', 'test-model', {
      retrieve,
      request,
      onProgress: ({ stage }) => progress.push(stage),
    })

    expect(events.slice(0, 3).every((event) => event.startsWith('retrieve:'))).toBe(true)
    expect(events.filter((event) => event.startsWith('request:'))).toEqual([
      'request:Harbor', 'request:Aster', 'request:Lumen', 'request:Vesper',
    ])
    expect(calls).toHaveLength(4)
    expect(calls[0][1].content).toContain(`[${stableEvidence.id}]`)
    expect(calls[0][1].content).not.toContain(`[${startupEvidence.id}]`)
    expect(calls[1][1].content).toContain(`[${startupEvidence.id}]`)
    expect(calls[2][1].content).toContain(`[${researchEvidence.id}]`)
    expect(calls[3][1].content).toContain('Harbor case')
    expect(calls[3][1].content).toContain('Aster case')
    expect(calls[3][1].content).toContain('Lumen case')
    expect(scenario.claims).toHaveLength(6)
    expect(scenario.mutations).toHaveLength(4)
    expect(scenario.citations['stable-floor'].chunks).toEqual([stableEvidence])
    expect(progress).toContain('retrieving')
    expect(progress).toContain('cross-examination')
    expect(progress.at(-1)).toBe('ready')
  })

  it('rejects citations outside the retrieved evidence set', () => {
    const raw = review([stableEvidence.id, 'fabricated-source', researchEvidence.id])
    expect(() => parseVesperReview(raw, [stableEvidence, startupEvidence, researchEvidence])).toThrow(/not given/i)
  })

  it('uses an isolated formatter when an advocate returns the wrong shape', async () => {
    const calls: ChatMessage[][] = []
    const retrieve = async (query: string) => {
      if (query.includes('startup survival')) return result(startupEvidence)
      if (query.includes('funded AI')) return result(researchEvidence)
      return result(stableEvidence)
    }
    const request: LocalChatRequest = async (messages) => {
      calls.push(messages)
      const system = messages[0].content
      if (system.includes('strict JSON normalizer')) return memo('Harbor', stableEvidence.id)
      if (system.includes('Harbor')) return '{"title":"Useful analysis in the wrong shape"}'
      if (system.includes('Aster')) return memo('Aster', startupEvidence.id)
      if (system.includes('Lumen')) return memo('Lumen', researchEvidence.id)
      return review()
    }

    const scenario = await generateLiveScenario('Choose among three career paths.', 'test-model', { retrieve, request })
    const formatterCall = calls.find(([message]) => message.content.includes('strict JSON normalizer'))

    expect(formatterCall).toHaveLength(2)
    expect(formatterCall?.[1].content).toContain('Useful analysis in the wrong shape')
    expect(scenario.claims.find(({ id }) => id === 'stable-floor')?.title).toBe('Harbor case')
  })

  it('rejects ungrounded mutation ranges', () => {
    const parsed = JSON.parse(review())
    parsed.mutations[0].evidenceIds = []
    expect(() => parseVesperReview(JSON.stringify(parsed), [stableEvidence, startupEvidence, researchEvidence])).toThrow(/did not cite/i)
  })

  it('normalizes common local-model confidence formats', () => {
    const parsed = JSON.parse(review())
    parsed.mutations[0].confidence = 'High'
    parsed.mutations[1].confidence = 65
    const normalized = parseVesperReview(JSON.stringify(parsed), [stableEvidence, startupEvidence, researchEvidence])
    expect(normalized.mutations[0]).toMatchObject({ range: { confidence: 0.8 } })
    expect(normalized.mutations[1]).toMatchObject({ range: { confidence: 0.65 } })
  })
})
