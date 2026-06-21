import { motion } from 'motion/react'
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

export function Intake({ prompt, onPromptChange, onStart, recording, mode, onModeChange, models, selectedModel, onModelChange, loadingModels, generating, error, theme, onThemeToggle }: IntakeProps) {
  return (
    <main className="intake-shell">
      <header className="intake-header">
        <BrandMark />
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </header>

      <section className="intake-content">
        <motion.div
          className="intake-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1>See what your decision <em>depends on.</em></h1>
          <p className="intake-lede">
            Meridian stages a four-agent council around one career-path decision. Each perspective counsels, challenges assumptions, attaches evidence, and shows what could change the recommendation.
          </p>
          <div className="intake-paths" aria-label="Paths compared">
            <span>Stable SWE</span><i /> <span>Early AI startup</span><i /> <span>Funded research</span>
          </div>
        </motion.div>

        <motion.div
          className="intake-preview"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.72, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Meridian Decision Atlas"
        >
          <AtlasGlobe compact active />
        </motion.div>

        <motion.div
          className="intake-instrument"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="intake-instrument__heading">
            <strong>Describe your career decision</strong>
            <span>Compare a stable role, startup, and research path.</span>
          </div>
          <label className="sr-only" htmlFor="decision-prompt">Describe the career decision you are weighing</label>
          <textarea
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
            <button className="primary-button" type="button" onClick={onStart} disabled={!prompt.trim() || generating || (mode === 'live' && !selectedModel)}>
              {generating ? 'Assembling council…' : 'Run career council'}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          {error && <p className="intake-error" role="alert">{error}</p>}
        </motion.div>
      </section>
    </main>
  )
}
