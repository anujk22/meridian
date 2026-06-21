import { motion, useReducedMotion } from 'motion/react'
import type { DecisionResults, OptionId } from '../domain/types'
import type { RetrievalResult } from '../evidence/retrieval'
import { AGENTS } from '../scenario/builtin'
import { AgentGlyph } from './AgentGlyph'
import { AtlasGlobe } from './AtlasGlobe'
import { BrandMark } from './BrandMark'
import { CitationChip } from './CitationChip'

const verdictCopy: Record<OptionId, {
  why: string
  risk: string
  changes: string
  actions: string[]
}> = {
  research: {
    why: 'Under the current priorities, structured exploration offers the strongest mix of growth, perspective, and future choice.',
    risk: 'The value of this path depends on it being bounded, affordable, and connected to what comes afterward.',
    changes: 'If immediate income or stability becomes critical, the continuity path becomes the cleaner call.',
    actions: ['Define the time, budget, and stopping conditions.', 'Test the plan with people affected by the decision.', 'Write a concrete re-entry or next-step plan.'],
  },
  stable: {
    why: 'Continuity currently protects the strongest combination of stability, relationships, and room to decide again later.',
    risk: 'A familiar path can become inertia if it is chosen mainly to avoid uncertainty.',
    changes: 'If the case for change becomes more concrete or the cost of waiting rises, the lead can move.',
    actions: ['Name what staying protects and what it postpones.', 'Set a date to revisit the decision with new evidence.', 'Create one low-risk experiment that tests the alternative.'],
  },
  startup: {
    why: 'The current assumptions reward agency, momentum, and the possibility created by a meaningful change.',
    risk: 'The upside is still partly an imagined future rather than a tested daily reality.',
    changes: 'If the evidence for change weakens or downside tolerance falls, continuity or exploration can lead.',
    actions: ['Verify the most important promise behind the change.', 'Model the financial, relationship, and wellbeing costs.', 'Find a reversible way to test the path before fully committing.'],
  },
}

export function Verdict({ results, citations, onBack, onRestart }: { results: DecisionResults; citations: Record<string, RetrievalResult>; onBack: () => void; onRestart: () => void }) {
  const reducedMotion = useReducedMotion()
  const leader = results.options.find((option) => option.id === results.leaderId)!
  const copy = verdictCopy[results.leaderId]
  const evidence = Array.from(new Map(Object.values(citations).flatMap((result) => result.chunks).map((chunk) => [chunk.id, chunk])).values()).slice(0, 2)
  return (
    <motion.main
      className="verdict"
      initial={reducedMotion ? { opacity: 0 } : { y: '100%' }}
      animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
      transition={{ duration: reducedMotion ? 0.18 : 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="verdict__header">
        <BrandMark />
        <div className="verdict__header-meta">
          <div><span>Decision brief</span><small>Conditional · assumption-based · local</small></div>
        </div>
      </header>
      <div className="verdict__body">
        <aside className="verdict__index">
          <AtlasGlobe compact active results={results} className="verdict__atlas" />
          <span>Your decision meridian</span>
          <strong>{leader.label}</strong>
          <div className="verdict__share">{leader.share}<small>%</small></div>
          <p>of simulated scenarios under current assumptions</p>
          <div className="verdict__ranges"><span>Floor {Math.round(leader.floor)}</span><span>Ceiling {Math.round(leader.ceiling)}</span></div>
        </aside>
        <article className="verdict__brief">
          <p className="verdict__date">Meridian brief · {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}</p>
          <h1>{leader.label} is the strongest current direction, conditionally.</h1>
          <p className="verdict__why">{copy.why}</p>
          <div className="verdict__logic">
            <div className="verdict__columns">
              <section><span>Biggest risk</span><p>{copy.risk}</p></section>
              <section><span>What would change it</span><p>{copy.changes}</p></section>
            </div>
            <section className="verdict__sensitivity">
              <span>Strongest sensitivity</span>
              <strong>{results.sensitivity.label}</strong>
              <p>This is the current assumption most capable of moving the recommendation.</p>
            </section>
          </div>
          <div className="verdict__supporting">
            <section className="verdict__council">
              <span>Council recap</span>
              <div>{AGENTS.map((agent) => <span key={agent.id}><AgentGlyph agentId={agent.id} /><strong>{agent.name}</strong></span>)}</div>
            </section>
            {evidence.length > 0 && <section className="verdict__evidence"><span>Evidence carried forward</span><div>{evidence.map((chunk) => <CitationChip chunk={chunk} key={chunk.id} />)}</div></section>}
          </div>
          <section className="next-actions">
            <span>Next three steps</span>
            <ol>{copy.actions.map((action) => <li key={action}>{action}</li>)}</ol>
          </section>
          <div className="verdict__footer">
            <p className="verdict__limitation">
              Meridian models assumptions, not the future. Its recommendation is only as useful as the inputs, which is why it exposes the assumption most worth verifying: <strong>{results.sensitivity.label.toLowerCase()}</strong>.
            </p>
            <div className="verdict__actions">
              <button className="ghost-button" type="button" onClick={onBack}>Adjust assumptions</button>
              <button className="primary-button" type="button" onClick={onRestart}>Replay deliberation</button>
            </div>
          </div>
        </article>
      </div>
    </motion.main>
  )
}
