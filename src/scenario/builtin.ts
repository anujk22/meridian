import { applyMutations } from '../domain/mutations'
import { createInitialModel } from '../domain/model'
import type { LedgerEntry, ModelMutation, OptionId } from '../domain/types'

export type DemoPhase =
  | 'intake'
  | 'decomposition'
  | 'council'
  | 'arguments'
  | 'skeptic'
  | 'analysis'
  | 'recompute'
  | 'explore'
  | 'verdict'

export type AgentId = 'stableAdvocate' | 'startupAdvocate' | 'researchAdvocate' | 'skeptic'

export interface Agent {
  id: AgentId
  name: string
  role: string
  symbol: string
  tone: 'brass' | 'stable' | 'startup' | 'research' | 'risk' | 'analysis'
}

export interface ClaimArtifact {
  id: string
  optionId: OptionId
  agentId: AgentId
  title: string
  body: string
  kind: 'claim' | 'concession'
  retrievalQuery: string | null
}

export interface HiddenConsideration {
  id: string
  title: string
  body: string
  retrievalQuery: string | null
}

export type TimelineEvent =
  | { at: number; type: 'phase'; phase: DemoPhase; activeAgent?: AgentId }
  | { at: number; type: 'agent'; activeAgent: AgentId; challengedAgent?: AgentId }
  | { at: number; type: 'claim'; claimId: string; activeAgent: AgentId }
  | { at: number; type: 'hidden'; considerationId: string; activeAgent: AgentId }
  | { at: number; type: 'mutation'; mutation: ModelMutation; ledger: LedgerEntry }
  | { at: number; type: 'focus'; target: 'paths' | 'ledger' | 'axis' | 'controls' }

export const BUILTIN_PROMPT =
  'Should I move to a new city for a promising job, stay near the people and routines I value, or take a gap year to travel? I care about growth, financial stability, my relationships, and what each choice makes possible later.'

export const CONTEXT_CHIPS = [
  'A major life transition',
  'Important local relationships',
  'A promising work opportunity',
  'Travel is still feasible',
  'Three-year horizon',
]

export const GOAL_CHIPS = [
  'Keep growing',
  'Protect financial stability',
  'Honor relationships and wellbeing',
  'Preserve future choices',
]

export const AGENTS: Agent[] = [
  { id: 'stableAdvocate', name: 'Harbor', role: 'Stability & continuity', symbol: 'H', tone: 'stable' },
  { id: 'startupAdvocate', name: 'Aster', role: 'Change & possibility', symbol: 'A', tone: 'startup' },
  { id: 'researchAdvocate', name: 'Lumen', role: 'Values & long-term fit', symbol: 'L', tone: 'research' },
  { id: 'skeptic', name: 'Vesper', role: 'Assumption challenger', symbol: 'V', tone: 'risk' },
]

export const CLAIMS: ClaimArtifact[] = [
  {
    id: 'stable-floor',
    optionId: 'stable',
    agentId: 'stableAdvocate',
    title: 'Stability has real value',
    body: 'Staying close to trusted people and familiar routines preserves support, lowers disruption, and leaves room for a more deliberate next step.',
    kind: 'claim',
    retrievalQuery: null,
  },
  {
    id: 'stable-concession',
    optionId: 'stable',
    agentId: 'stableAdvocate',
    title: 'Comfort can become inertia',
    body: 'Continuity only serves the user if staying is an active choice, not fear dressed up as prudence.',
    kind: 'concession',
    retrievalQuery: null,
  },
  {
    id: 'startup-ownership',
    optionId: 'startup',
    agentId: 'startupAdvocate',
    title: 'Change can expand the possible',
    body: 'Moving could combine meaningful work, independence, and a new community in one decisive step.',
    kind: 'claim',
    retrievalQuery: 'software employment stability salary outlook relocation opportunity',
  },
  {
    id: 'startup-concession',
    optionId: 'startup',
    agentId: 'startupAdvocate',
    title: 'The opportunity is not the whole life',
    body: 'A promising job cannot answer whether the city, distance from loved ones, and daily reality will fit.',
    kind: 'concession',
    retrievalQuery: null,
  },
  {
    id: 'research-depth',
    optionId: 'research',
    agentId: 'researchAdvocate',
    title: 'Exploration may be the point',
    body: 'A bounded gap year could create perspective, confidence, and experiences that neither staying nor immediately optimizing for work can provide.',
    kind: 'claim',
    retrievalQuery: null,
  },
  {
    id: 'research-concession',
    optionId: 'research',
    agentId: 'researchAdvocate',
    title: 'Freedom still needs a floor',
    body: 'Without a realistic budget, end date, and re-entry plan, exploration can trade restorative freedom for prolonged uncertainty.',
    kind: 'concession',
    retrievalQuery: null,
  },
]

export const HIDDEN_CONSIDERATIONS: HiddenConsideration[] = [
  {
    id: 'equity-not-cash',
    title: 'A compelling story is not lived experience',
    body: 'The imagined version of a new city, staying home, or traveling may be carrying more weight than the likely day-to-day reality.',
    retrievalQuery: null,
  },
  {
    id: 'identity-vs-goal',
    title: 'Other people’s timelines may be intruding',
    body: 'The most socially legible choice is not automatically the one that best serves the user’s values and season of life.',
    retrievalQuery: null,
  },
  {
    id: 'funding-pivot',
    title: 'Reversibility changes the stakes',
    body: 'A trial move, defined travel period, or delayed start can turn an identity-sized choice into a testable next step.',
    retrievalQuery: null,
  },
]

export const SKEPTIC_MUTATIONS: ModelMutation[] = [
  {
    kind: 'setRange',
    optionId: 'startup',
    factor: 'financialFloor',
    range: { low: 8, mode: 27, high: 53, confidence: 0.36 },
    reason: 'The bold-change path has meaningful hidden costs until the job, city, and support system are tested.',
  },
  {
    kind: 'setRange',
    optionId: 'startup',
    factor: 'ownershipUpside',
    range: { low: 50, mode: 75, high: 92, confidence: 0.41 },
    reason: 'The upside remains high, but its range widens when the imagined benefits of change are unverified.',
  },
]

export const ANALYST_MUTATIONS: ModelMutation[] = [
  {
    kind: 'setRange',
    optionId: 'research',
    factor: 'aiGrowth',
    range: { low: 77, mode: 89, high: 97, confidence: 0.84 },
    reason: 'The user named growth and perspective as important alongside work and financial stability.',
  },
  {
    kind: 'setRange',
    optionId: 'research',
    factor: 'optionality',
    range: { low: 69, mode: 82, high: 92, confidence: 0.85 },
    reason: 'A bounded, affordable exploration period can preserve several future paths rather than closing them.',
  },
]

export function createDebatedModel() {
  return applyMutations(createInitialModel(), [...SKEPTIC_MUTATIONS, ...ANALYST_MUTATIONS])
}

export const TIMELINE: TimelineEvent[] = [
  { at: 0, type: 'phase', phase: 'decomposition', activeAgent: 'stableAdvocate' },
  { at: 650, type: 'focus', target: 'paths' },
  { at: 2300, type: 'phase', phase: 'council', activeAgent: 'stableAdvocate' },
  { at: 3900, type: 'phase', phase: 'arguments', activeAgent: 'stableAdvocate' },
  { at: 4200, type: 'claim', claimId: 'stable-floor', activeAgent: 'stableAdvocate' },
  { at: 5250, type: 'claim', claimId: 'stable-concession', activeAgent: 'stableAdvocate' },
  { at: 6200, type: 'agent', activeAgent: 'startupAdvocate' },
  { at: 6500, type: 'claim', claimId: 'startup-ownership', activeAgent: 'startupAdvocate' },
  { at: 7550, type: 'claim', claimId: 'startup-concession', activeAgent: 'startupAdvocate' },
  { at: 8500, type: 'agent', activeAgent: 'researchAdvocate' },
  { at: 8800, type: 'claim', claimId: 'research-depth', activeAgent: 'researchAdvocate' },
  { at: 9850, type: 'claim', claimId: 'research-concession', activeAgent: 'researchAdvocate' },
  { at: 11000, type: 'phase', phase: 'skeptic', activeAgent: 'skeptic' },
  { at: 11350, type: 'hidden', considerationId: 'equity-not-cash', activeAgent: 'skeptic' },
  {
    at: 12400,
    type: 'mutation',
    mutation: SKEPTIC_MUTATIONS[0],
    ledger: {
      id: 'ledger-startup-floor',
      actor: 'Vesper',
      title: 'Change-path floor reduced',
      detail: 'Relocation and social disruption are unresolved, so the security range is lower.',
      tone: 'risk',
    },
  },
  {
    at: 13350,
    type: 'mutation',
    mutation: SKEPTIC_MUTATIONS[1],
    ledger: {
      id: 'ledger-startup-upside',
      actor: 'Vesper',
      title: 'Change-path upside widened',
      detail: 'The opportunity is promising, but its broader life impact is still uncertain.',
      tone: 'risk',
    },
  },
  { at: 14100, type: 'hidden', considerationId: 'identity-vs-goal', activeAgent: 'skeptic' },
  { at: 15100, type: 'phase', phase: 'analysis', activeAgent: 'researchAdvocate' },
  { at: 15400, type: 'focus', target: 'ledger' },
  {
    at: 16200,
    type: 'mutation',
    mutation: ANALYST_MUTATIONS[0],
    ledger: {
      id: 'ledger-ai-depth',
      actor: 'Lumen',
      title: 'Growth potential raised',
      detail: 'Exploration aligns directly with the user’s desire for growth and perspective.',
      tone: 'analysis',
    },
  },
  {
    at: 17150,
    type: 'mutation',
    mutation: ANALYST_MUTATIONS[1],
    ledger: {
      id: 'ledger-optionality',
      actor: 'Lumen',
      title: 'Exploration optionality raised',
      detail: 'A bounded gap year can preserve work, place, and relationship choices.',
      tone: 'analysis',
    },
  },
  { at: 18100, type: 'phase', phase: 'recompute', activeAgent: 'researchAdvocate' },
  { at: 18300, type: 'focus', target: 'axis' },
  { at: 20500, type: 'phase', phase: 'explore', activeAgent: 'stableAdvocate' },
  { at: 20700, type: 'focus', target: 'controls' },
]
