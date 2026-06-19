import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { BrandMark } from './BrandMark'

const updates = [
  'Reading the decision and separating goals from constraints',
  'Asking each perspective to make its strongest case',
  'Looking for hidden tradeoffs and weak assumptions',
  'Turning the discussion into a decision model',
]

export function LiveReasoning({ prompt, model }: { prompt: string; model: string }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => setStep((current) => Math.min(current + 1, updates.length - 1)), 8_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <main className="thinking-shell">
      <header className="thinking-header">
        <BrandMark />
        <span>Local analysis</span>
      </header>
      <section className="thinking-stage" aria-live="polite">
        <motion.div
          className="thinking-orb"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <i /><i /><i />
        </motion.div>
        <p className="thinking-label">The council is thinking<span className="thinking-dots"><i>.</i><i>.</i><i>.</i></span></p>
        <h1>{updates[step]}</h1>
        <p className="thinking-note">This can take a moment with a larger local model. You’ll move into the deliberation automatically when its response is ready.</p>
        <blockquote>{prompt}</blockquote>
        <span className="thinking-model">Running privately with {model}</span>
      </section>
    </main>
  )
}
