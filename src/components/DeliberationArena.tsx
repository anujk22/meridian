import type { DecisionModel, DecisionResults, LedgerEntry } from '../domain/types'
import type { RetrievalResult } from '../evidence/retrieval'
import type { AgentId, ClaimArtifact, DemoPhase, HiddenConsideration } from '../scenario/builtin'
import { AgentOperatorPanel } from './AgentOperatorPanel'
import { AssumptionLedger } from './AssumptionLedger'
import { DecisionGraph } from './DecisionGraph'
import { EvidenceDock } from './EvidenceDock'
import { OutcomePanel } from './OutcomePanel'
import { PhaseRail } from './PhaseRail'

export function DeliberationArena({
  phase,
  activeCouncilPhase,
  model,
  results,
  activeAgent,
  claims,
  visibleClaimIds,
  hiddenConsiderations,
  visibleConsiderationIds,
  citations,
  ledger,
  focus,
  controlsOpen,
  onTestAssumptions,
  generating,
  liveError,
}: {
  phase: DemoPhase
  activeCouncilPhase: 1 | 2 | 3
  model: DecisionModel
  results: DecisionResults
  activeAgent: AgentId | null
  claims: ClaimArtifact[]
  visibleClaimIds: string[]
  hiddenConsiderations: HiddenConsideration[]
  visibleConsiderationIds: string[]
  citations: Record<string, RetrievalResult>
  ledger: LedgerEntry[]
  focus: 'paths' | 'ledger' | 'axis' | 'controls'
  controlsOpen: boolean
  onTestAssumptions: () => void
  generating: boolean
  liveError: string | null
}) {
  return (
    <main className="deliberation-cockpit">
      <PhaseRail activePhase={activeCouncilPhase} />
      {generating && <div className="arena-status-banner"><span className="live-signal" /><strong>Structuring local council</strong><span>LM Studio is decomposing the decision while the model graph initializes.</span></div>}
      {liveError && <div className="arena-status-banner is-warning"><strong>Local model handoff</strong><span>{liveError} Continuing with deterministic council data.</span></div>}
      <section className="operator-stack" aria-label="Council operators">
        {(['stableAdvocate', 'startupAdvocate', 'researchAdvocate', 'skeptic'] as AgentId[]).map((agentId) => (
          <AgentOperatorPanel
            key={agentId}
            agentId={agentId}
            phase={phase}
            activeAgent={activeAgent}
            claims={claims}
            visibleClaimIds={visibleClaimIds}
            hiddenConsiderations={hiddenConsiderations}
            visibleConsiderationIds={visibleConsiderationIds}
            model={model}
          />
        ))}
      </section>
      <DecisionGraph phase={phase} model={model} results={results} activeAgent={activeAgent} latestLedgerEntry={ledger.at(-1) ?? null} />
      <aside className="telemetry-stack">
        <OutcomePanel results={results} focused={focus === 'axis'} controlsOpen={controlsOpen} onTestAssumptions={onTestAssumptions} />
        <EvidenceDock citations={citations} claims={claims} hiddenConsiderations={hiddenConsiderations} />
      </aside>
      <AssumptionLedger entries={ledger} focused={focus === 'ledger'} leaderLabel={results.options.find((option) => option.id === results.leaderId)?.label ?? ''} />
    </main>
  )
}
