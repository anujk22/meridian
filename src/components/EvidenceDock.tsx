import type { RetrievalResult } from '../evidence/retrieval'
import type { ClaimArtifact, HiddenConsideration } from '../scenario/builtin'
import { CitationChip } from './CitationChip'

export function EvidenceDock({
  citations,
  claims,
  hiddenConsiderations,
}: {
  citations: Record<string, RetrievalResult>
  claims: ClaimArtifact[]
  hiddenConsiderations: HiddenConsideration[]
}) {
  const artifacts = [...claims, ...hiddenConsiderations]
  const retrieved = Object.entries(citations).flatMap(([artifactId, result]) => {
    const artifact = artifacts.find((candidate) => candidate.id === artifactId)
    return result.chunks.map((chunk) => ({ artifactId, artifactTitle: artifact?.title ?? 'Council claim', chunk, mode: result.mode }))
  })
  const visible = retrieved.slice(-3).reverse()

  return (
    <section className="evidence-dock" aria-label="Local evidence corpus retrieval">
      <header>
        <div><span className="live-signal" /> Evidence attached</div>
        <strong>{retrieved.length} matches</strong>
      </header>
      {visible.length === 0 ? (
        <div className="evidence-dock__empty">
          <span>Local corpus standing by</span>
          <p>Sources attach here when a council claim needs factual context.</p>
        </div>
      ) : (
        <div className="evidence-dock__list">
          {visible.map(({ artifactId, artifactTitle, chunk, mode }) => (
            <div className="evidence-attachment" key={`${artifactId}-${chunk.id}`}>
              <small>Attached to “{artifactTitle}”</small>
              <CitationChip chunk={chunk} mode={mode} />
            </div>
          ))}
        </div>
      )}
      <footer><span>Corpus: 10 verified source notes</span><span>semantic + keyword fallback</span></footer>
    </section>
  )
}
