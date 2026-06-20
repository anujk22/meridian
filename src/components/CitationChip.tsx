import type { EvidenceChunk } from '../evidence/corpus'

interface CitationChipProps {
  chunk: EvidenceChunk
  mode?: 'semantic' | 'keyword'
}

export function CitationChip({ chunk, mode = 'semantic' }: CitationChipProps) {
  return (
    <a className="citation-chip" href={chunk.url} target="_blank" rel="noreferrer" title={`${chunk.title}: ${chunk.excerpt}`}>
      <span className="citation-chip__signal" aria-hidden="true" />
      <span><strong>{chunk.publisher}</strong> · {chunk.whyItMatters}</span>
      <small>{mode === 'semantic' ? 'Evidence match' : 'Evidence keyword match'}</small>
    </a>
  )
}
