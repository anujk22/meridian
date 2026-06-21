import { afterEach, describe, expect, it, vi } from 'vitest'
import { listLocalModels, preferredLocalModelId } from './lmStudio'

describe('LM Studio model discovery', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns loaded LLM instances and prefers loaded Nemotron', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          { type: 'llm', loaded_instances: [], key: 'downloaded-but-cold' },
          { type: 'embedding', loaded_instances: [{ id: 'embed-loaded' }] },
          { type: 'llm', loaded_instances: [{ id: 'qwen-loaded' }] },
          { type: 'llm', loaded_instances: [{ id: 'nvidia/nemotron-nano-loaded' }] },
        ],
      }),
    }))

    const models = await listLocalModels()
    expect(models.map(({ id }) => id)).toEqual(['qwen-loaded', 'nvidia/nemotron-nano-loaded'])
    expect(preferredLocalModelId(models)).toBe('nvidia/nemotron-nano-loaded')
  })

  it('reports installed Nemotron as cold without claiming it is loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          { type: 'llm', key: 'qwen/cold-model', loaded_instances: [] },
          { type: 'llm', key: 'nvidia/nemotron-3-nano', display_name: 'Nemotron 3 Nano', loaded_instances: [] },
        ],
      }),
    }))

    const models = await listLocalModels()
    expect(models).toEqual([{ id: 'nvidia/nemotron-3-nano', loaded: false }])
  })
})
