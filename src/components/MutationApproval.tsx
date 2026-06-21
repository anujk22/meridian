import { useEffect, useRef } from 'react'
import { getEvidenceById } from '../evidence/retrieval'
import { FACTOR_LABELS, OPTION_LABELS, formatRange, type MutationTraceItem } from '../domain/trace'

interface MutationApprovalProps {
  item: MutationTraceItem
  onApply: () => void
  onIgnore: () => void
}

export function MutationApproval({ item, onApply, onIgnore }: MutationApprovalProps) {
  const applyRef = useRef<HTMLButtonElement>(null)
  const sources = item.evidenceIds.map(getEvidenceById).filter(Boolean)

  useEffect(() => applyRef.current?.focus(), [])

  return (
    <section className="control-deck mutation-approval" role="dialog" aria-modal="true" aria-labelledby="mutation-approval-title">
      <div className="mutation-approval__heading">
        <span>Human approval required</span>
        <strong id="mutation-approval-title">Review a validated assumption change</strong>
        <p>{item.origin} proposed this revision. The simulator remains unchanged until you decide.</p>
      </div>

      <div className="mutation-approval__change">
        <span>{OPTION_LABELS[item.mutation.optionId]} · {FACTOR_LABELS[item.mutation.factor]}</span>
        <div>
          <section><small>Current low / mode / high</small><strong>{formatRange(item.previousRange)}</strong></section>
          <i aria-hidden="true">→</i>
          <section><small>Proposed low / mode / high</small><strong>{formatRange(item.mutation.range)}</strong></section>
        </div>
      </div>

      <div className="mutation-approval__evidence">
        <span>Rationale</span>
        <p>{item.mutation.reason}</p>
        <small>{sources.length > 0 ? sources.map((source) => `${source?.id} · ${source?.title}`).join('  ·  ') : 'No source attached'}</small>
      </div>

      <div className="mutation-approval__actions">
        <button className="ghost-button" type="button" onClick={onIgnore}>Ignore</button>
        <button ref={applyRef} className="primary-button" type="button" onClick={onApply}>Apply Change</button>
      </div>
    </section>
  )
}
