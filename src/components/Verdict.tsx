import { motion, useReducedMotion } from 'motion/react'
import type { DecisionResults, OptionId } from '../domain/types'
import type { MutationTraceItem } from '../domain/trace'
import type { PathExplanation } from '../domain/explain'
import type { RetrievalResult } from '../evidence/retrieval'
import type { EvidenceChunk } from '../evidence/corpus'
import { AGENTS, type ClaimArtifact, type HiddenConsideration } from '../scenario/builtin'
import { AgentGlyph } from './AgentGlyph'
import { AtlasGlobe } from './AtlasGlobe'
import { BrandMark } from './BrandMark'
import { CitationChip } from './CitationChip'
import { ThemeToggle } from './ThemeToggle'
import { DecisionTrace } from './DecisionTrace'

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

interface VerdictProps {
  results: DecisionResults
  citations: Record<string, RetrievalResult>
  beforeCouncilResults: DecisionResults
  councilResults: DecisionResults
  traceEvidence: EvidenceChunk[]
  traceClaims: ClaimArtifact[]
  traceChallenges: HiddenConsideration[]
  mutationTrace: MutationTraceItem[]
  pathExplanations: PathExplanation[]
  onBack: () => void
  onRestart: () => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

export function Verdict({ results, citations, beforeCouncilResults, councilResults, traceEvidence, traceClaims, traceChallenges, mutationTrace, pathExplanations, onBack, onRestart, theme, onThemeToggle }: VerdictProps) {
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
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
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
          <h1>{copy.condition}</h1>
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
          <DecisionTrace before={beforeCouncilResults} after={councilResults} evidence={traceEvidence} claims={traceClaims} challenges={traceChallenges} mutations={mutationTrace} paths={pathExplanations} />
          <div className="verdict__supporting">
            <section className="verdict__council">
              <span>Council recap</span>
              <div>{AGENTS.map((agent) => <span key={agent.id}><AgentGlyph agentId={agent.id} /><strong>{agent.name}</strong></span>)}</div>
            </section>
            {evidence.length > 0 && <section className="verdict__evidence"><span>Evidence carried forward</span><div>{evidence.map((chunk) => <CitationChip chunk={chunk} key={chunk.id} />)}</div></section>}
          </div>
          <section className="next-actions">
            <span>Next three actions</span>
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
