import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AGENTS } from '../scenario/builtin'
import { AgentGlyph } from './AgentGlyph'
import { BrandMark } from './BrandMark'
import { LoadingEllipsis } from './LoadingEllipsis'

const updates = [
  'Mapping constraints',
  'Testing asymmetric upside',
  'Quantifying the tradeoffs',
  'Challenging weak assumptions',
]

export function LiveReasoning({ prompt, model }: { prompt: string; model: string }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => setStep((current) => Math.min(current + 1, updates.length - 1)), 2_400)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <main className="thinking-shell">
      <header className="thinking-header">
        <BrandMark />
        <span>Local analysis</span>
      </header>
      <section className="thinking-stage" aria-live="polite">
        <p className="thinking-label">The council is thinking</p>
        <h1>Four perspectives are working in parallel.</h1>
        <div className="thinking-council" aria-label="Council thinking progress">
          {AGENTS.map((agent, index) => {
            const state = index < step ? 'complete' : index === step ? 'active' : 'queued'
            return (
              <motion.article
                className={`thinking-agent is-${state}`}
                key={agent.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: state === 'queued' ? 0.36 : 1, y: 0, scale: state === 'active' ? 1.035 : 1 }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <AgentGlyph agentId={agent.id} active={state === 'active'} />
                <strong>{agent.name}</strong>
                <span>{state === 'complete' ? 'Perspective staged' : state === 'active' ? updates[index] : 'Queued'}</span>
                <div className="thinking-agent__output"><LoadingEllipsis label={`${agent.name} is thinking`} /></div>
              </motion.article>
            )
          })}
        </div>
        <p className="thinking-note">This can take a moment with a larger local model. You’ll move into the deliberation automatically when its response is ready.</p>
        <blockquote>{prompt}</blockquote>
        <span className="thinking-model">Running privately with {model}</span>
      </section>
    </main>
  )
}
