import { AnimatePresence, motion } from 'motion/react'
import type { LedgerEntry } from '../domain/types'
import type { RetrievalResult } from '../evidence/retrieval'
import {
  AGENTS,
  type AgentId,
  type ClaimArtifact,
  type DemoPhase,
  type HiddenConsideration,
} from '../scenario/builtin'
import { AgentGlyph } from './AgentGlyph'
import { LoadingEllipsis } from './LoadingEllipsis'

const personaCopy: Record<AgentId, string> = {
  stableAdvocate: 'Grounded · Contextual',
  startupAdvocate: 'Forward · Exploratory',
  researchAdvocate: 'Precise · Illuminating',
  skeptic: 'Contrarian · Challenging',
}

interface PathArenaProps {
  phase: DemoPhase
  visibleClaimIds: string[]
  visibleConsiderationIds: string[]
  claims: ClaimArtifact[]
  hiddenConsiderations: HiddenConsideration[]
  citations: Record<string, RetrievalResult>
  activeAgent: AgentId | null
  latestLedgerEntry: LedgerEntry | null
}

type Memo = { title: string; body: string } | null

export function PathArena({ phase, visibleClaimIds, visibleConsiderationIds, claims, hiddenConsiderations, activeAgent, latestLedgerEntry }: PathArenaProps) {
  const latestClaim = (agentId: AgentId) => claims
    .filter((claim) => claim.agentId === agentId && visibleClaimIds.includes(claim.id))
    .at(-1) ?? null
  const latestChallenge = hiddenConsiderations
    .filter((item) => visibleConsiderationIds.includes(item.id))
    .at(-1) ?? null

  const memoByAgent: Record<AgentId, Memo> = {
    stableAdvocate: latestClaim('stableAdvocate'),
    startupAdvocate: latestClaim('startupAdvocate'),
    researchAdvocate: latestClaim('researchAdvocate'),
    skeptic: latestChallenge,
  }

  const speaker = AGENTS.find((agent) => agent.id === activeAgent) ?? AGENTS[0]
  const activeMemo = memoByAgent[speaker.id]
  const isSynthesis = phase === 'analysis' || phase === 'recompute' || phase === 'explore'

  const log = latestLedgerEntry
    ? [`${latestLedgerEntry.actor} updated the model.`, latestLedgerEntry.title, latestLedgerEntry.detail]
    : activeMemo
      ? [
          speaker.id === 'skeptic' ? 'Vesper challenged a load-bearing assumption.' : `${speaker.name} delivered a perspective memo.`,
          activeMemo.title,
          speaker.id === 'skeptic' ? 'The council is revisiting scores and dependencies.' : 'The other perspectives are testing the claim.',
        ]
      : []

  return (
    <section className={`arena council-map arena--${phase}`} aria-label="Decision council deliberation">
      <span className="arena__coordinates">34.0522° N<br />118.2437° W</span>

      <svg className="council-map__orbits" viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="orbit-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          <marker id="challenge-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <ellipse cx="600" cy="280" rx="360" ry="208" />
        <ellipse cx="600" cy="280" rx="505" ry="310" className="orbit-faint" />
        <path d="M 385 102 C 520 54, 680 54, 807 108" markerEnd="url(#orbit-arrow)" />
        <path d="M 820 435 C 680 492, 518 492, 376 438" markerEnd="url(#orbit-arrow)" />
        <path d="M 317 152 C 235 236, 235 344, 318 411" markerEnd="url(#orbit-arrow)" />
        <path className="challenge-path" d="M 882 417 C 949 342, 936 221, 858 150" markerEnd="url(#challenge-arrow)" />
      </svg>

      <div className={`decision-axis${isSynthesis ? ' is-synthesizing' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="86" />
          <ellipse cx="120" cy="120" rx="86" ry="34" />
          <ellipse cx="120" cy="120" rx="36" ry="86" />
          <path d="M34 120h172M120 34v172" />
          <path d="M120 18 130 108 222 120 130 132 120 222 110 132 18 120 110 108Z" className="decision-axis__needle" />
          <circle cx="120" cy="120" r="7" className="decision-axis__center" />
        </svg>
        <span>{isSynthesis ? 'Synthesizing' : 'Decision meridian'}</span>
      </div>

      {AGENTS.map((agent, index) => {
        const memo = memoByAgent[agent.id]
        const isActive = agent.id === activeAgent
        const isChallenging = agent.id === 'skeptic' && phase === 'skeptic'
        return (
          <motion.article
            className={`council-agent council-agent--${agent.id}${isActive ? ' is-active' : ''}`}
            key={agent.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: isActive ? 1.035 : 1, y: isActive ? -3 : 0 }}
            transition={{ duration: 0.32, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
          >
            <AgentGlyph agentId={agent.id} active={isActive} />
            <div className="council-agent__identity">
              <strong>{agent.name}</strong>
              <span>{personaCopy[agent.id]}</span>
            </div>
            <div className={`council-agent__status${isChallenging ? ' is-challenging' : ''}`}>
              <i />
              {isChallenging ? 'Challenging' : isActive ? (isSynthesis ? 'Synthesizing' : 'Thinking') : memo ? 'Memo delivered' : <LoadingEllipsis label={`${agent.name} is thinking`} />}
            </div>
          </motion.article>
        )
      })}

      {AGENTS.map((agent) => {
        const memo = memoByAgent[agent.id]
        return (
          <motion.aside
            className={`agent-memo agent-memo--${agent.id}${memo ? ' is-delivered' : ''}`}
            key={`${agent.id}-memo`}
            animate={{ opacity: memo ? 1 : 0.68, y: memo ? 0 : 3 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div><i aria-hidden="true">▤</i><strong>{agent.name} memo</strong></div>
            {memo ? <p>{memo.body}</p> : <p className="agent-memo__loading"><LoadingEllipsis label={`${agent.name} memo is loading`} /></p>}
          </motion.aside>
        )
      })}

      <AnimatePresence>
        {phase === 'skeptic' && (
          <motion.p className="challenge-note" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            Vesper challenged<br />Aster’s runway assumption
          </motion.p>
        )}
      </AnimatePresence>

      <motion.aside className="cross-exam-log" layout aria-live="polite">
        <div><i /> <strong>{isSynthesis ? 'Live synthesis' : 'Live cross-examination'}</strong></div>
        {log.length > 0 ? log.map((line) => <p key={line}>{line}</p>) : <p className="cross-exam-log__loading"><LoadingEllipsis label="Council activity is loading" /></p>}
        <small>Last updated&nbsp; · &nbsp;Just now</small>
      </motion.aside>
    </section>
  )
}
