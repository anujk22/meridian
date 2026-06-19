import { motion } from 'motion/react'
import type { DecisionResults, OptionId } from '../domain/types'

const shortNames: Record<OptionId, string> = { stable: 'Stable', startup: 'Startup', research: 'Research' }

interface OutcomePanelProps {
  results: DecisionResults
  focused: boolean
}

export function OutcomePanel({ results, focused }: OutcomePanelProps) {
  const leader = results.options.find((option) => option.id === results.leaderId)!
  const axisX = (mean: number) => Math.max(26, Math.min(294, 26 + ((mean - 50) / 35) * 268))

  return (
    <aside className={`outcome-panel${focused ? ' is-focused' : ''}`} aria-label="Outcome simulator">
      <div className="panel-heading">
        <span>Outcome simulator</span>
        <small>{results.sampleCount.toLocaleString()} scenarios</small>
      </div>

      <div className="leader-readout" aria-live="polite">
        <span>Current true north</span>
        <strong>{shortNames[leader.id]}</strong>
        <p>Leads in {leader.share}% of simulated scenarios under current assumptions.</p>
      </div>

      <div className="axis-instrument">
        <div className="axis-instrument__label">
          <span>Meridian Axis</span>
          <small>modeled standing</small>
        </div>
        <svg viewBox="0 0 320 110" role="img" aria-label={`Meridian Axis. ${shortNames[leader.id]} leads.`}>
          <defs>
            <linearGradient id="axisSignal" x1="0" x2="1">
              <stop offset="0" stopColor="var(--axis-dim)" />
              <stop offset="1" stopColor="var(--analysis)" />
            </linearGradient>
          </defs>
          <path className="axis-orbit" d="M24 62 C88 20 232 20 296 62" />
          <line className="axis-line" x1="24" y1="62" x2="296" y2="62" />
          {[0, 1, 2, 3, 4].map((tick) => <line className="axis-tick" key={tick} x1={24 + tick * 68} y1="57" x2={24 + tick * 68} y2="67" />)}
          {results.options.map((option, index) => {
            const x = axisX(option.mean)
            const isLeader = option.id === results.leaderId
            return (
              <motion.g key={option.id} animate={{ x }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                {isLeader && <line className="true-north-needle" x1="0" y1="12" x2="0" y2="91" />}
                <circle className={`axis-marker axis-marker--${option.id}${isLeader ? ' is-leader' : ''}`} cx="0" cy={46 + index * 16} r={isLeader ? 6 : 5} />
                <text className="axis-marker-label" x="9" y={48 + index * 16} textAnchor="start">{shortNames[option.id]}</text>
              </motion.g>
            )
          })}
        </svg>
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
