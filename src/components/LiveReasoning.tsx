import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AGENTS, type AgentId } from '../scenario/builtin'
import { AgentGlyph } from './AgentGlyph'
import { BrandMark } from './BrandMark'
import { DecisionAtlas } from './DecisionAtlas'
import { LoadingEllipsis } from './LoadingEllipsis'

const thinkingOrder: AgentId[] = ['stableAdvocate', 'startupAdvocate', 'skeptic', 'researchAdvocate']

const thinkingWork: Record<AgentId, string> = {
  stableAdvocate: 'mapping constraints',
  startupAdvocate: 'testing upside',
  researchAdvocate: 'quantifying tradeoffs',
  skeptic: 'challenging assumptions',
}

export function LiveReasoning({ prompt, model }: { prompt: string; model: string }) {
  const [step, setStep] = useState(0)
  const reducedMotion = useReducedMotion()
  const activeAgentId = thinkingOrder[step]
  const activeAgent = AGENTS.find((agent) => agent.id === activeAgentId)!

  useEffect(() => {
    const interval = window.setInterval(() => setStep((current) => (current + 1) % thinkingOrder.length), 1_800)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <main className="thinking-shell thinking-shell--atlas">
      <header className="thinking-header">
        <BrandMark />
        <span><i /> Live local · {model || 'Checking loaded models'}</span>
      </header>

      <section className="live-thinking-map" aria-live="polite">
        <p className="live-thinking-map__title">The council is thinking</p>

        <svg className="live-thinking-routes" viewBox="0 0 1200 650" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="thinking-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <path className={step === 0 ? 'is-active' : ''} d="M 350 165 C 500 90, 700 90, 850 165" markerEnd="url(#thinking-arrow)" />
          <path className={step === 1 ? 'is-active' : ''} d="M 900 205 C 1010 300, 1010 440, 900 515" markerEnd="url(#thinking-arrow)" />
          <path className={step === 2 ? 'is-active' : ''} d="M 850 555 C 700 625, 500 625, 350 555" markerEnd="url(#thinking-arrow)" />
          <path className={step === 3 ? 'is-active' : ''} d="M 300 515 C 190 420, 190 285, 300 205" markerEnd="url(#thinking-arrow)" />
        </svg>

        <DecisionAtlas active label="Live decision atlas" className="live-thinking-atlas" />

        {AGENTS.map((agent) => {
          const isActive = agent.id === activeAgentId
          return (
            <motion.article
              className={`live-thinking-agent live-thinking-agent--${agent.id}${isActive ? ' is-active' : ''}`}
              key={agent.id}
              animate={{ opacity: isActive ? 1 : 0.64, scale: isActive && !reducedMotion ? 1.2 : 1 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <AgentGlyph agentId={agent.id} active={isActive} />
              <div>
                <strong>{agent.name}</strong>
                <span>{isActive ? thinkingWork[agent.id] : 'standing by'}</span>
                <small>{isActive ? <><LoadingEllipsis label={`${agent.name} is thinking`} /> Thinking</> : 'Perspective ready'}</small>
              </div>
            </motion.article>
          )
        })}

        <aside className="live-thinking-status">
          <div><i /> <strong>{activeAgent.name} is {thinkingWork[activeAgent.id]}</strong></div>
          <p>{prompt}</p>
          <small>This can take a moment with a larger local model. You’ll move into the deliberation automatically when its response is ready.</small>
        </aside>
      </section>
    </main>
  )
}
