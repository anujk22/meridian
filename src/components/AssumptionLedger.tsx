import { AnimatePresence, motion } from 'motion/react'
import type { LedgerEntry } from '../domain/types'

interface AssumptionLedgerProps {
  entries: LedgerEntry[]
  focused: boolean
  leaderLabel?: string
}

export function AssumptionLedger({ entries, focused, leaderLabel = 'current leader' }: AssumptionLedgerProps) {
  const visibleEntries = entries.slice(-4)
  return (
    <section className={`ledger${focused ? ' is-focused' : ''}`} aria-label="Assumption ledger" aria-live="polite">
      <div className="panel-heading">
        <div><span className="live-signal" /> Assumption audit trail</div>
        <small>{entries.length} mutations · {leaderLabel} leads</small>
      </div>
      <div className="ledger__entries">
        <div className="ledger-entry ledger-entry--baseline">
          <span className="ledger-entry__number">00</span>
          <div>
            <small>Initial model</small>
            <strong>Funded study · unverified startup traction · five-year horizon</strong>
            <p>Baseline ranges entered the seeded simulation.</p>
          </div>
          <b>baseline</b>
        </div>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleEntries.map((entry, index) => (
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
              <b>{entry.actor === 'You' ? 'what-if' : entry.tone === 'risk' ? 'challenge' : 'recomputed'}</b>
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && <div className="ledger__empty">Challenges and result-impact mutations will append here.</div>}
      </div>
    </section>
  )
}
