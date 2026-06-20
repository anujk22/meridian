import type { CSSProperties } from 'react'
import type { DecisionResults, OptionId } from '../domain/types'

const optionOrder: OptionId[] = ['stable', 'startup', 'research']

export function SimulationField({ results, compact = false }: { results: DecisionResults; compact?: boolean }) {
  const dots = Array.from({ length: compact ? 42 : 108 }, (_, index) => {
    const position = (index + 0.5) / (compact ? 42 : 108) * 100
    let cumulative = 0
    const optionIndex = Math.max(0, results.options.findIndex((option) => {
      cumulative += option.share
      return position <= cumulative
    }))
    const optionId = optionOrder[optionIndex]
    const clusterX = [18, 50, 82][optionIndex]
    const angle = index * 2.399963
    const radius = 3 + ((index * 17) % 15)
    return {
      id: index,
      optionId,
      x: clusterX + Math.cos(angle) * radius,
      y: 52 + Math.sin(angle) * radius * 0.72,
      delay: `${-(index % 19) * 110}ms`,
    }
  })

  return (
    <section className={`simulation-field${compact ? ' simulation-field--compact' : ''}`} aria-label={`${results.sampleCount.toLocaleString()} seeded Monte Carlo scenarios`}>
      <header>
        <div><span className="live-signal" /> Scenario field</div>
        <strong>{results.sampleCount.toLocaleString()} seeded trials</strong>
      </header>
      <svg viewBox="0 0 100 82" role="img" aria-label="Simulation outcomes clustering around the three decision paths">
        <path className="simulation-field__trace" d="M50 8 C43 25 28 28 18 50" />
        <path className="simulation-field__trace" d="M50 8 C50 25 50 34 50 50" />
        <path className="simulation-field__trace" d="M50 8 C57 25 72 28 82 50" />
        {dots.map((dot) => (
          <circle
            className={`simulation-dot simulation-dot--${dot.optionId}`}
            cx={dot.x}
            cy={dot.y}
            r={compact ? 0.78 : 0.62}
            key={dot.id}
            style={{ '--dot-delay': dot.delay } as CSSProperties}
          />
        ))}
        {results.options.map((option, index) => (
          <g className={`simulation-cluster simulation-cluster--${option.id}`} key={option.id}>
            <circle cx={[18, 50, 82][index]} cy="52" r="17" />
            <text x={[18, 50, 82][index]} y="77" textAnchor="middle">{option.label.replace('Stable SWE Job', 'Stable SWE').replace('Early AI Startup', 'Startup').replace("Funded AI Master's", 'Research')} · {option.share}%</text>
          </g>
        ))}
      </svg>
    </section>
  )
}
