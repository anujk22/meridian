import { AnimatePresence, motion } from 'motion/react'
import type { DecisionResults, LedgerEntry } from '../domain/types'
import type { RetrievalResult } from '../evidence/retrieval'
import type { ReactNode } from 'react'
import {
  AGENTS,
  type AgentId,
  type ClaimArtifact,
  type DemoPhase,
  type HiddenConsideration,
} from '../scenario/builtin'
import { AgentGlyph } from './AgentGlyph'
import { AtlasGlobe } from './AtlasGlobe'
import { CitationChip } from './CitationChip'
import { LoadingEllipsis } from './LoadingEllipsis'

const personaCopy: Record<AgentId, ReactNode> = {
  stableAdvocate: <>Protects Stability <br />& Continuity</>,
  startupAdvocate: <>Tests Change <br />& Possibility</>,
  researchAdvocate: <>Maps Values & <br />Long-Term Fit</>,
  skeptic: <>Challenges the <br />Whole Story</>,
}

const routeByAgent: Record<AgentId, string> = {
  stableAdvocate: 'M 300 118 C 410 132, 475 202, 545 250',
  startupAdvocate: 'M 900 118 C 790 132, 725 202, 655 250',
  researchAdvocate: 'M 300 442 C 410 430, 475 358, 545 310',
  skeptic: 'M 900 442 C 790 430, 725 358, 655 310',
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
  results: DecisionResults
  preparing?: boolean
  preparationStatus?: string
  preparationError?: string | null
  onReturnToIntake?: () => void
}

type Memo = { id: string; title: string; body: string } | null

export function PathArena({
  phase,
  visibleClaimIds,
  visibleConsiderationIds,
  claims,
  hiddenConsiderations,
  citations,
  activeAgent,
  latestLedgerEntry,
  results,
  preparing = false,
  preparationStatus = 'The four counselors are reading the decision.',
  preparationError = null,
  onReturnToIntake,
}: PathArenaProps) {
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
  const isCrossExam = phase === 'skeptic'
  const isSynthesis = phase === 'analysis' || phase === 'recompute' || phase === 'explore'
  const log = preparationError
    ? ['Live council could not assemble.', preparationError]
    : preparing
      ? [preparationStatus, 'No claims appear until their citations and ranges pass validation.']
      : latestLedgerEntry
        ? [`${latestLedgerEntry.actor} updated the model.`, latestLedgerEntry.title, latestLedgerEntry.detail]
        : activeMemo
          ? [
              speaker.id === 'skeptic' ? 'Vesper challenged a load-bearing assumption.' : `${speaker.name} delivered a perspective memo.`,
              activeMemo.title,
              speaker.id === 'skeptic' ? 'The council is revisiting scores and dependencies.' : 'The other perspectives are testing the claim.',
            ]
          : []

  const routeIsActive = (agentId: AgentId) => {
    if (preparing || preparationError) return false
    if (isSynthesis) return true
    if (isCrossExam) return agentId === 'startupAdvocate' || agentId === 'skeptic'
    return activeAgent === agentId || Boolean(memoByAgent[agentId])
  }

  const agentIsEngaged = (agentId: AgentId) => {
    if (preparing) return false
    if (isSynthesis) return true
    if (isCrossExam) return agentId === 'startupAdvocate' || agentId === 'skeptic'
    return activeAgent === agentId
  }

  return (
    <section className={`arena council-map arena--${phase}${preparing ? ' is-preparing' : ''}${preparationError ? ' has-preparation-error' : ''}`} aria-label="Decision council deliberation">
      <div className="council-map__caption">
        <strong>{preparing ? 'Council Assembling' : isCrossExam ? 'Assumption Under Challenge' : isSynthesis ? 'Council Synthesis' : 'Four Perspectives, One Path Decision'}</strong>
        <span>{preparing ? preparationStatus : 'Claims, challenges, evidence, and model changes converge here.'}</span>
      </div>

      <svg className="council-map__orbits" viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="600" cy="280" rx="365" ry="218" className="orbit-main" />
        <ellipse cx="600" cy="280" rx="505" ry="310" className="orbit-faint" />
        {AGENTS.map((agent) => (
          <path
            id={`beam-${agent.id}`}
            key={agent.id}
            className={`council-beam council-beam--${agent.id}${routeIsActive(agent.id) ? ' is-active' : ''}`}
            d={routeByAgent[agent.id]}
          />
        ))}
        <path className={`challenge-beam${isCrossExam ? ' is-active' : ''}`} d="M 874 414 C 1010 300, 1010 170, 890 126" />
        {AGENTS.map((agent, index) => routeIsActive(agent.id) && (
          <circle className={`beam-glint beam-glint--${agent.id}`} r="3" key={`glint-${agent.id}`}>
            <animateMotion dur={`${1.65 + index * 0.12}s`} repeatCount="indefinite">
              <mpath href={`#beam-${agent.id}`} />
            </animateMotion>
          </circle>
        ))}
      </svg>

      <div className="council-atlas">
        <AtlasGlobe active={isSynthesis} preparing={preparing} pointingAt={preparing ? null : activeAgent} results={results} />
      </div>


      {AGENTS.map((agent, index) => {
        const memo = memoByAgent[agent.id]
        const isEngaged = agentIsEngaged(agent.id)
        const isChallenging = agent.id === 'skeptic' && isCrossExam
        return (
          <motion.article
            className={`council-agent council-agent--${agent.id}${isEngaged ? ' is-active' : ''}`}
            key={agent.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: isEngaged ? 1.1 : 1, y: isEngaged ? -7 : 0 }}
            transition={{ duration: 0.34, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="council-agent__halo" aria-hidden="true" />
            <AgentGlyph agentId={agent.id} active={isEngaged} />
            <div className="council-agent__identity">
              <strong>{agent.name}</strong>
              <span>{personaCopy[agent.id]}</span>
              <div className={`council-agent__status${isChallenging ? ' is-challenging' : ''}`}>
                <i />
                {preparationError ? 'Council paused' : preparing ? 'Reading the decision' : isChallenging ? 'Challenging Aster' : isEngaged ? (isSynthesis ? 'Synthesizing' : 'Counseling') : memo ? 'Memo delivered' : <LoadingEllipsis label={`${agent.name} is weighing the decision`} />}
              </div>
            </div>
          </motion.article>
        )
      })}

      {AGENTS.map((agent) => {
        const memo = memoByAgent[agent.id]
        const evidence = memo ? citations[memo.id]?.chunks[0] : undefined
        const active = agentIsEngaged(agent.id)
        return (
          <motion.aside
            className={`agent-memo agent-memo--${agent.id}${memo ? ' is-delivered' : ''}${active ? ' is-active' : ''}`}
            key={`${agent.id}-memo`}
            animate={{ opacity: memo ? 1 : preparing ? 0.46 : 0.68, y: memo ? 0 : 3 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="agent-memo__title"><i aria-hidden="true" /><strong>{agent.name} Memo</strong><span>{agent.id === 'skeptic' ? 'Challenge' : 'Counsel'}</span></div>
            {memo ? (
              <>
                <h3>{memo.title}</h3>
                <p>{memo.body}</p>
                {evidence && <CitationChip chunk={evidence} mode={citations[memo.id].mode} />}
              </>
            ) : <p className="agent-memo__loading"><LoadingEllipsis label={`${agent.name} memo is loading`} /></p>}
          </motion.aside>
        )
      })}

      <AnimatePresence>
        {isCrossExam && (
          <motion.p className="challenge-note" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            Vesper is testing Aster’s<br />upside and change assumptions
          </motion.p>
        )}
      </AnimatePresence>

      {!isSynthesis && (
        <motion.aside className="cross-exam-log" aria-live="polite">
          <div><i /> <strong>{preparing ? 'Preparing Live Council' : 'Council Signal'}</strong></div>
          {log.length > 0 ? log.map((line) => <p key={line}>{line}</p>) : <p className="cross-exam-log__loading"><LoadingEllipsis label="Council activity is loading" /></p>}
          {preparationError && onReturnToIntake ? <button type="button" onClick={onReturnToIntake}>Return to decision composer</button> : <small>{preparing ? 'Waiting for local generation' : 'Updated just now'}</small>}
        </motion.aside>
      )}
    </section>
  )
}
