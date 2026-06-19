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

export type AgentId = 'meridian' | 'stableAdvocate' | 'startupAdvocate' | 'researchAdvocate' | 'skeptic' | 'analyst'

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
  "I'm graduating in computer science and choosing between a stable SWE job, joining a friend's early AI startup, or a funded AI master's. I want deep AI skills, financial independence, and choices I won't regret in five years."

export const CONTEXT_CHIPS = [
  'Graduating CS student',
  'Limited savings',
  'No dependents',
  'Open to relocation',
  'Five-year horizon',
]

export const GOAL_CHIPS = [
  'Become a serious AI engineer',
  'Reach financial independence',
  'Preserve future options',
]

export const AGENTS: Agent[] = [
  { id: 'meridian', name: 'Meridian', role: 'Navigator', symbol: 'M', tone: 'brass' },
  { id: 'stableAdvocate', name: 'Harbor', role: 'Stable path', symbol: 'H', tone: 'stable' },
  { id: 'startupAdvocate', name: 'Aster', role: 'Venture path', symbol: 'A', tone: 'startup' },
  { id: 'researchAdvocate', name: 'Lumen', role: 'Research path', symbol: 'L', tone: 'research' },
  { id: 'skeptic', name: 'Vesper', role: 'Red team', symbol: 'V', tone: 'risk' },
  { id: 'analyst', name: 'Kepler', role: 'Quant analyst', symbol: 'K', tone: 'analysis' },
]

export const CLAIMS: ClaimArtifact[] = [
  {
    id: 'stable-floor',
    optionId: 'stable',
    agentId: 'stableAdvocate',
    title: 'The floor compounds',
    body: 'Income, mentorship, and a credible fallback create room to take a sharper risk later.',
    kind: 'claim',
    retrievalQuery: 'software engineering career stability salary outlook mentorship',
  },
  {
    id: 'stable-concession',
    optionId: 'stable',
    agentId: 'stableAdvocate',
    title: 'Comfort can become inertia',
    body: 'A general SWE role only serves the AI goal if the work and mobility are real.',
    kind: 'concession',
    retrievalQuery: null,
  },
  {
    id: 'startup-ownership',
    optionId: 'startup',
    agentId: 'startupAdvocate',
    title: 'Maximum learning velocity',
    body: 'Small-team ownership compresses feedback loops and puts consequential work in reach immediately.',
    kind: 'claim',
    retrievalQuery: 'startup survival uncertainty early stage company risk',
  },
  {
    id: 'startup-concession',
    optionId: 'startup',
    agentId: 'startupAdvocate',
    title: 'The role can outrun the runway',
    body: 'Ownership is valuable only if runway, mentorship, and role clarity survive contact with reality.',
    kind: 'concession',
    retrievalQuery: null,
  },
  {
    id: 'research-depth',
    optionId: 'research',
    agentId: 'researchAdvocate',
    title: 'Depth is the stated priority',
    body: 'Protected research time and strong lab access directly serve the five-year AI-engineer goal.',
    kind: 'claim',
    retrievalQuery: 'funded research masters AI graduate support lab access stipend',
  },
  {
    id: 'research-concession',
    optionId: 'research',
    agentId: 'researchAdvocate',
    title: 'Funding changes the decision',
    body: 'Without real funding and advisor access, delayed earnings can overwhelm the specialization benefit.',
    kind: 'concession',
    retrievalQuery: 'graduate school funding loans work study opportunity cost',
  },
]

export const HIDDEN_CONSIDERATIONS: HiddenConsideration[] = [
  {
    id: 'equity-not-cash',
    title: 'Equity is not a financial floor',
    body: '“I’m not scoring startup equity as guaranteed upside.” The evidence supports a wide, low-confidence range instead.',
    retrievalQuery: 'private startup equity liquidity risk options not cash',
  },
  {
    id: 'identity-vs-goal',
    title: 'Identity may be masquerading as utility',
    body: 'The most exciting story is not automatically the path that best serves the stated five-year goal.',
    retrievalQuery: null,
  },
  {
    id: 'funding-pivot',
    title: 'Funded versus unfunded changes everything',
    body: 'Funding is not a footnote. It changes the research path’s floor, opportunity cost, and regret profile.',
    retrievalQuery: 'research masters funded stipend tuition fellowship changes cost',
  },
]

export const SKEPTIC_MUTATIONS: ModelMutation[] = [
  {
    kind: 'setRange',
    optionId: 'startup',
    factor: 'financialFloor',
    range: { low: 8, mode: 27, high: 53, confidence: 0.36 },
    reason: 'Private-company equity cannot be treated as liquid or guaranteed compensation.',
  },
  {
    kind: 'setRange',
    optionId: 'startup',
    factor: 'ownershipUpside',
    range: { low: 50, mode: 75, high: 92, confidence: 0.41 },
    reason: 'The upside remains high, but its range widens when traction and liquidity are unverified.',
  },
]

export const ANALYST_MUTATIONS: ModelMutation[] = [
  {
    kind: 'setRange',
    optionId: 'research',
    factor: 'aiGrowth',
    range: { low: 77, mode: 89, high: 97, confidence: 0.84 },
    reason: 'The user named durable AI depth as the strongest five-year priority.',
  },
  {
    kind: 'setRange',
    optionId: 'research',
    factor: 'optionality',
    range: { low: 69, mode: 82, high: 92, confidence: 0.85 },
    reason: 'Funded lab access preserves research and industry pathways.',
  },
]

export function createDebatedModel() {
  return applyMutations(createInitialModel(), [...SKEPTIC_MUTATIONS, ...ANALYST_MUTATIONS])
}

export const TIMELINE: TimelineEvent[] = [
  { at: 0, type: 'phase', phase: 'decomposition', activeAgent: 'meridian' },
  { at: 650, type: 'focus', target: 'paths' },
  { at: 2300, type: 'phase', phase: 'council', activeAgent: 'meridian' },
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
      actor: 'Skeptic',
      title: 'Startup floor reduced',
      detail: 'Equity is illiquid; security range lowered and confidence reduced.',
      tone: 'risk',
    },
  },
  {
    at: 13350,
    type: 'mutation',
    mutation: SKEPTIC_MUTATIONS[1],
    ledger: {
      id: 'ledger-startup-upside',
      actor: 'Skeptic',
      title: 'Startup upside widened',
      detail: 'No verified traction, so upside remains possible but less certain.',
      tone: 'risk',
    },
  },
  { at: 14100, type: 'hidden', considerationId: 'identity-vs-goal', activeAgent: 'skeptic' },
  { at: 15100, type: 'phase', phase: 'analysis', activeAgent: 'analyst' },
  { at: 15400, type: 'focus', target: 'ledger' },
  {
    at: 16200,
    type: 'mutation',
    mutation: ANALYST_MUTATIONS[0],
    ledger: {
      id: 'ledger-ai-depth',
      actor: 'Analyst',
      title: 'AI depth raised',
      detail: 'Research aligns most directly with the user’s highest stated priority.',
      tone: 'analysis',
    },
  },
  {
    at: 17150,
    type: 'mutation',
    mutation: ANALYST_MUTATIONS[1],
    ledger: {
      id: 'ledger-optionality',
      actor: 'Analyst',
      title: 'Research optionality raised',
      detail: 'Funding and lab access preserve research and industry branches.',
      tone: 'analysis',
    },
  },
  { at: 18100, type: 'phase', phase: 'recompute', activeAgent: 'analyst' },
  { at: 18300, type: 'focus', target: 'axis' },
  { at: 20500, type: 'phase', phase: 'explore', activeAgent: 'meridian' },
  { at: 20700, type: 'focus', target: 'controls' },
]
