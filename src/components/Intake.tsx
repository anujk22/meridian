import { useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AgentGlyph } from './AgentGlyph'
import { AtlasGlobe } from './AtlasGlobe'
import { BrandMark } from './BrandMark'
import { ThemeToggle } from './ThemeToggle'

interface IntakeProps {
  prompt: string
  onPromptChange: (value: string) => void
  onStart: () => void
  recording: boolean
  mode: 'curated' | 'live'
  onModeChange: (mode: 'curated' | 'live') => void
  models: string[]
  selectedModel: string
  onModelChange: (model: string) => void
  loadingModels: boolean
  generating: boolean
  error: string | null
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

const councilMembers = [
  { id: 'stableAdvocate' as const, name: 'Harbor', orbitRole: 'Protects the floor', railRole: 'Risk & safety' },
  { id: 'startupAdvocate' as const, name: 'Aster', orbitRole: 'Tests the upside', railRole: 'Upside & momentum' },
  { id: 'researchAdvocate' as const, name: 'Lumen', orbitRole: 'Checks evidence', railRole: 'Evidence & depth' },
  { id: 'skeptic' as const, name: 'Vesper', orbitRole: 'Challenges assumptions', railRole: 'Stress test' },
]

export function Intake({ prompt, onPromptChange, onStart, recording, mode, onModeChange, models, selectedModel, onModelChange, loadingModels, generating, error, theme, onThemeToggle }: IntakeProps) {
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const reduceMotion = useReducedMotion()
  const startDisabled = !prompt.trim() || generating || (mode === 'live' && !selectedModel)

  const focusComposer = () => {
    promptRef.current?.focus()
    promptRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
  }

  return (
    <main className="intake-shell">
      <header className="intake-header">
        <BrandMark />
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </header>

      <section className="intake-content">
        <motion.div
          className="intake-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="intake-kicker">Four-agent decision council</p>
          <h1>See the full shape<br />of your decision.</h1>
          <p className="intake-lede">
            Meridian convenes four distinct perspectives around one choice, surfacing tradeoffs, challenging assumptions, attaching evidence, and revealing what could change the recommendation.
          </p>
          <div className="intake-paths" aria-label="Paths compared">
            <span>Stable SWE</span><i /> <span>Early AI startup</span><i /> <span>Funded research</span>
          </div>
          <div className="intake-actions">
            <motion.button
              className="primary-button intake-hero-cta"
              type="button"
              onClick={onStart}
              disabled={startDisabled}
              whileTap={{ scale: 0.985 }}
            >
              {generating ? 'Assembling council…' : 'Convene my council'}
              <span aria-hidden="true">→</span>
            </motion.button>
            <button className="ghost-button intake-own-decision" type="button" onClick={focusComposer}>
              Enter my own decision
              <span aria-hidden="true">↘</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          className="intake-preview council-orbit"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.72, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Four-agent council orbiting the Meridian Decision Atlas"
        >
          <div className="council-orbit__stage">
            <svg className="council-orbit__map" viewBox="0 0 640 640" aria-hidden="true">
              <circle cx="320" cy="320" r="214" />
              <circle cx="320" cy="320" r="158" />
              <circle className="is-dashed" cx="320" cy="320" r="108" />
              <path d="M106 320H534M320 106V534" />
              <path className="is-faint" d="M169 169 471 471M471 169 169 471" />
              <g className="council-orbit__ticks">
                <circle cx="320" cy="106" r="3" /><circle cx="534" cy="320" r="3" />
                <circle cx="320" cy="534" r="3" /><circle cx="106" cy="320" r="3" />
                <circle cx="169" cy="169" r="2.5" /><circle cx="471" cy="169" r="2.5" />
                <circle cx="471" cy="471" r="2.5" /><circle cx="169" cy="471" r="2.5" />
              </g>
            </svg>
            <AtlasGlobe compact active />
            {councilMembers.map((agent, index) => (
              <div className={`orbit-agent orbit-agent--${agent.id}`} key={agent.id}>
                <motion.div
                  className="orbit-agent__motion"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.54, delay: 0.22 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="orbit-agent__portrait"><AgentGlyph agentId={agent.id} /></span>
                  <span className="orbit-agent__copy">
                    <strong>{agent.name}</strong>
                    <small>{agent.orbitRole}</small>
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="intake-instrument"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="intake-instrument__heading">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.8 3.2 16.8 7.2 7.4 16.6 3.2 16.8 3.4 12.6 12.8 3.2ZM11.4 4.6 15.4 8.6" /></svg>
            <strong>Describe your career decision</strong>
          </div>
          <label className="sr-only" htmlFor="decision-prompt">Describe the career decision you are weighing</label>
          <textarea
            ref={promptRef}
            id="decision-prompt"
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            maxLength={520}
            rows={4}
            placeholder="Describe the tradeoffs, constraints, and what matters over the next five years."
          />
          <div className="intake-instrument__footer">
            {!recording && (
              <div className="intake-mode-panel">
                <div className="mode-switch" aria-label="Reasoning mode">
                  <button type="button" className={mode === 'curated' ? 'is-active' : ''} onClick={() => onModeChange('curated')}>Curated council</button>
                  <button type="button" className={mode === 'live' ? 'is-active' : ''} onClick={() => onModeChange('live')}>Live local</button>
                </div>
                {mode === 'live' && (
                  <label className="model-picker">
                    <span>LM Studio model</span>
                    <select value={selectedModel} onChange={(event) => onModelChange(event.target.value)} disabled={loadingModels || models.length === 0}>
                      {models.length > 0 ? models.map((model) => <option key={model} value={model}>{model}</option>) : <option>{loadingModels ? 'Discovering loaded models…' : 'No chat model loaded'}</option>}
                    </select>
                  </label>
                )}
              </div>
            )}
            <span className="character-count">{prompt.length}/520</span>
            <button className="primary-button" type="button" onClick={onStart} disabled={startDisabled}>
              {generating ? 'Assembling council…' : 'Run council'}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {error && <p className="intake-error" role="alert">{error}</p>}
        </motion.div>

        <motion.div
          className="intake-council-rail"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.54, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Council members"
        >
          {councilMembers.map((agent) => (
            <div className={`intake-council-rail__agent intake-council-rail__agent--${agent.id}`} key={agent.id}>
              <AgentGlyph agentId={agent.id} />
              <span><strong>{agent.name}</strong><small>{agent.railRole}</small></span>
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  )
}
