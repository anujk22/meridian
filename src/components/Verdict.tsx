import { motion } from 'motion/react'
import type { DecisionResults, OptionId } from '../domain/types'
import { BrandMark } from './BrandMark'

const verdictCopy: Record<OptionId, {
  condition: string
  why: string
  risk: string
  changes: string
  actions: string[]
}> = {
  research: {
    condition: 'Choose funded AI research, if the funding and lab access are real.',
    why: 'Under the current priorities, it serves durable AI depth while preserving strong industry and research options.',
    risk: 'Program quality is doing a great deal of work in this recommendation.',
    changes: 'If funding disappears or immediate income becomes critical, the stable job becomes the cleaner call.',
    actions: ['Verify the full funding package and renewal terms.', 'Speak with two current lab members about advisor access.', 'Compare placement into applied AI roles, not just program prestige.'],
  },
  stable: {
    condition: 'Choose the stable SWE role, then protect the AI trajectory deliberately.',
    why: 'The financial floor now matters most, and the job preserves the safest path to independence.',
    risk: 'A comfortable generalist role can quietly pull attention away from serious AI work.',
    changes: 'If the master’s is truly funded or the startup proves exceptional traction, the lead can move.',
    actions: ['Ask for concrete AI-team mobility and mentorship.', 'Map a twelve-month specialization plan before accepting.', 'Negotiate for projects that build durable technical depth.'],
  },
  startup: {
    condition: 'Choose the startup, if traction, runway, and ownership survive diligence.',
    why: 'The current assumptions reward autonomy, learning velocity, and asymmetric upside.',
    risk: 'Equity and role scope remain wide, low-confidence inputs rather than guaranteed value.',
    changes: 'If traction weakens or downside tolerance falls, the stable job or funded research path leads.',
    actions: ['Verify runway, revenue quality, and fundraising assumptions.', 'Model equity after dilution, exercise cost, and taxes.', 'Get role scope, mentorship, and decision rights in writing.'],
  },
}

export function Verdict({ results, onBack, onRestart }: { results: DecisionResults; onBack: () => void; onRestart: () => void }) {
  const leader = results.options.find((option) => option.id === results.leaderId)!
  const copy = verdictCopy[results.leaderId]
  return (
    <motion.main
      className="verdict"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="verdict__header">
        <BrandMark />
        <div><span>Decision brief</span><small>Conditional · assumption-based · local</small></div>
      </header>
      <div className="verdict__body">
        <aside className="verdict__index">
          <span>True north</span>
          <strong>{leader.label}</strong>
          <div className="verdict__share">{leader.share}<small>%</small></div>
          <p>of simulated scenarios under current assumptions</p>
          <div className="verdict__ranges"><span>Floor {Math.round(leader.floor)}</span><span>Ceiling {Math.round(leader.ceiling)}</span></div>
        </aside>
        <article className="verdict__brief">
          <p className="verdict__date">Meridian brief · {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}</p>
          <h1>{copy.condition}</h1>
          <p className="verdict__why">{copy.why}</p>
          <div className="verdict__columns">
            <section><span>Biggest risk</span><p>{copy.risk}</p></section>
            <section><span>What would change it</span><p>{copy.changes}</p></section>
          </div>
          <section className="next-actions">
            <span>Next three actions</span>
            <ol>{copy.actions.map((action) => <li key={action}>{action}</li>)}</ol>
          </section>
          <p className="verdict__limitation">
            Meridian models assumptions, not the future. Its recommendation is only as useful as the inputs, which is why it exposes the assumption most worth verifying: <strong>{results.sensitivity.label.toLowerCase()}</strong>.
          </p>
          <div className="verdict__actions">
            <button className="ghost-button" type="button" onClick={onBack}>Adjust assumptions</button>
            <button className="primary-button" type="button" onClick={onRestart}>Replay deliberation</button>
          </div>
        </article>
      </div>
    </motion.main>
  )
}
