import type { DecisionModel, FactorKey, ModelMutation, OptionId, ScoreRange } from './types'

export type RangeMutation = Extract<ModelMutation, { kind: 'setRange' }>
export type MutationDecisionStatus = 'pending' | 'applied' | 'ignored'

export interface MutationTraceItem {
  id: string
  mutation: RangeMutation
  previousRange: ScoreRange
  evidenceIds: string[]
  origin: string
  status: MutationDecisionStatus
}

export const FACTOR_LABELS: Record<FactorKey, string> = {
  aiGrowth: 'AI depth & growth',
  financialFloor: 'Financial floor',
  ownershipUpside: 'Ownership & upside',
  optionality: 'Career optionality',
  sustainableFit: 'Sustainable fit',
}

export const OPTION_LABELS: Record<OptionId, string> = {
  stable: 'Stable SWE',
  startup: 'AI Startup',
  research: 'Funded Research',
}

export const CURATED_MUTATION_EVIDENCE = [
  ['carta-equity-liquidity'],
  ['sba-startup-survival', 'carta-equity-liquidity'],
  ['nsf-graduate-support', 'bls-ai-demand'],
  ['nsf-research-network', 'nsf-graduate-support'],
] as const

export function isRangeMutation(mutation: ModelMutation): mutation is RangeMutation {
  return mutation.kind === 'setRange'
}

export function rangeBefore(model: DecisionModel, mutation: RangeMutation): ScoreRange {
  const option = model.options.find(({ id }) => id === mutation.optionId)
  if (!option) throw new Error(`Unknown option: ${mutation.optionId}`)
  return { ...option.factors[mutation.factor] }
}

export function formatRange(range: ScoreRange): string {
  return `${Math.round(range.low)} / ${Math.round(range.mode)} / ${Math.round(range.high)}`
}
