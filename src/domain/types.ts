export const FACTOR_KEYS = [
  'aiGrowth',
  'financialFloor',
  'ownershipUpside',
  'optionality',
  'sustainableFit',
] as const

export type FactorKey = (typeof FACTOR_KEYS)[number]
export type OptionId = 'stable' | 'startup' | 'research'

export interface FactorDefinition {
  key: FactorKey
  label: string
  shortLabel: string
  description: string
  horizonBias: number
}

export interface ScoreRange {
  low: number
  mode: number
  high: number
  confidence: number
}

export interface DecisionOption {
  id: OptionId
  label: string
  shortLabel: string
  character: string
  factors: Record<FactorKey, ScoreRange>
}

export interface DecisionAssumptions {
  weights: Record<FactorKey, number>
  riskTolerance: number
  timeHorizon: number
  toggles: {
    mastersFunded: boolean
    startupTraction: boolean
    incomeNow: boolean
    willingToRelocate: boolean
    preferBuilding: boolean
  }
}

export interface DecisionModel {
  factors: FactorDefinition[]
  options: DecisionOption[]
  assumptions: DecisionAssumptions
  revision: number
}

export interface OptionResult {
  id: OptionId
  label: string
  share: number
  mean: number
  floor: number
  ceiling: number
}

export interface SensitivityResult {
  key: string
  label: string
  impact: number
}

export interface DecisionResults {
  leaderId: OptionId
  options: OptionResult[]
  sensitivity: SensitivityResult
  sampleCount: number
}

export type ModelMutation =
  | {
      kind: 'setRange'
      optionId: OptionId
      factor: FactorKey
      range: ScoreRange
      reason: string
    }
  | {
      kind: 'setWeight'
      factor: FactorKey
      value: number
      reason: string
    }
  | {
      kind: 'setRisk'
      value: number
      reason: string
    }
  | {
      kind: 'setHorizon'
      value: number
      reason: string
    }
  | {
      kind: 'setToggle'
      toggle: keyof DecisionAssumptions['toggles']
      value: boolean
      reason: string
    }

export interface LedgerEntry {
  id: string
  actor: 'Meridian' | 'Skeptic' | 'Analyst' | 'You'
  title: string
  detail: string
  tone: 'neutral' | 'risk' | 'analysis' | 'user'
}
