import type { AgentId } from '../scenario/builtin'

interface AgentGlyphProps {
  agentId: AgentId
  active?: boolean
  className?: string
}

const portraits: Record<AgentId, string> = {
  stableAdvocate: '/agents/harbor-character.png',
  startupAdvocate: '/agents/aster-character.png',
  researchAdvocate: '/agents/lumen-character.png',
  skeptic: '/agents/vesper-character.png',
}

export function AgentGlyph({ agentId, active = false, className = '' }: AgentGlyphProps) {
  return (
    <span className={`agent-glyph agent-glyph--${agentId}${active ? ' is-active' : ''} ${className}`} aria-hidden="true">
      <img src={portraits[agentId]} alt="" />
      <i />
    </span>
  )
}
