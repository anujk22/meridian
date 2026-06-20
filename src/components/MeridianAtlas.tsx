import { motion, useReducedMotion } from 'motion/react'
import { effectiveRange } from '../domain/engine'
import { FACTOR_KEYS, type DecisionModel, type DecisionResults, type FactorKey, type LedgerEntry, type OptionId } from '../domain/types'
import type { AgentId, DemoPhase } from '../scenario/builtin'

const factorLabels: Record<FactorKey, string> = {
  aiGrowth: 'AI depth',
  financialFloor: 'Financial floor',
  ownershipUpside: 'Ownership',
  optionality: 'Optionality',
  sustainableFit: 'Sustainable fit',
}

const routeNames: Record<OptionId, string> = {
  stable: 'Stable',
  startup: 'Startup',
  research: 'Research',
}

const agentFocus: Record<AgentId, { optionId: OptionId; factor: FactorKey; label: string }> = {
  stableAdvocate: { optionId: 'stable', factor: 'financialFloor', label: 'Harbor maps the floor' },
  startupAdvocate: { optionId: 'startup', factor: 'ownershipUpside', label: 'Aster tests upside' },
  researchAdvocate: { optionId: 'research', factor: 'aiGrowth', label: 'Lumen checks depth' },
  skeptic: { optionId: 'startup', factor: 'financialFloor', label: 'Vesper challenges confidence' },
}

const plotX = (index: number) => 128 + index * 138
const plotY = (score: number) => 342 - score * 2.72

function smoothPath(points: Array<[number, number]>) {
  if (points.length < 2) return ''
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const midpoint = [(previous[0] + point[0]) / 2, (previous[1] + point[1]) / 2]
    return `${path} Q ${previous[0]} ${previous[1]} ${midpoint[0]} ${midpoint[1]}`
  }, `M ${points[0][0]} ${points[0][1]}`) + ` T ${points.at(-1)![0]} ${points.at(-1)![1]}`
}

function bandPath(upper: Array<[number, number]>, lower: Array<[number, number]>) {
  return `${smoothPath(upper)} L ${lower.at(-1)![0]} ${lower.at(-1)![1]} ${lower.slice(0, -1).reverse().map(([x, y]) => `L ${x} ${y}`).join(' ')} Z`
}

export function MeridianAtlas({ model, results, phase, activeAgent, latestLedgerEntry }: {
  model: DecisionModel
  results: DecisionResults
  phase: DemoPhase
  activeAgent: AgentId | null
  latestLedgerEntry: LedgerEntry | null
}) {
  const reducedMotion = useReducedMotion()
  const focus = activeAgent ? agentFocus[activeAgent] : agentFocus.stableAdvocate
  const activeFactor = latestLedgerEntry?.factor && FACTOR_KEYS.includes(latestLedgerEntry.factor as FactorKey)
    ? latestLedgerEntry.factor as FactorKey
    : focus.factor
  const activeOption = latestLedgerEntry?.pathId ?? focus.optionId
  const factorIndex = FACTOR_KEYS.indexOf(activeFactor)
  const focusedOption = model.options.find((option) => option.id === activeOption)!
  const focusedRange = effectiveRange(model, activeOption, activeFactor)
  const markerX = plotX(factorIndex)
  const markerY = plotY(focusedRange.mode)
  const isRerouting = phase === 'recompute' || Boolean(latestLedgerEntry?.before)

  return (
    <section className={`meridian-atlas${phase === 'skeptic' ? ' is-challenged' : ''}${isRerouting ? ' is-rerouting' : ''}`} aria-label="Meridian Atlas decision routes">
      <header className="atlas-header">
        <div>
          <span>Meridian Atlas</span>
          <strong>Three routes through five decision layers</strong>
        </div>
        <div className="atlas-telemetry">
          <span><i /> {results.sampleCount.toLocaleString()} scenarios</span>
          <span>Revision {String(model.revision).padStart(2, '0')}</span>
        </div>
      </header>

      <div className="atlas-canvas">
        <svg viewBox="0 0 920 410" role="img" aria-labelledby="atlas-title atlas-description">
          <title id="atlas-title">Stable, Startup, and Research decision routes</title>
          <desc id="atlas-description">Each route crosses five factor layers. The translucent band shows the modeled low-to-high range and the highlighted route is the current recommendation.</desc>
          <defs>
            <pattern id="atlas-grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M 34 0 L 0 0 0 34" className="atlas-grid-line" />
            </pattern>
            <filter id="atlas-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect x="0" y="0" width="920" height="410" rx="18" className="atlas-ground" />
          <rect x="0" y="0" width="920" height="410" rx="18" fill="url(#atlas-grid)" />

          {[25, 50, 75].map((score) => (
            <g className="terrain-contour" key={score}>
              <path d={`M 52 ${plotY(score)} C 250 ${plotY(score) - 8}, 510 ${plotY(score) + 11}, 860 ${plotY(score)}`} />
              <text x="28" y={plotY(score) + 4}>{score}</text>
            </g>
          ))}

          {FACTOR_KEYS.map((factor, index) => (
            <g className={`factor-layer${factor === activeFactor ? ' is-active' : ''}`} key={factor}>
              <rect x={plotX(index) - 45} y="34" width="90" height="316" rx="12" />
              <line x1={plotX(index)} y1="42" x2={plotX(index)} y2="348" />
              <text x={plotX(index)} y="374">{factorLabels[factor]}</text>
            </g>
          ))}

          {model.options.map((option) => {
            const result = results.options.find((candidate) => candidate.id === option.id)!
            const centers = FACTOR_KEYS.map((factor, index) => [plotX(index), plotY(effectiveRange(model, option.id, factor).mode)] as [number, number])
            const upper = FACTOR_KEYS.map((factor, index) => [plotX(index), plotY(effectiveRange(model, option.id, factor).high)] as [number, number])
            const lower = FACTOR_KEYS.map((factor, index) => [plotX(index), plotY(effectiveRange(model, option.id, factor).low)] as [number, number])
            centers.push([846, plotY(result.mean)])
            upper.push([846, plotY(result.ceiling)])
            lower.push([846, plotY(result.floor)])
            const isLeader = option.id === results.leaderId
            const isFocused = option.id === activeOption
            return (
              <g className={`atlas-route atlas-route--${option.id}${isLeader ? ' is-leader' : ''}${isFocused ? ' is-focused' : ''}`} key={option.id}>
                <motion.path
                  className="route-envelope"
                  initial={false}
                  animate={{ d: bandPath(upper, lower) }}
                  transition={{ duration: reducedMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.path
                  className="route-line"
                  initial={false}
                  animate={{ d: smoothPath(centers) }}
                  transition={{ duration: reducedMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
                {centers.slice(0, -1).map(([x, y], index) => <circle className="route-node" cx={x} cy={y} r={isLeader ? 4.6 : 3.2} key={FACTOR_KEYS[index]} />)}
                <circle className="route-destination" cx="846" cy={plotY(result.mean)} r={isLeader ? 8 : 5} />
              </g>
            )
          })}

          <g className={`atlas-probe atlas-probe--${activeAgent ?? 'stableAdvocate'}`} transform={`translate(${markerX} ${markerY})`}>
            <circle className="probe-pulse" r="20" />
            <circle className="probe-core" r="7" />
            <path d="M 0 -8 L 0 -38 L 12 -48" />
            <text x="17" y="-45">{activeAgent ? agentFocus[activeAgent].label : 'Mapping decision terrain'}</text>
          </g>

          {latestLedgerEntry?.before && (
            <g className="challenge-pin" transform={`translate(${markerX} ${markerY})`} filter="url(#atlas-glow)">
              <path d="M 0 -14 L 12 0 0 14 -12 0 Z" />
              <text x="17" y="4">{latestLedgerEntry.before} → {latestLedgerEntry.after}</text>
            </g>
          )}
        </svg>
      </div>

      <footer className="atlas-footer">
        <span className="atlas-route-legend">
          {results.options.map((option) => <b className={`is-${option.id}${option.id === results.leaderId ? ' is-leader' : ''}`} key={option.id}><i />{routeNames[option.id]} {option.share}%</b>)}
        </span>
        <span><i className="terrain-key" /> Range: modeled floor to ceiling</span>
        <strong>{focusedOption.shortLabel} · {factorLabels[activeFactor]}</strong>
      </footer>
    </section>
  )
}
