import { AnimatePresence, motion } from 'motion/react'
import type { LedgerEntry } from '../domain/types'

interface AssumptionLedgerProps {
  entries: LedgerEntry[]
  focused: boolean
}

export function AssumptionLedger({ entries, focused }: AssumptionLedgerProps) {
  const visibleEntries = entries.slice(-3)
  return (
    <section className={`ledger${focused ? ' is-focused' : ''}`} aria-label="Assumption ledger" aria-live="polite">
      <div className="panel-heading">
        <span>Assumption ledger</span>
        <small>{entries.length} model revisions</small>
      </div>
      <div className="ledger__entries">
        <AnimatePresence initial={false} mode="popLayout">
          {entries.length === 0 ? (
            <div className="ledger__empty">Model changes will be written here with their cause.</div>
          ) : visibleEntries.map((entry, index) => (
            <motion.div
              className={`ledger-entry ledger-entry--${entry.tone}`}
              key={entry.actor === 'You' ? entry.id.replace(/-\d+$/, '') : entry.id}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="ledger-entry__number">{String(entries.length - visibleEntries.length + index + 1).padStart(2, '0')}</span>
              <div>
                <small>{entry.actor}</small>
                <strong>{entry.title}</strong>
                <p>{entry.detail}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
