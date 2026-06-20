import type { EvidenceChunk } from '../evidence/corpus'

interface CitationChipProps {
  chunk: EvidenceChunk
  mode?: 'semantic' | 'keyword'
}

export function CitationChip({ chunk, mode = 'semantic' }: CitationChipProps) {
  return (
    <details className="citation-chip">
      <summary title={`${chunk.publisher}: ${chunk.title}`}>
        <span className="citation-chip__signal" aria-hidden="true" />
        <span><strong>{chunk.publisher}</strong>{chunk.title}</span>
        <b>{mode === 'semantic' ? 'vector' : 'keyword'}</b>
      </summary>
      <div className="citation-chip__body">
        <div className="citation-chip__mode">{mode === 'semantic' ? 'Embedding match' : 'Keyword fallback'} · {chunk.published}</div>
        <p>{chunk.excerpt}</p>
        <span>{chunk.whyItMatters}</span>
        <code>{new URL(chunk.url).hostname} · local corpus snapshot</code>
      </div>
    </details>
  )
}
