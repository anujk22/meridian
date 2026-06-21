export interface LocalModel {
  id: string
  loaded: boolean
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type LocalChatRequest = (
  messages: ChatMessage[],
  modelId: string,
  maxTokens?: number,
) => Promise<string>

export async function listLocalModels(): Promise<LocalModel[]> {
  const response = await fetch('/lmstudio/api/v1/models')
  if (!response.ok) throw new Error('LM Studio local server is not responding on port 1234.')
  const payload = await response.json() as {
    models?: Array<{
      type?: string
      key?: string
      display_name?: string
      loaded_instances?: Array<{ id?: string }>
    }>
  }
  const llms = (payload.models ?? []).filter(({ type }) => type === 'llm')
  const loaded = llms.flatMap(({ loaded_instances }) => loaded_instances ?? [])
    .map(({ id }) => id?.trim() ?? '')
    .filter(Boolean)
    .map((id) => ({ id, loaded: true }))
  const nemotron = llms.find(({ key, display_name }) => /nemotron.*nano|nano.*nemotron/i.test(`${key ?? ''} ${display_name ?? ''}`))
    ?? llms.find(({ key, display_name }) => /nemotron/i.test(`${key ?? ''} ${display_name ?? ''}`))
  const nemotronIsLoaded = Boolean(nemotron?.loaded_instances?.some(({ id }) => id?.trim()))
  if (nemotron?.key && !nemotronIsLoaded) loaded.push({ id: nemotron.key, loaded: false })
  return [...new Map(loaded.map((model) => [model.id, model])).values()]
}

export function preferredLocalModelId(models: LocalModel[]): string {
  return models.find(({ id, loaded }) => loaded && /nemotron.*nano|nano.*nemotron/i.test(id))?.id
    ?? models.find(({ id, loaded }) => loaded && /nemotron/i.test(id))?.id
    ?? models.find(({ loaded }) => loaded)?.id
    ?? models.find(({ id }) => /nemotron.*nano|nano.*nemotron/i.test(id))?.id
    ?? models.find(({ id }) => /nemotron/i.test(id))?.id
    ?? ''
}

export const requestLocalChat: LocalChatRequest = async (messages, modelId, maxTokens = 900) => {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 120_000)
  try {
    const response = await fetch('/lmstudio/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelId,
        temperature: 0.15,
        max_tokens: maxTokens,
        reasoning_effort: 'none',
        messages,
      }),
    })
    if (!response.ok) throw new Error(`LM Studio generation failed (${response.status}).`)
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = payload.choices?.[0]?.message?.content
    if (!content) throw new Error('LM Studio returned an empty response.')
    return content
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('A council member took longer than two minutes to answer.', { cause: error })
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
