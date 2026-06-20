const phases = [
  { number: 1, label: 'Independent memos', detail: 'Claims attach to paths' },
  { number: 2, label: 'Cross-examination', detail: 'Assumptions are attacked' },
  { number: 3, label: 'Synthesis', detail: 'Scenarios converge' },
]

export function PhaseRail({ activePhase }: { activePhase: 1 | 2 | 3 }) {
  return (
    <nav className="cockpit-phase-rail" aria-label="Deliberation phases">
      {phases.map((phase) => {
        const status = phase.number < activePhase ? 'complete' : phase.number === activePhase ? 'active' : 'queued'
        return (
          <div className={`cockpit-phase is-${status}`} key={phase.number}>
            <span>{status === 'complete' ? '✓' : phase.number}</span>
            <div><strong>{phase.label}</strong><small>{phase.detail}</small></div>
            <i />
          </div>
        )
      })}
    </nav>
  )
}
