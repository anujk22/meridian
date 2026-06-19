import { AnimatePresence, motion } from 'motion/react'
import type { LedgerEntry } from '../domain/types'

interface AssumptionLedgerProps {
  entries: LedgerEntry[]
  focused: boolean
}

export function AssumptionLedger({ entries, focused }: AssumptionLedgerProps) {
  return (
    <section className={`ledger${focused ? ' is-focused' : ''}`} aria-label="Assumption ledger" aria-live="polite">
      <div className="panel-heading">
        <span>Assumption ledger</span>
        <small>{entries.length} model revisions</small>
      </div>
      <div className="ledger__entries">
        <AnimatePresence initial={false}>
          {entries.length === 0 ? (
            <div className="ledger__empty">Model changes will be written here with their cause.</div>
          ) : entries.map((entry, index) => (
            <motion.div
              className={`ledger-entry ledger-entry--${entry.tone}`}
              key={entry.id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="ledger-entry__number">{String(index + 1).padStart(2, '0')}</span>
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
