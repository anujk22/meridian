import index from './evidence-index.json'
import { EVIDENCE_CORPUS, type EvidenceChunk } from './corpus'

export type RetrievalMode = 'semantic' | 'keyword'

export interface RetrievalResult {
  chunks: EvidenceChunk[]
  mode: RetrievalMode
}

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'not', 'cash'])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
}

function cosine(left: number[], right: number[]): number {
  if (left.length !== right.length || left.length === 0) return Number.NEGATIVE_INFINITY
  let dot = 0
  let leftNorm = 0
  let rightNorm = 0
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index]
    leftNorm += left[index] ** 2
    rightNorm += right[index] ** 2
  }
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm) || 1)
}

export function keywordRetrieve(query: string, limit = 2): EvidenceChunk[] {
  const terms = tokenize(query)
  return EVIDENCE_CORPUS
    .map((chunk) => {
      const haystack = tokenize(`${chunk.title} ${chunk.excerpt} ${chunk.whyItMatters} ${chunk.tags.join(' ')}`)
      const score = terms.reduce((total, term) => total + haystack.filter((word) => word === term).length, 0)
      return { chunk, score }
    })
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
    .slice(0, limit)
    .map(({ chunk }) => chunk)
}

function semanticRetrieve(vector: number[], limit: number): EvidenceChunk[] {
  return EVIDENCE_CORPUS
    .map((chunk) => ({
      chunk,
      score: cosine(vector, (index.corpus as Record<string, number[]>)[chunk.id] ?? []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ chunk }) => chunk)
}

async function embedRuntimeQuery(query: string): Promise<number[]> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 4000)
  try {
    const response = await fetch('/lmstudio/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: index.model, input: query }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Embedding request failed: ${response.status}`)
    const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> }
    const vector = payload.data?.[0]?.embedding
    if (!vector || vector.length !== index.dimensions) throw new Error('Embedding dimensions do not match the local index')
    return vector
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function retrieveEvidence(query: string, limit = 2): Promise<RetrievalResult> {
  const builtInVector = (index.queries as Record<string, number[]>)[query]
  if (builtInVector) return { chunks: semanticRetrieve(builtInVector, limit), mode: 'semantic' }

  try {
    const vector = await embedRuntimeQuery(query)
    return { chunks: semanticRetrieve(vector, limit), mode: 'semantic' }
  } catch {
    return { chunks: keywordRetrieve(query, limit), mode: 'keyword' }
  }
}

export function getEvidenceById(id: string): EvidenceChunk | undefined {
  return EVIDENCE_CORPUS.find((chunk) => chunk.id === id)
}
