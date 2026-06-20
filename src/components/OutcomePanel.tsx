import { motion } from 'motion/react'
import type { DecisionResults, OptionId } from '../domain/types'

const shortNames: Record<OptionId, string> = { stable: 'Stable', startup: 'Startup', research: 'Research' }

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
        <div><strong>{shortNames[leader.id]}</strong><b>, conditionally</b><i aria-label="The result depends on current assumptions">i</i></div>
      </div>

      <div className="scenario-shares">
        {results.options.map((option) => (
          <div className={`share-row share-row--${option.id}`} key={option.id}>
            <div><span>{shortNames[option.id]}</span><strong>{option.share}%</strong></div>
            <div className="share-track"><motion.i animate={{ width: `${option.share}%` }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} /></div>
          </div>
        ))}
      </div>

      <p className="sensitivity">Changes if <strong>{results.sensitivity.label.toLowerCase()}</strong> cannot be verified.</p>

      <button className="test-assumptions-button" type="button" onClick={onTestAssumptions}>
        {controlsOpen ? 'Close assumptions' : 'Test assumptions'} <span aria-hidden="true">›</span>
      </button>
    </aside>
  )
}
