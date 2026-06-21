import { computeDecision } from './engine'
import { applyMutations } from './mutations'
import type { DecisionModel, DecisionResults, ModelMutation, OptionId } from './types'

interface CandidateChange {
  label: string
  mutation: ModelMutation
}

export interface PathExplanation {
  optionId: OptionId
  optionLabel: string
  leadsNow: boolean
  achievesLead: boolean
  changes: string[]
  projectedShare: number
}

const CANDIDATES: Record<OptionId, CandidateChange[]> = {
  stable: [
    { label: 'Need high income now', mutation: { kind: 'setToggle', toggle: 'incomeNow', value: true, reason: 'Path explanation.' } },
    { label: 'Lower downside tolerance', mutation: { kind: 'setRisk', value: 0.08, reason: 'Path explanation.' } },
    { label: 'Treat master’s funding as uncertain', mutation: { kind: 'setToggle', toggle: 'mastersFunded', value: false, reason: 'Path explanation.' } },
    { label: 'Prioritize the financial floor', mutation: { kind: 'setWeight', factor: 'financialFloor', value: 0.48, reason: 'Path explanation.' } },
  ],
  startup: [
    { label: 'Confirm startup traction and runway', mutation: { kind: 'setToggle', toggle: 'startupTraction', value: true, reason: 'Path explanation.' } },
    { label: 'Accept greater downside risk', mutation: { kind: 'setRisk', value: 0.92, reason: 'Path explanation.' } },
    { label: 'Prioritize building and ownership', mutation: { kind: 'setToggle', toggle: 'preferBuilding', value: true, reason: 'Path explanation.' } },
    { label: 'Give ownership upside more weight', mutation: { kind: 'setWeight', factor: 'ownershipUpside', value: 0.58, reason: 'Path explanation.' } },
  ],
  research: [
    { label: 'Verify full funding and renewal terms', mutation: { kind: 'setToggle', toggle: 'mastersFunded', value: true, reason: 'Path explanation.' } },
    { label: 'Remain open to relocation', mutation: { kind: 'setToggle', toggle: 'willingToRelocate', value: true, reason: 'Path explanation.' } },
    { label: 'Prioritize durable AI depth', mutation: { kind: 'setWeight', factor: 'aiGrowth', value: 0.55, reason: 'Path explanation.' } },
    { label: 'Use a five-year horizon', mutation: { kind: 'setHorizon', value: 5, reason: 'Path explanation.' } },
  ],
}

function mutationAlreadyTrue(model: DecisionModel, mutation: ModelMutation): boolean {
  if (mutation.kind === 'setToggle') return model.assumptions.toggles[mutation.toggle] === mutation.value
  if (mutation.kind === 'setRisk') return Math.abs(model.assumptions.riskTolerance - mutation.value) < 0.001
  if (mutation.kind === 'setWeight') return Math.abs(model.assumptions.weights[mutation.factor] - mutation.value) < 0.001
  if (mutation.kind === 'setHorizon') return model.assumptions.timeHorizon === mutation.value
  return false
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]]
  return items.flatMap((item, index) =>
    combinations(items.slice(index + 1), size - 1).map((rest) => [item, ...rest]),
  )
}

function shareFor(results: DecisionResults, optionId: OptionId): number {
  return results.options.find(({ id }) => id === optionId)?.share ?? 0
}

export function explainPath(model: DecisionModel, optionId: OptionId): PathExplanation {
  const current = computeDecision(model)
  const optionLabel = model.options.find(({ id }) => id === optionId)?.label ?? optionId
  if (current.leaderId === optionId) {
    return {
      optionId,
      optionLabel,
      leadsNow: true,
      achievesLead: true,
      changes: ['Current assumptions already make this path lead.'],
      projectedShare: shareFor(current, optionId),
    }
  }

  const candidates = CANDIDATES[optionId].filter(({ mutation }) => !mutationAlreadyTrue(model, mutation))
  let closest = { changes: candidates, results: current }

  for (let size = 1; size <= candidates.length; size += 1) {
    const evaluated = combinations(candidates, size).map((changes) => ({
      changes,
      results: computeDecision(applyMutations(model, changes.map(({ mutation }) => mutation))),
    }))
    const winners = evaluated
      .filter(({ results }) => results.leaderId === optionId)
      .sort((left, right) => shareFor(right.results, optionId) - shareFor(left.results, optionId))
    if (winners[0]) {
      return {
        optionId,
        optionLabel,
        leadsNow: false,
        achievesLead: true,
        changes: winners[0].changes.map(({ label }) => label),
        projectedShare: shareFor(winners[0].results, optionId),
      }
    }
    const best = evaluated.sort((left, right) => shareFor(right.results, optionId) - shareFor(left.results, optionId))[0]
    if (best && shareFor(best.results, optionId) > shareFor(closest.results, optionId)) closest = best
  }

  return {
    optionId,
    optionLabel,
    leadsNow: false,
    achievesLead: false,
    changes: closest.changes.map(({ label }) => label),
    projectedShare: shareFor(closest.results, optionId),
  }
}

export function explainAllPaths(model: DecisionModel): PathExplanation[] {
  return model.options.map(({ id }) => explainPath(model, id))
}
