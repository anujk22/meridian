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
        {chunk.title}
      </summary>
      <div className="citation-chip__body">
        <div className="citation-chip__mode">{mode === 'semantic' ? 'Semantic match' : 'Keyword fallback'}</div>
        <strong>{chunk.title}</strong>
        <p>{chunk.excerpt}</p>
        <span>{chunk.whyItMatters}</span>
        <code>{new URL(chunk.url).hostname}</code>
      </div>
    </details>
  )
}
