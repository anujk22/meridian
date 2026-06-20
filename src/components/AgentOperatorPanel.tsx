import { motion } from 'motion/react'
import type { DecisionModel } from '../domain/types'
import { AGENTS, type AgentId, type ClaimArtifact, type DemoPhase, type HiddenConsideration } from '../scenario/builtin'

const operations: Record<AgentId, Record<'memos' | 'cross' | 'synthesis', string>> = {
  stableAdvocate: { memos: 'Testing the financial floor', cross: 'Challenging delayed income', synthesis: 'Reweighting downside protection' },
  startupAdvocate: { memos: 'Checking ownership upside', cross: 'Defending traction assumptions', synthesis: 'Running scenario spread' },
  researchAdvocate: { memos: 'Measuring durable AI depth', cross: 'Testing role quality', synthesis: 'Reweighting optionality' },
  skeptic: { memos: 'Scanning hidden assumptions', cross: 'Attacking load-bearing claims', synthesis: 'Verifying sensitivity lever' },
}

const affectedFactor: Record<AgentId, string> = {
  stableAdvocate: 'Financial floor',
  startupAdvocate: 'Ownership / upside',
  researchAdvocate: 'AI depth / optionality',
  skeptic: 'Confidence ranges',
}

function stageFor(phase: DemoPhase): 'memos' | 'cross' | 'synthesis' {
  if (phase === 'arguments' || phase === 'skeptic') return 'cross'
  if (phase === 'analysis' || phase === 'recompute' || phase === 'explore') return 'synthesis'
  return 'memos'
}

export function AgentOperatorPanel({
  agentId,
  phase,
  activeAgent,
  claims,
  visibleClaimIds,
  hiddenConsiderations,
  visibleConsiderationIds,
  model,
}: {
  agentId: AgentId
  phase: DemoPhase
  activeAgent: AgentId | null
  claims: ClaimArtifact[]
  visibleClaimIds: string[]
  hiddenConsiderations: HiddenConsideration[]
  visibleConsiderationIds: string[]
  model: DecisionModel
}) {
  const agent = AGENTS.find((candidate) => candidate.id === agentId)!
  const visibleClaims = claims.filter((claim) => claim.agentId === agentId && visibleClaimIds.includes(claim.id))
  const latestClaim = visibleClaims.at(-1)
  const latestChallenge = agentId === 'skeptic'
    ? hiddenConsiderations.filter((item) => visibleConsiderationIds.includes(item.id)).at(-1)
    : null
  const memo = latestClaim ?? latestChallenge
  const optionId = agentId === 'stableAdvocate' ? 'stable' : agentId === 'startupAdvocate' ? 'startup' : 'research'
  const option = model.options.find((candidate) => candidate.id === optionId)!
  const confidence = agentId === 'skeptic'
    ? Math.round((1 - model.assumptions.riskTolerance * 0.25) * 100)
    : Math.round(Object.values(option.factors).reduce((sum, factor) => sum + factor.confidence, 0) / 5 * 100)
  const active = activeAgent === agentId
  const stage = stageFor(phase)

  return (
    <motion.article
      className={`operator-panel operator-panel--${agentId}${active ? ' is-active' : ''}`}
      animate={{ opacity: active ? 1 : 0.72, x: active ? 3 : 0 }}
      transition={{ duration: 0.22 }}
    >
      <header>
        <span className="operator-seal">{agent.symbol}</span>
        <div><strong>{agent.name}</strong><small>{agent.role}</small></div>
        <i>{active ? 'live' : memo ? 'ready' : 'queued'}</i>
      </header>
      <div className="operator-operation"><span />{active ? operations[agentId][stage] : memo ? 'Memo attached to model' : operations[agentId][stage]}</div>
      <p>{memo?.body ?? (agentId === 'skeptic' ? 'Tracing assumptions that could reverse the recommendation.' : 'Decomposing the path into claims, tradeoffs, and uncertain ranges.')}</p>
      <footer>
        <span>{affectedFactor[agentId]}</span>
        <span>confidence <b>{confidence}%</b></span>
      </footer>
    </motion.article>
  )
}
