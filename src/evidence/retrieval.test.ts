import { describe, expect, it } from 'vitest'
import { getEvidenceById, keywordRetrieve, retrieveEvidence } from './retrieval'
import { BUILTIN_RETRIEVAL_QUERIES } from './corpus'

describe('evidence retrieval', () => {
  it('retrieves startup equity evidence with keyword fallback', () => {
    const result = keywordRetrieve('private startup equity liquidity options cash', 2)
    expect(result.map((chunk) => chunk.id)).toContain('carta-equity-liquidity')
  })

  it('uses the precomputed semantic index for every built-in query', async () => {
    for (const query of BUILTIN_RETRIEVAL_QUERIES) {
      const result = await retrieveEvidence(query, 2)
      expect(result.mode).toBe('semantic')
      expect(result.chunks).toHaveLength(2)
    }
  })

  it('resolves every semantic citation to local metadata', async () => {
    const result = await retrieveEvidence(BUILTIN_RETRIEVAL_QUERIES[0], 3)
    result.chunks.forEach((chunk) => expect(getEvidenceById(chunk.id)).toEqual(chunk))
  })
})
