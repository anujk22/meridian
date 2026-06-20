import { motion } from 'motion/react'
import { BrandMark } from './BrandMark'
import { BUILTIN_PROMPT } from '../scenario/builtin'

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
  guided: boolean
  onGuidedChange: (value: boolean) => void
}

export function Intake({ prompt, onPromptChange, onStart, recording, mode, onModeChange, models, selectedModel, onModelChange, loadingModels, generating, error, guided, onGuidedChange }: IntakeProps) {
  return (
    <main className="intake-shell">
      <div className="intake-shell__sky" aria-hidden="true">
        <span className="orbit orbit--one" />
        <span className="orbit orbit--two" />
        <span className="meridian-beam" />
      </div>

      <header className="intake-header">
        <BrandMark />
        <div className="local-status"><span /> Private · on this machine</div>
      </header>

      <section className="intake-content">
        <motion.div
          className="intake-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="intake-kicker">Decision intelligence, on your machine</p>
          <h1>Find what your decision <em>really depends on.</em></h1>
          <p className="intake-lede">
            Compare the strongest case for every path, uncover hidden tradeoffs, and see exactly what could change the answer.
          </p>
          <p className="intake-definition">A meridian is a line of reference. This helps you find yours.</p>
        </motion.div>

        <motion.div
          className="intake-instrument"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <label htmlFor="decision-prompt">State a decision you’re weighing</label>
          <textarea
            id="decision-prompt"
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            maxLength={520}
            rows={5}
          />
          {!recording && (
            <div className="intake-mode-panel">
              <div className="mode-switch" aria-label="Reasoning mode">
                <button type="button" className={mode === 'curated' ? 'is-active' : ''} onClick={() => onModeChange('curated')}>Curated demo</button>
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
              <label className="guidance-toggle">
                <input type="checkbox" checked={guided} onChange={(event) => onGuidedChange(event.target.checked)} />
                <span aria-hidden="true"><i /></span>
                Guide me through the result
              </label>
            </div>
          )}
          {error && <p className="intake-error" role="alert">{error}</p>}
          <div className="intake-instrument__footer">
            <button className="example-chip" type="button" onClick={() => onPromptChange(BUILTIN_PROMPT)}>
              Job · Startup · AI master’s
            </button>
            <span className="character-count">{prompt.length}/520</span>
            <button className="primary-button" type="button" onClick={onStart} disabled={!prompt.trim() || generating || (mode === 'live' && !selectedModel)}>
              {generating ? 'Preparing analysis…' : 'Analyze my decision'}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </motion.div>
      </section>

      {!recording && (
        <div className="intake-note">
          Live local keeps your prompt and analysis on this machine.
        </div>
      )}
    </main>
  )
}
