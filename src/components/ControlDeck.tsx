import type { DecisionModel, FactorKey, ModelMutation } from '../domain/types'

interface ControlDeckProps {
  model: DecisionModel
  onMutation: (mutation: ModelMutation) => void
  onVerdict: () => void
}

const sliderFactors: Array<{ key: FactorKey; label: string }> = [
  { key: 'aiGrowth', label: 'AI growth' },
  { key: 'financialFloor', label: 'Financial floor' },
  { key: 'ownershipUpside', label: 'Ownership' },
]

export function ControlDeck({ model, onMutation, onVerdict }: ControlDeckProps) {
  const { assumptions } = model
  return (
    <section className="control-deck" aria-label="What-if controls">
      <div className="control-deck__title">
        <div><span>What changes the answer?</span><strong>Move the assumptions.</strong></div>
        <button type="button" className="primary-button" onClick={onVerdict}>Open decision brief</button>
      </div>

      <div className="control-deck__sliders">
        <label>
          <span><b>Risk tolerance</b><output>{Math.round(assumptions.riskTolerance * 100)}</output></span>
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
          label="Master’s fully funded"
          checked={assumptions.toggles.mastersFunded}
          onChange={(value) => onMutation({ kind: 'setToggle', toggle: 'mastersFunded', value, reason: 'User changed the funding assumption.' })}
        />
        <Toggle
          label="Startup has traction"
          checked={assumptions.toggles.startupTraction}
          onChange={(value) => onMutation({ kind: 'setToggle', toggle: 'startupTraction', value, reason: 'User changed the traction assumption.' })}
        />
        <Toggle
          label="Need high income now"
          checked={assumptions.toggles.incomeNow}
          onChange={(value) => onMutation({ kind: 'setToggle', toggle: 'incomeNow', value, reason: 'User changed the immediate-income constraint.' })}
        />
        <Toggle
          label="Prefer building"
          checked={assumptions.toggles.preferBuilding}
          onChange={(value) => onMutation({ kind: 'setToggle', toggle: 'preferBuilding', value, reason: 'User changed the ownership preference.' })}
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
