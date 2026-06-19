import type { LedgerEntry } from '../domain/types'
import type { AgentId, DemoPhase, TimelineEvent } from './builtin'

export interface DemoState {
  phase: DemoPhase
  activeAgent: AgentId | null
  challengedAgent: AgentId | null
  visibleClaimIds: string[]
  visibleConsiderationIds: string[]
  ledger: LedgerEntry[]
  focus: 'paths' | 'ledger' | 'axis' | 'controls'
  running: boolean
  paused: boolean
}

export type DemoAction =
  | { type: 'start' }
  | { type: 'reset' }
  | { type: 'pause'; value: boolean }
  | { type: 'timeline'; event: TimelineEvent }
  | { type: 'ledger'; entry: LedgerEntry; replaceKey?: string }
  | { type: 'verdict' }
  | { type: 'explore' }

export const initialDemoState: DemoState = {
  phase: 'intake',
  activeAgent: null,
  challengedAgent: null,
  visibleClaimIds: [],
  visibleConsiderationIds: [],
  ledger: [],
  focus: 'paths',
  running: false,
  paused: false,
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'start') {
    return { ...initialDemoState, running: true, activeAgent: 'meridian' }
  }
  if (action.type === 'reset') return initialDemoState
  if (action.type === 'pause') return { ...state, paused: action.value }
  if (action.type === 'verdict') return { ...state, phase: 'verdict', running: false, focus: 'axis' }
  if (action.type === 'explore') return { ...state, phase: 'explore', running: false, focus: 'controls' }
  if (action.type === 'ledger') {
    const shouldReplace = action.replaceKey && state.ledger.at(-1)?.id.startsWith(action.replaceKey)
    return {
      ...state,
      ledger: shouldReplace
        ? [...state.ledger.slice(0, -1), action.entry]
        : [...state.ledger, action.entry],
    }
  }

  const { event } = action
  switch (event.type) {
    case 'phase':
      return {
        ...state,
        phase: event.phase,
        running: event.phase === 'explore' ? false : state.running,
        activeAgent: event.activeAgent ?? state.activeAgent,
      }
    case 'agent':
      return {
        ...state,
        activeAgent: event.activeAgent,
        challengedAgent: event.challengedAgent ?? null,
      }
    case 'claim':
      return {
        ...state,
        activeAgent: event.activeAgent,
        visibleClaimIds: state.visibleClaimIds.includes(event.claimId)
          ? state.visibleClaimIds
          : [...state.visibleClaimIds, event.claimId],
      }
    case 'hidden':
      return {
        ...state,
        activeAgent: event.activeAgent,
        visibleConsiderationIds: state.visibleConsiderationIds.includes(event.considerationId)
          ? state.visibleConsiderationIds
          : [...state.visibleConsiderationIds, event.considerationId],
      }
    case 'mutation':
      return {
        ...state,
        ledger: state.ledger.some((entry) => entry.id === event.ledger.id)
          ? state.ledger
          : [...state.ledger, event.ledger],
      }
    case 'focus':
      return { ...state, focus: event.target }
  }
}
