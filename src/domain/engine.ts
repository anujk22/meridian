import { FACTOR_KEYS, type DecisionModel, type DecisionResults, type FactorKey, type OptionId, type ScoreRange } from './types'

const DEFAULT_SAMPLE_COUNT = 4800
const SENSITIVITY_SAMPLE_COUNT = 1000

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value))

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function triangular(range: ScoreRange, uniform: number): number {
  const span = range.high - range.low
  if (span <= 0) return range.mode
  const modePosition = (range.mode - range.low) / span
  if (uniform < modePosition) {
    return range.low + Math.sqrt(uniform * span * (range.mode - range.low))
  }
  return range.high - Math.sqrt((1 - uniform) * span * (range.high - range.mode))
}

function shiftedRange(range: ScoreRange, delta: number, confidenceDelta = 0): ScoreRange {
  return {
    low: clamp(range.low + delta),
    mode: clamp(range.mode + delta),
    high: clamp(range.high + delta),
    confidence: clamp(range.confidence + confidenceDelta, 0.05, 1),
  }
}

function effectiveRange(
  model: DecisionModel,
  optionId: OptionId,
  factor: FactorKey,
): ScoreRange {
  const option = model.options.find((candidate) => candidate.id === optionId)
  if (!option) throw new Error(`Unknown option: ${optionId}`)
  let range = option.factors[factor]
  const { toggles } = model.assumptions

  if (optionId === 'research' && !toggles.mastersFunded) {
    const delta = factor === 'financialFloor' ? -20 : factor === 'optionality' ? -7 : factor === 'sustainableFit' ? -4 : 0
    range = shiftedRange(range, delta, delta === 0 ? 0 : -0.12)
  }

  if (optionId === 'startup' && toggles.startupTraction) {
    const delta = factor === 'financialFloor' ? 18 : factor === 'ownershipUpside' ? 7 : factor === 'optionality' ? 9 : 0
    range = shiftedRange(range, delta, delta === 0 ? 0 : 0.14)
  }

  if (optionId === 'research' && !toggles.willingToRelocate) {
    const delta = factor === 'aiGrowth' || factor === 'optionality' ? -8 : 0
    range = shiftedRange(range, delta, delta === 0 ? 0 : -0.06)
  }

  return range
}

function effectiveWeights(model: DecisionModel): Record<FactorKey, number> {
  const { weights, timeHorizon, toggles } = model.assumptions
  const horizonPosition = (timeHorizon - 3) / 2
  const adjusted = {} as Record<FactorKey, number>

  let total = 0
  for (const factor of model.factors) {
    let value = weights[factor.key] * (1 + factor.horizonBias * horizonPosition)
    if (toggles.incomeNow && factor.key === 'financialFloor') value *= 1.75
    if (toggles.preferBuilding && factor.key === 'ownershipUpside') value *= 1.55
    adjusted[factor.key] = Math.max(0.001, value)
    total += adjusted[factor.key]
  }

  for (const key of FACTOR_KEYS) adjusted[key] /= total
  return adjusted
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))
  return sorted[index]
}

function roundShares(raw: number[]): number[] {
  const floors = raw.map(Math.floor)
  let remaining = 100 - floors.reduce((sum, value) => sum + value, 0)
  const order = raw
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction)

  for (const item of order) {
    if (remaining <= 0) break
    floors[item.index] += 1
    remaining -= 1
  }
  return floors
}

function computeCore(model: DecisionModel, sampleCount: number) {
  const weights = effectiveWeights(model)
  const random = mulberry32(0x4d455249)
  const totals = model.options.map(() => [] as number[])
  const wins = model.options.map(() => 0)
  const riskAversion = 1 - model.assumptions.riskTolerance

  for (let sample = 0; sample < sampleCount; sample += 1) {
    let winningIndex = 0
    let winningScore = Number.NEGATIVE_INFINITY

    model.options.forEach((option, optionIndex) => {
      let total = 0
      let weightedWidth = 0
      let weightedUncertainty = 0
      for (const factor of FACTOR_KEYS) {
        const range = effectiveRange(model, option.id, factor)
        const sampled = triangular(range, random())
        const downside = (range.mode - range.low) * (1 - range.confidence) * riskAversion * 0.38
        total += (sampled - downside) * weights[factor]
        weightedWidth += (range.high - range.low) * weights[factor]
        weightedUncertainty += (1 - range.confidence) * weights[factor]
      }
      const scenarioShock = (random() - 0.5) * 2 * weightedWidth * (0.34 + weightedUncertainty * 0.72)
      total += scenarioShock
      totals[optionIndex].push(total)
      if (total > winningScore) {
        winningScore = total
        winningIndex = optionIndex
      }
    })
    wins[winningIndex] += 1
  }

  const rawShares = wins.map((winsForOption) => (winsForOption / sampleCount) * 100)
  return { totals, rawShares, roundedShares: roundShares(rawShares) }
}

function findSensitivity(model: DecisionModel, leaderId: OptionId, baseShare: number) {
  const candidates: Array<{ key: string; label: string; model: DecisionModel }> = []

  for (const factor of model.factors) {
    const weights = { ...model.assumptions.weights }
    weights[factor.key] = Math.min(1, weights[factor.key] + 0.14)
    candidates.push({
      key: factor.key,
      label: factor.label,
      model: { ...model, assumptions: { ...model.assumptions, weights } },
    })
  }

  const shiftedRisk = model.assumptions.riskTolerance >= 0.5
    ? model.assumptions.riskTolerance - 0.22
    : model.assumptions.riskTolerance + 0.22
  candidates.push({
    key: 'riskTolerance',
    label: 'Risk tolerance',
    model: {
      ...model,
      assumptions: { ...model.assumptions, riskTolerance: clamp(shiftedRisk, 0, 1) },
    },
  })

  let strongest = { key: 'riskTolerance', label: 'Risk tolerance', impact: 0 }
  for (const candidate of candidates) {
    const result = computeCore(candidate.model, SENSITIVITY_SAMPLE_COUNT)
    const leaderIndex = candidate.model.options.findIndex((option) => option.id === leaderId)
    const impact = Math.abs(result.rawShares[leaderIndex] - baseShare)
    if (impact > strongest.impact) strongest = { key: candidate.key, label: candidate.label, impact }
  }
  return strongest
}

export function computeDecision(
  model: DecisionModel,
  sampleCount = DEFAULT_SAMPLE_COUNT,
): DecisionResults {
  const core = computeCore(model, sampleCount)
  const options = model.options.map((option, index) => {
    const sorted = [...core.totals[index]].sort((a, b) => a - b)
    const sum = sorted.reduce((total, value) => total + value, 0)
    return {
      id: option.id,
      label: option.label,
      share: core.roundedShares[index],
      mean: sum / sorted.length,
      floor: percentile(sorted, 0.1),
      ceiling: percentile(sorted, 0.9),
    }
  })
  const leader = [...options].sort((a, b) => b.share - a.share || b.mean - a.mean)[0]
  const baseLeaderIndex = model.options.findIndex((option) => option.id === leader.id)

  return {
    leaderId: leader.id,
    options,
    sensitivity: findSensitivity(model, leader.id, core.rawShares[baseLeaderIndex]),
    sampleCount,
  }
}
