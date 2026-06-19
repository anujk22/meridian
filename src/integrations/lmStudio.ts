import type { ModelMutation } from '../domain/types'
import type { ClaimArtifact, HiddenConsideration } from '../scenario/builtin'

export interface LocalModel {
  id: string
}

export interface LiveScenario {
  contextChips: string[]
  goalChips: string[]
  claims: ClaimArtifact[]
  hiddenConsiderations: HiddenConsideration[]
  mutations: ModelMutation[]
  modelId: string
}

const claimSlots = [
  ['stable-floor', 'stable', 'stableAdvocate', 'claim'],
  ['stable-concession', 'stable', 'stableAdvocate', 'concession'],
  ['startup-ownership', 'startup', 'startupAdvocate', 'claim'],
  ['startup-concession', 'startup', 'startupAdvocate', 'concession'],
  ['research-depth', 'research', 'researchAdvocate', 'claim'],
  ['research-concession', 'research', 'researchAdvocate', 'concession'],
] as const

const mutationSlots = [
  ['startup', 'financialFloor'],
  ['startup', 'ownershipUpside'],
  ['research', 'aiGrowth'],
  ['research', 'optionality'],
] as const

function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('LM Studio returned incomplete council content.')
  return value.trim().slice(0, max)
}

function stringList(value: unknown, min: number, max: number): string[] {
  if (!Array.isArray(value) || value.length < min) throw new Error('LM Studio returned incomplete council content.')
  return value.slice(0, max).map((item) => text(item, 72))
}

function number(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('LM Studio returned an invalid score.')
  return Math.min(max, Math.max(min, value))
}

function extractJson(raw: string): unknown {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('LM Studio did not return JSON.')
  return JSON.parse(raw.slice(start, end + 1))
}

export function parseLiveScenario(raw: string, modelId: string): LiveScenario {
  const parsed = extractJson(raw) as Record<string, unknown>
  const rawClaims = parsed.claims as Record<string, unknown>
  const rawHidden = parsed.hidden as unknown[]
  const rawMutations = parsed.mutations as unknown[]
  if (!rawClaims || !Array.isArray(rawHidden) || rawHidden.length < 2 || !Array.isArray(rawMutations) || rawMutations.length !== 4) {
    throw new Error('LM Studio returned an incomplete council response.')
  }

  const claimKeys = ['stable.claim', 'stable.concession', 'startup.claim', 'startup.concession', 'research.claim', 'research.concession']
  const claims = claimSlots.map(([id, optionId, agentId, kind], index) => {
    const [group, item] = claimKeys[index].split('.')
    const source = (rawClaims[group] as Record<string, unknown>)?.[item] as Record<string, unknown>
    if (!source) throw new Error('LM Studio returned incomplete path arguments.')
    return {
      id,
      optionId,
      agentId,
      kind,
      title: text(source.title, 70),
      body: text(source.body, 240),
      retrievalQuery: source.retrievalQuery ? text(source.retrievalQuery, 100) : null,
    }
  })

  const hiddenConsiderations = rawHidden.slice(0, 2).map((item, index) => {
    const source = item as Record<string, unknown>
    return {
      id: index === 0 ? 'equity-not-cash' : 'identity-vs-goal',
      title: text(source.title, 70),
      body: text(source.body, 260),
      retrievalQuery: source.retrievalQuery ? text(source.retrievalQuery, 100) : null,
    }
  })

  const mutations: ModelMutation[] = rawMutations.map((item, index) => {
    const source = item as Record<string, unknown>
    const [optionId, factor] = mutationSlots[index]
    const low = number(source.low, 0, 100)
    const mode = number(source.mode, low, 100)
    const high = number(source.high, mode, 100)
    return {
      kind: 'setRange',
      optionId,
      factor,
      range: { low, mode, high, confidence: number(source.confidence, 0.1, 1) },
      reason: text(source.reason, 220),
    }
  })

  return {
    contextChips: stringList(parsed.context, 3, 5),
    goalChips: stringList(parsed.goals, 3, 3),
    claims,
    hiddenConsiderations,
    mutations,
    modelId,
  }
}

export async function listLocalModels(): Promise<LocalModel[]> {
  const response = await fetch('/lmstudio/v1/models')
  if (!response.ok) throw new Error('LM Studio local server is not responding on port 1234.')
  const payload = await response.json() as { data?: Array<{ id?: string }> }
  return (payload.data ?? [])
    .filter((model): model is { id: string } => Boolean(model.id) && !model.id!.toLowerCase().includes('embed'))
    .map(({ id }) => ({ id }))
}

const SYSTEM_PROMPT = `You are Meridian, a local decision council. Analyze one decision between Stable SWE, AI Startup, and Funded AI Master's. Be specific to the user's prompt, intellectually honest, and concise. Harbor advocates Stable SWE pragmatically. Aster advocates Startup ambitiously but honestly. Lumen advocates Research thoughtfully. Vesper identifies hidden tradeoffs. Kepler quantifies bounded assumptions. Do not invent exact external statistics. Return ONLY valid JSON with this exact shape:
{"context":["3-5 short facts"],"goals":["exactly 3 short goals"],"claims":{"stable":{"claim":{"title":"","body":"","retrievalQuery":""},"concession":{"title":"","body":"","retrievalQuery":""}},"startup":{"claim":{"title":"","body":"","retrievalQuery":""},"concession":{"title":"","body":"","retrievalQuery":""}},"research":{"claim":{"title":"","body":"","retrievalQuery":""},"concession":{"title":"","body":"","retrievalQuery":""}}},"hidden":[{"title":"","body":"","retrievalQuery":""},{"title":"","body":"","retrievalQuery":""}],"mutations":[{"low":0,"mode":0,"high":0,"confidence":0.5,"reason":"startup financial floor"},{"low":0,"mode":0,"high":0,"confidence":0.5,"reason":"startup ownership upside"},{"low":0,"mode":0,"high":0,"confidence":0.5,"reason":"research AI growth"},{"low":0,"mode":0,"high":0,"confidence":0.5,"reason":"research optionality"}]}`

export async function generateLiveScenario(prompt: string, modelId: string): Promise<LiveScenario> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 90_000)
  try {
    const request = async (messages: Array<{ role: string; content: string }>) => {
      const response = await fetch('/lmstudio/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ model: modelId, temperature: 0.2, max_tokens: 1800, reasoning_effort: 'none', messages }),
      })
      if (!response.ok) throw new Error(`LM Studio generation failed (${response.status}).`)
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
      const content = payload.choices?.[0]?.message?.content
      if (!content) throw new Error('LM Studio returned an empty response.')
      return content
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `${prompt.slice(0, 520)}\n/no_think` },
    ]
    const content = await request(messages)
    try {
      return parseLiveScenario(content, modelId)
    } catch {
      const repaired = await request([
        ...messages,
        { role: 'assistant', content },
        { role: 'user', content: 'Repair the response into strict RFC 8259 JSON matching the requested shape. Use double quotes and return JSON only. /no_think' },
      ])
      try {
        return parseLiveScenario(repaired, modelId)
      } catch (repairError) {
        throw new Error('LM Studio returned invalid structured output after one repair attempt.', { cause: repairError })
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('LM Studio took longer than 90 seconds to answer.', { cause: error })
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
