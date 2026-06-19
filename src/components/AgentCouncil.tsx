import { motion } from 'motion/react'
import { AGENTS, type AgentId } from '../scenario/builtin'

interface AgentCouncilProps {
  activeAgent: AgentId | null
  challengedAgent: AgentId | null
}

export function AgentCouncil({ activeAgent, challengedAgent }: AgentCouncilProps) {
  return (
    <aside className="council" aria-label="Agent council">
      <div className="panel-heading">
        <span>Council</span>
        <small>6 perspectives</small>
      </div>
      <div className="council__rail" aria-hidden="true" />
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
              <div className="agent__seal" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="19" />
                  <path d="M24 6v6M24 36v6M6 24h6M36 24h6" />
                  <circle cx="24" cy="24" r="9" />
                </svg>
                <span>{agent.symbol}</span>
              </div>
              <div className="agent__identity">
                <strong>{agent.name}</strong>
                <span>{agent.role}</span>
              </div>
              <span className="agent__state">{isActive ? 'Speaking' : isChallenged ? 'Challenged' : 'Listening'}</span>
            </motion.div>
          )
        })}
      </div>
    </aside>
  )
}
