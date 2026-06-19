import { AnimatePresence, motion } from 'motion/react'
import type { RetrievalResult } from '../evidence/retrieval'
import type { OptionId } from '../domain/types'
import {
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
}

export function PathArena({ phase, visibleClaimIds, visibleConsiderationIds, citations, prompt, claims, hiddenConsiderations, contextChips, goalChips }: PathArenaProps) {
  const showDecomposition = phase === 'decomposition'
  const showPaths = phase !== 'intake'

  return (
    <section className={`arena arena--${phase}`} aria-label="Decision arena">
      <div className="arena__grid" aria-hidden="true" />
      <div className="arena__header">
        <div>
          <span className="arena__phase">{showDecomposition ? 'Parsing the decision' : 'Decision arena'}</span>
          <h2>{showDecomposition ? 'Mess becomes structure.' : 'Three paths, one living model.'}</h2>
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
            className="paths"
            key="paths"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {(['stable', 'startup', 'research'] as OptionId[]).map((optionId, pathIndex) => {
              const pathClaims = claims.filter(
                (claim) => claim.optionId === optionId && visibleClaimIds.includes(claim.id),
              )
              return (
                <article className={`path path--${optionId}`} key={optionId}>
                  <div className="path__line" aria-hidden="true"><i /><span /></div>
                  <header>
                    <span>{pathMeta[optionId].numeral}</span>
                    <div>
                      <small>{pathMeta[optionId].label}</small>
                      <h3>{optionId === 'stable' ? 'Stable SWE' : optionId === 'startup' ? 'AI Startup' : 'Funded Research'}</h3>
                    </div>
                  </header>
                  <div className="path__artifacts">
                    <AnimatePresence initial={false}>
                      {pathClaims.map((claim) => (
                        <motion.div
                          className={`claim claim--${claim.kind}`}
                          key={claim.id}
                          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <span className="claim__index">{String(pathIndex + 1).padStart(2, '0')}</span>
                          <strong>{claim.title}</strong>
                          <p>{claim.body}</p>
                          {citations[claim.id]?.chunks.map((chunk) => (
                            <CitationChip key={chunk.id} chunk={chunk} mode={citations[claim.id].mode} />
                          ))}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {pathClaims.length === 0 && <div className="path__waiting">Awaiting advocate</div>}
                  </div>
                </article>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {visibleConsiderationIds.length > 0 && phase === 'skeptic' && (
          <motion.div
            className="hidden-considerations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {hiddenConsiderations.filter((item) => visibleConsiderationIds.includes(item.id)).map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 22, rotate: 0.8 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                className="hidden-card"
              >
                <span>Hidden tradeoff detected</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="hidden-card__citations">
                  {citations[item.id]?.chunks.map((chunk) => (
                    <CitationChip key={chunk.id} chunk={chunk} mode={citations[item.id].mode} />
                  ))}
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
