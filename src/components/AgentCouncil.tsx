import { motion } from 'motion/react'
import { AGENTS, type AgentId } from '../scenario/builtin'
import { AgentGlyph } from './AgentGlyph'

interface AgentCouncilProps {
  activeAgent: AgentId | null
  challengedAgent: AgentId | null
}

const personas = {
  stableAdvocate: 'Stability lens',
  startupAdvocate: 'Possibility lens',
  researchAdvocate: 'Values lens',
  skeptic: 'Challenge lens',
}

export function AgentCouncil({ activeAgent, challengedAgent }: AgentCouncilProps) {
  return (
    <aside className="council" aria-label="Agent council">
      <div className="panel-heading">
        <span>Decision council</span>
        <small>Multiple perspectives, one model</small>
      </div>
      <div className="council__members">
        {AGENTS.map((agent, index) => {
          const isActive = agent.id === activeAgent
          const isChallenged = agent.id === challengedAgent
          return (
            <motion.div
              className={`agent agent--${agent.tone}${isActive ? ' is-active' : ''}${isChallenged ? ' is-challenged' : ''}`}
              key={agent.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
            >
              <AgentGlyph agentId={agent.id} active={isActive} className="agent__seal" />
              <div className="agent__identity" title={agent.role}>
                <strong>{agent.name}</strong>
                <span>{personas[agent.id]}</span>
              </div>
              <span className="agent__state"><i />{isActive ? 'Speaking' : isChallenged ? 'Challenged' : 'Listening'}</span>
            </motion.div>
          )
        })}
      </div>
    </aside>
  )
}
