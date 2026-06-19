import type { DecisionModel, ModelMutation, ScoreRange } from './types'

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function sanitizeRange(range: ScoreRange): ScoreRange {
  const low = clamp(range.low, 0, 100)
  const high = clamp(range.high, low, 100)
  return {
    low,
    mode: clamp(range.mode, low, high),
    high,
    confidence: clamp(range.confidence, 0.05, 1),
  }
}

export function applyMutation(model: DecisionModel, mutation: ModelMutation): DecisionModel {
  switch (mutation.kind) {
    case 'setRange':
      return {
        ...model,
        revision: model.revision + 1,
        options: model.options.map((option) =>
          option.id === mutation.optionId
            ? {
                ...option,
                factors: {
                  ...option.factors,
                  [mutation.factor]: sanitizeRange(mutation.range),
                },
              }
            : option,
        ),
      }
    case 'setWeight':
      return {
        ...model,
        revision: model.revision + 1,
        assumptions: {
          ...model.assumptions,
          weights: {
            ...model.assumptions.weights,
            [mutation.factor]: clamp(mutation.value, 0.01, 1),
          },
        },
      }
    case 'setRisk':
      return {
        ...model,
        revision: model.revision + 1,
        assumptions: {
          ...model.assumptions,
          riskTolerance: clamp(mutation.value, 0, 1),
        },
      }
    case 'setHorizon':
      return {
        ...model,
        revision: model.revision + 1,
        assumptions: {
          ...model.assumptions,
          timeHorizon: clamp(mutation.value, 1, 5),
        },
      }
    case 'setToggle':
      return {
        ...model,
        revision: model.revision + 1,
        assumptions: {
          ...model.assumptions,
          toggles: {
            ...model.assumptions.toggles,
            [mutation.toggle]: mutation.value,
          },
        },
      }
  }
}

export function applyMutations(
  model: DecisionModel,
  mutations: ModelMutation[],
): DecisionModel {
  return mutations.reduce(applyMutation, model)
}
