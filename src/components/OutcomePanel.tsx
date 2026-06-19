import { motion } from 'motion/react'
import type { DecisionResults, OptionId } from '../domain/types'

const shortNames: Record<OptionId, string> = { stable: 'Stable', startup: 'Startup', research: 'Research' }

interface OutcomePanelProps {
  results: DecisionResults
  focused: boolean
}

export function OutcomePanel({ results, focused }: OutcomePanelProps) {
  const leader = results.options.find((option) => option.id === results.leaderId)!

  return (
    <aside className={`outcome-panel${focused ? ' is-focused' : ''}`} aria-label="Outcome simulator">
      <div className="panel-heading">
        <span>Current outlook</span>
        <small>{results.sampleCount.toLocaleString()} scenarios</small>
      </div>

      <div className="leader-readout" aria-live="polite">
        <span>Leading path</span>
        <strong>{shortNames[leader.id]}</strong>
        <p>Leads in {leader.share}% of simulated scenarios under current assumptions.</p>
      </div>

      <div className="scenario-shares">
        {results.options.map((option) => (
          <div className={`share-row share-row--${option.id}`} key={option.id}>
            <div><span>{shortNames[option.id]}</span><strong>{option.share}%</strong></div>
            <div className="share-track"><motion.i animate={{ width: `${option.share}%` }} transition={{ duration: 0.7 }} /></div>
          </div>
        ))}
      </div>

      <div className="range-readout">
        <div><span>Best floor</span><strong>{shortNames[[...results.options].sort((a, b) => b.floor - a.floor)[0].id]}</strong></div>
        <div><span>Best ceiling</span><strong>{shortNames[[...results.options].sort((a, b) => b.ceiling - a.ceiling)[0].id]}</strong></div>
      </div>

      <div className="sensitivity">
        <span>Most sensitive assumption</span>
        <strong>{results.sensitivity.label}</strong>
        <small>Moves the leader by about {Math.round(results.sensitivity.impact)} points</small>
      </div>
    </aside>
  )
}
