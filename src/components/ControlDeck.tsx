import type { DecisionModel, FactorKey, ModelMutation } from '../domain/types'

interface ControlDeckProps {
  model: DecisionModel
  onMutation: (mutation: ModelMutation) => void
  onVerdict: () => void
  leader: string
  share: number
  sensitivity: string
}

const sliderFactors: Array<{ key: FactorKey; label: string }> = [
  { key: 'aiGrowth', label: 'Growth & Learning' },
  { key: 'financialFloor', label: 'Financial Floor' },
  { key: 'ownershipUpside', label: 'Agency & Upside' },
]

export function ControlDeck({ model, onMutation, onVerdict, leader, share, sensitivity }: ControlDeckProps) {
  const { assumptions } = model
  return (
    <section className="control-deck" aria-label="What-if controls">
      <div className="control-deck__title">
        <div>
          <span>Analysis Complete</span>
          <strong>{leader} leads in {share}% of scenarios.</strong>
          <p>Try changing <b>{sensitivity.toLowerCase()}</b> first. It has the strongest effect on the recommendation.</p>
        </div>
        <button type="button" className="primary-button" onClick={onVerdict}>Review Recommendation</button>
      </div>

      <div className="control-deck__sliders">
        <label>
          <span><b>Risk Tolerance</b><output>{Math.round(assumptions.riskTolerance * 100)}</output></span>
          <input
            aria-label="Risk tolerance"
            type="range"
            min="0"
            max="100"
            value={Math.round(assumptions.riskTolerance * 100)}
            onChange={(event) => onMutation({ kind: 'setRisk', value: Number(event.target.value) / 100, reason: 'User changed downside tolerance.' })}
          />
        </label>
        {sliderFactors.map(({ key, label }) => (
          <label key={key}>
            <span><b>{label}</b><output>{Math.round(assumptions.weights[key] * 100)}</output></span>
            <input
              aria-label={`${label} weight`}
              type="range"
              min="5"
              max="60"
              value={Math.round(assumptions.weights[key] * 100)}
              onChange={(event) => onMutation({ kind: 'setWeight', factor: key, value: Number(event.target.value) / 100, reason: `User changed ${label.toLowerCase()} priority.` })}
            />
          </label>
        ))}
      </div>

      <div className="control-deck__toggles">
        <Toggle
          label="Exploration Path Is Affordable"
          checked={assumptions.toggles.mastersFunded}
          onChange={(value) => onMutation({ kind: 'setToggle', toggle: 'mastersFunded', value, reason: 'User changed the affordability assumption.' })}
        />
        <Toggle
          label="Change Path Has Strong Evidence"
          checked={assumptions.toggles.startupTraction}
          onChange={(value) => onMutation({ kind: 'setToggle', toggle: 'startupTraction', value, reason: 'User changed the evidence supporting the change path.' })}
        />
        <Toggle
          label="Need High Income Now"
          checked={assumptions.toggles.incomeNow}
          onChange={(value) => onMutation({ kind: 'setToggle', toggle: 'incomeNow', value, reason: 'User changed the immediate-income constraint.' })}
        />
        <Toggle
          label="Prefer Greater Agency"
          checked={assumptions.toggles.preferBuilding}
          onChange={(value) => onMutation({ kind: 'setToggle', toggle: 'preferBuilding', value, reason: 'User changed the agency preference.' })}
        />
      </div>
    </section>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span aria-hidden="true"><i /></span>
      <b>{label}</b>
    </label>
  )
}
