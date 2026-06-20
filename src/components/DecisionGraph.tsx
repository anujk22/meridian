import type { CSSProperties } from 'react'
import type { DecisionModel, DecisionResults, LedgerEntry } from '../domain/types'
import type { AgentId, DemoPhase } from '../scenario/builtin'
import { SimulationField } from './SimulationField'

const agentLabels: Record<AgentId, { name: string; x: number; y: number }> = {
  stableAdvocate: { name: 'Harbor', x: 9, y: 23 },
  startupAdvocate: { name: 'Aster', x: 91, y: 23 },
  researchAdvocate: { name: 'Lumen', x: 9, y: 79 },
  skeptic: { name: 'Vesper', x: 91, y: 79 },
}

const optionPositions = [
  { id: 'stable', x: 27, y: 48, label: 'Stable SWE' },
  { id: 'startup', x: 73, y: 48, label: 'AI startup' },
  { id: 'research', x: 50, y: 80, label: 'AI research' },
] as const

const challengeCopy = [
  ['Vesper', 'Aster', 'What proves the startup has real traction?'],
  ['Harbor', 'Lumen', 'Does the master’s justify delayed income?'],
  ['Lumen', 'Harbor', 'Will stable SWE actually build AI depth?'],
  ['Aster', 'Harbor', 'Is safety being overweighted?'],
] as const

export function DecisionGraph({
  phase,
  model,
  results,
  activeAgent,
  latestLedgerEntry,
}: {
  phase: DemoPhase
  model: DecisionModel
  results: DecisionResults
  activeAgent: AgentId | null
  latestLedgerEntry: LedgerEntry | null
}) {
  const crossExam = phase === 'arguments' || phase === 'skeptic'
  const synthesis = phase === 'analysis' || phase === 'recompute' || phase === 'explore'
  const leader = results.options.find((option) => option.id === results.leaderId)!

  return (
    <section className={`decision-graph decision-graph--${crossExam ? 'cross-exam' : synthesis ? 'synthesis' : 'memos'}`} aria-label="Live computational decision graph">
      <header className="decision-graph__header">
        <div>
          <span className="live-signal" />
          <strong>{crossExam ? 'Cross-examination network' : synthesis ? 'Model convergence' : 'Independent claim mapping'}</strong>
        </div>
        <span>rev {String(model.revision).padStart(2, '0')} · deterministic seed 0x4D455249</span>
      </header>

      <div className="decision-graph__stage">
        <svg className="decision-graph__wiring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" /></marker>
            <filter id="graph-glow"><feGaussianBlur stdDeviation="0.45" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {Object.entries(agentLabels).map(([id, agent]) => (
            <path className={id === activeAgent ? `agent-wire agent-wire--${id} is-active` : `agent-wire agent-wire--${id}`} d={`M${agent.x} ${agent.y} Q50 38 50 52`} markerEnd="url(#graph-arrow)" key={id} />
          ))}
          {optionPositions.map((option) => <path className={`option-wire option-wire--${option.id}${option.id === results.leaderId ? ' is-leading' : ''}`} d={`M50 52 L${option.x} ${option.y}`} key={option.id} />)}
          {model.factors.map((factor, index) => {
            const x = 24 + index * 13
            return <path className="factor-wire" d={`M50 52 Q${x} 61 ${x} 68`} key={factor.key} />
          })}
          {crossExam && <>
            <path className="challenge-wire challenge-wire--one" d="M91 79 C76 58 78 35 91 23" />
            <path className="challenge-wire challenge-wire--two" d="M9 23 C34 14 69 14 91 23" />
          </>}
        </svg>

        <div className="decision-node">
          <span>Decision model</span>
          <strong>{leader.label}</strong>
          <small>{leader.share}% current lead</small>
          <i aria-hidden="true" />
        </div>

        {Object.entries(agentLabels).map(([id, agent]) => (
          <div className={`graph-agent graph-agent--${id}${id === activeAgent ? ' is-active' : ''}`} key={id} style={{ '--x': `${agent.x}%`, '--y': `${agent.y}%` } as CSSProperties}>
            <b>{agent.name.slice(0, 1)}</b><span>{agent.name}</span>
          </div>
        ))}

        {optionPositions.map((option) => {
          const result = results.options.find((candidate) => candidate.id === option.id)!
          return (
            <div className={`graph-option graph-option--${option.id}${result.id === results.leaderId ? ' is-leading' : ''}`} key={option.id} style={{ '--x': `${option.x}%`, '--y': `${option.y}%` } as CSSProperties}>
              <span>{option.label}</span><strong>{result.share}%</strong><small>{Math.round(result.floor)}–{Math.round(result.ceiling)}</small>
            </div>
          )
        })}

        <div className="factor-nodes">
          {model.factors.map((factor) => (
            <span key={factor.key}><i style={{ width: `${Math.round(model.assumptions.weights[factor.key] * 100)}%` }} />{factor.shortLabel}<b>{Math.round(model.assumptions.weights[factor.key] * 100)}</b></span>
          ))}
        </div>

        <div className="assumption-nodes">
          <span>Startup traction <b>{model.assumptions.toggles.startupTraction ? 'verified' : 'open'}</b></span>
          <span>Funding clarity <b>{model.assumptions.toggles.mastersFunded ? 'funded' : 'open'}</b></span>
          <span>Mentorship <b>verify</b></span>
          <span>AI role quality <b>verify</b></span>
          <span>Financial floor <b>{Math.round(model.assumptions.weights.financialFloor * 100)}%</b></span>
        </div>

        {crossExam && (
          <div className="challenge-stream" aria-live="polite">
            {challengeCopy.map(([from, to, text], index) => <span key={text} className={index === 0 ? 'is-current' : ''}><b>{from} → {to}</b>{text}</span>)}
          </div>
        )}

        {latestLedgerEntry && (
          <div className={`mutation-flash mutation-flash--${latestLedgerEntry.tone}`}>
            <span>{latestLedgerEntry.actor} mutation</span>
            <strong>{latestLedgerEntry.title}</strong>
          </div>
        )}
      </div>

      <SimulationField results={results} />
    </section>
  )
}
