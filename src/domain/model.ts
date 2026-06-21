import type { DecisionModel, FactorDefinition } from './types'

export const FACTORS: FactorDefinition[] = [
  {
    key: 'aiGrowth',
    label: 'Growth & learning',
    shortLabel: 'Growth',
    description: 'Personal growth, learning, and access to meaningful new experiences.',
    horizonBias: 0.26,
  },
  {
    key: 'financialFloor',
    label: 'Financial floor',
    shortLabel: 'Floor',
    description: 'Near-term income, downside protection, and liquidity.',
    horizonBias: -0.3,
  },
  {
    key: 'ownershipUpside',
    label: 'Ownership & upside',
    shortLabel: 'Upside',
    description: 'Autonomy, meaningful ownership, and upside if the path works.',
    horizonBias: 0.22,
  },
  {
    key: 'optionality',
    label: 'Future optionality',
    shortLabel: 'Optionality',
    description: 'Relationships, resources, and the quality of choices available later.',
    horizonBias: 0.2,
  },
  {
    key: 'sustainableFit',
    label: 'Sustainable fit',
    shortLabel: 'Fit',
    description: 'Lifestyle durability, regret exposure, and personal fit.',
    horizonBias: -0.04,
  },
]

export function createInitialModel(): DecisionModel {
  return {
    factors: FACTORS,
    revision: 0,
    assumptions: {
      weights: {
        aiGrowth: 0.27,
        financialFloor: 0.19,
        ownershipUpside: 0.16,
        optionality: 0.23,
        sustainableFit: 0.15,
      },
      riskTolerance: 0.55,
      timeHorizon: 4,
      toggles: {
        mastersFunded: true,
        startupTraction: false,
        incomeNow: false,
        willingToRelocate: true,
        preferBuilding: false,
      },
    },
    options: [
      {
        id: 'stable',
        label: 'Continuity path',
        shortLabel: 'Continuity',
        character: 'Stronger floor · fewer disruptions · room to build from stability',
        factors: {
          aiGrowth: { low: 52, mode: 73, high: 83, confidence: 0.76 },
          financialFloor: { low: 78, mode: 89, high: 96, confidence: 0.92 },
          ownershipUpside: { low: 22, mode: 36, high: 54, confidence: 0.78 },
          optionality: { low: 67, mode: 80, high: 87, confidence: 0.8 },
          sustainableFit: { low: 63, mode: 76, high: 87, confidence: 0.74 },
        },
      },
      {
        id: 'startup',
        label: 'Bold-change path',
        shortLabel: 'Change',
        character: 'More agency · faster change · highest modeled ceiling',
        factors: {
          aiGrowth: { low: 65, mode: 85, high: 96, confidence: 0.56 },
          financialFloor: { low: 26, mode: 51, high: 76, confidence: 0.52 },
          ownershipUpside: { low: 74, mode: 90, high: 98, confidence: 0.65 },
          optionality: { low: 46, mode: 70, high: 91, confidence: 0.52 },
          sustainableFit: { low: 29, mode: 56, high: 80, confidence: 0.44 },
        },
      },
      {
        id: 'research',
        label: 'Exploration path',
        shortLabel: 'Explore',
        character: 'Deeper learning · wider perspective · long-horizon discovery',
        factors: {
          aiGrowth: { low: 72, mode: 85, high: 95, confidence: 0.8 },
          financialFloor: { low: 38, mode: 54, high: 70, confidence: 0.72 },
          ownershipUpside: { low: 32, mode: 48, high: 65, confidence: 0.72 },
          optionality: { low: 65, mode: 78, high: 90, confidence: 0.81 },
          sustainableFit: { low: 50, mode: 64, high: 80, confidence: 0.7 },
        },
      },
    ],
  }
}
