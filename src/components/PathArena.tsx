import { AnimatePresence, motion } from 'motion/react'
import type { RetrievalResult } from '../evidence/retrieval'
import type { LedgerEntry, OptionId } from '../domain/types'
import {
  AGENTS,
  type AgentId,
  type ClaimArtifact,
  type DemoPhase,
  type HiddenConsideration,
} from '../scenario/builtin'
import { CitationChip } from './CitationChip'

const pathMeta: Record<OptionId, { numeral: string; label: string }> = {
  stable: { numeral: 'I', label: 'Stable orbit' },
  startup: { numeral: 'II', label: 'Venture trajectory' },
  research: { numeral: 'III', label: 'Research meridian' },
}

const personaCopy: Record<AgentId, { title: string; belief: string }> = {
  meridian: { title: 'The synthesizer', belief: 'Keeps every argument anchored to the decision you actually described.' },
  stableAdvocate: { title: 'The pragmatist', belief: 'Protects your financial floor and asks what can compound safely.' },
  startupAdvocate: { title: 'The builder', belief: 'Looks for ownership, learning velocity, and asymmetric possibility.' },
  researchAdvocate: { title: 'The scholar', belief: 'Optimizes for durable depth, mentorship, and long-term technical range.' },
  skeptic: { title: 'The contrarian', belief: 'Challenges the assumption most likely to make a compelling story misleading.' },
  analyst: { title: 'The quantifier', belief: 'Translates the debate into ranges, confidence, and sensitivity.' },
}

interface PathArenaProps {
  phase: DemoPhase
  visibleClaimIds: string[]
  visibleConsiderationIds: string[]
  citations: Record<string, RetrievalResult>
  prompt: string
  claims: ClaimArtifact[]
  hiddenConsiderations: HiddenConsideration[]
  contextChips: string[]
  goalChips: string[]
  activeAgent: AgentId | null
  latestLedgerEntry: LedgerEntry | null
}

export function PathArena({ phase, visibleClaimIds, visibleConsiderationIds, citations, prompt, claims, hiddenConsiderations, contextChips, goalChips, activeAgent, latestLedgerEntry }: PathArenaProps) {
  const showDecomposition = phase === 'decomposition'
  const showPaths = phase !== 'intake'
  const speaker = AGENTS.find((agent) => agent.id === activeAgent) ?? AGENTS[0]
  const activeClaim = claims.filter((claim) => visibleClaimIds.includes(claim.id) && claim.agentId === activeAgent).at(-1)
  const activeConsideration = hiddenConsiderations.filter((item) => visibleConsiderationIds.includes(item.id)).at(-1)

  const speakerArtifact = activeAgent === 'skeptic' && activeConsideration
    ? { id: activeConsideration.id, title: activeConsideration.title, body: activeConsideration.body, kind: 'challenge' as const }
    : activeClaim
      ? { id: activeClaim.id, title: activeClaim.title, body: activeClaim.body, kind: activeClaim.kind }
      : null

  return (
    <section className={`arena arena--${phase}`} aria-label="Decision arena">
      <div className="arena__grid" aria-hidden="true" />
      <div className="arena__header">
        <div>
          <span className="arena__phase">{showDecomposition ? 'Mapping your decision' : 'Decision meridian'}</span>
          <h2>{showDecomposition ? 'Finding your reference point.' : 'Follow one perspective at a time.'}</h2>
        </div>
        <span className="arena__coordinates">40.7128° N · PRIVATE</span>
      </div>

      <AnimatePresence mode="wait">
        {showDecomposition ? (
          <motion.div
            className="decomposition"
            key="decomposition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <blockquote>{prompt}</blockquote>
            <div className="decomposition__split" aria-hidden="true"><span /><span /><span /></div>
            <div className="chip-groups">
              <div>
                <strong>What’s fixed</strong>
                <div className="chip-row">{contextChips.map((chip) => <span key={chip}>{chip}</span>)}</div>
              </div>
              <div>
                <strong>What matters</strong>
                <div className="chip-row chip-row--goals">{goalChips.map((chip) => <span key={chip}>{chip}</span>)}</div>
              </div>
            </div>
          </motion.div>
        ) : showPaths ? (
          <motion.div
            className="deliberation-focus"
            key={`${activeAgent}-${speakerArtifact?.id ?? phase}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <article className={`speaker-stage speaker-stage--${speaker.tone}`}>
              <div className="speaker-profile">
                <span className="speaker-profile__avatar">{speaker.symbol}</span>
                <div>
                  <small>{personaCopy[speaker.id].title}</small>
                  <strong>{speaker.name}</strong>
                  <p>{personaCopy[speaker.id].belief}</p>
                </div>
                <span className="speaker-profile__status"><i /> {activeAgent === 'meridian' ? 'Orienting' : 'Speaking now'}</span>
              </div>

              <div className="speaker-argument">
                {speakerArtifact ? (
                  <>
                    <span>{speakerArtifact.kind === 'concession' ? 'What gives this advocate pause' : speakerArtifact.kind === 'challenge' ? 'Hidden tradeoff surfaced' : 'The case being made'}</span>
                    <h3>{speakerArtifact.title}</h3>
                    <p>{speakerArtifact.body}</p>
                    <div className="speaker-argument__citations">
                      {citations[speakerArtifact.id]?.chunks.map((chunk) => (
                        <CitationChip key={chunk.id} chunk={chunk} mode={citations[speakerArtifact.id].mode} />
                      ))}
                    </div>
                  </>
                ) : activeAgent === 'analyst' && latestLedgerEntry ? (
                  <>
                    <span>Model update</span>
                    <h3>{latestLedgerEntry.title}</h3>
                    <p>{latestLedgerEntry.detail}</p>
                  </>
                ) : (
                  <>
                    <span>{phase === 'council' ? 'Council assembling' : 'Holding the reference point'}</span>
                    <h3>{phase === 'council' ? 'Six perspectives. No single voice gets the last word.' : 'The arguments are being reconciled against your goals.'}</h3>
                    <p>Meridian keeps the decision centered while each specialist examines it from a different angle.</p>
                  </>
                )}
              </div>
            </article>

            <div className="path-glance" aria-label="Path status">
              {(['stable', 'startup', 'research'] as OptionId[]).map((optionId) => {
                const latestClaim = claims.filter((claim) => claim.optionId === optionId && visibleClaimIds.includes(claim.id)).at(-1)
                const isActive = latestClaim?.agentId === activeAgent
                return (
                  <div className={`path-glance__item path-glance__item--${optionId}${isActive ? ' is-active' : ''}`} key={optionId}>
                    <span>{pathMeta[optionId].numeral}</span>
                    <div>
                      <small>{optionId === 'stable' ? 'Stable SWE' : optionId === 'startup' ? 'AI Startup' : 'Funded Research'}</small>
                      <strong>{latestClaim?.title ?? 'Waiting for its advocate'}</strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
