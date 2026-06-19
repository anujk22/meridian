import { EVIDENCE_CORPUS, BUILTIN_RETRIEVAL_QUERIES } from '../src/evidence/corpus'

const modelResponse = await fetch('http://127.0.0.1:1234/v1/models')
if (!modelResponse.ok) throw new Error(`LM Studio models request failed: ${modelResponse.status}`)
const models = (await modelResponse.json()) as { data: Array<{ id: string }> }
const model = models.data.find(({ id }) => id.toLowerCase().includes('embed'))?.id
if (!model) throw new Error('No embedding model is loaded in LM Studio')

const corpusInputs = EVIDENCE_CORPUS.map(
  (chunk) => `${chunk.title}. ${chunk.excerpt} ${chunk.whyItMatters} ${chunk.tags.join(' ')}`,
)
const inputs = [...corpusInputs, ...BUILTIN_RETRIEVAL_QUERIES]
const embeddingResponse = await fetch('http://127.0.0.1:1234/v1/embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model, input: inputs }),
})
if (!embeddingResponse.ok) throw new Error(`Embedding request failed: ${embeddingResponse.status}`)
const payload = (await embeddingResponse.json()) as {
  data: Array<{ index: number; embedding: number[] }>
}
const ordered = [...payload.data].sort((a, b) => a.index - b.index)
const compact = (vector: number[]) => vector.map((value) => Math.round(value * 1_000_000) / 1_000_000)
const corpusVectors = ordered.slice(0, EVIDENCE_CORPUS.length).map(({ embedding }) => compact(embedding))
const queryVectors = ordered.slice(EVIDENCE_CORPUS.length).map(({ embedding }) => compact(embedding))

const output = {
  model,
  dimensions: corpusVectors[0]?.length ?? 0,
  generatedAt: new Date().toISOString(),
  corpus: Object.fromEntries(EVIDENCE_CORPUS.map((chunk, index) => [chunk.id, corpusVectors[index]])),
  queries: Object.fromEntries(BUILTIN_RETRIEVAL_QUERIES.map((query, index) => [query, queryVectors[index]])),
}

await Bun.write(
  new URL('../src/evidence/evidence-index.json', import.meta.url),
  `${JSON.stringify(output)}\n`,
)
console.log(`Indexed ${EVIDENCE_CORPUS.length} chunks and ${BUILTIN_RETRIEVAL_QUERIES.length} demo queries with ${model}.`)
