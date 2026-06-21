import { motion } from 'motion/react'
import type { DecisionResults } from '../domain/types'

interface OutcomePanelProps {
  results: DecisionResults
  focused: boolean
  controlsOpen: boolean
  onTestAssumptions: () => void
}

export function OutcomePanel({ results, focused, controlsOpen, onTestAssumptions }: OutcomePanelProps) {
  const leader = results.options.find((option) => option.id === results.leaderId)!

  return (
    <aside className={`outcome-panel${focused ? ' is-focused' : ''}`} aria-label="Current decision lean">
      <div className="leader-readout" aria-live="polite">
        <span>Current lean</span>
        <strong>{leader.label}, conditionally</strong>
      </div>

      <div className="scenario-shares">
        {results.options.map((option) => (
          <div className={`share-row share-row--${option.id}`} key={option.id}>
            <div><span>{option.label}</span><strong>{option.share}%</strong></div>
            <div className="share-track"><motion.i animate={{ width: `${option.share}%` }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} /></div>
          </div>
        ))}
      </div>

      <div className="sensitivity">
        <span>Verify next</span>
        <strong>{results.sensitivity.label}</strong>
        <small>If this assumption fails, the recommendation may change.</small>
      </div>

      <button className="test-assumptions-button" type="button" onClick={onTestAssumptions}>
        {controlsOpen ? 'Close Assumptions' : 'Test Assumptions'} <span aria-hidden="true">›</span>
      </button>
    </aside>
  )
}
