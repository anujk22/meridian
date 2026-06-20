import { motion } from 'motion/react'
import { AGENTS } from '../scenario/builtin'
import { BUILTIN_PROMPT } from '../scenario/builtin'
import { AgentGlyph } from './AgentGlyph'
import { AtlasGlobe } from './AtlasGlobe'
import { BrandMark } from './BrandMark'

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
      <div className="intake-shell__sky" aria-hidden="true"><span /><i /><b /></div>

      <header className="intake-header">
        <BrandMark />
        <div className="local-status"><span /> Council ready · private on this machine</div>
      </header>

      <section className="intake-content">
        <motion.div
          className="intake-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="intake-kicker">Decision intelligence for high-stakes career tradeoffs</p>
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
          aria-label="Preview of four AI counselors orbiting the Decision Atlas"
        >
          <svg viewBox="0 0 560 420" aria-hidden="true">
            <ellipse cx="280" cy="210" rx="225" ry="156" />
            <path d="M 120 105 C 180 125, 210 150, 248 185" />
            <path d="M 440 105 C 380 125, 350 150, 312 185" />
            <path d="M 120 315 C 180 295, 210 270, 248 235" />
            <path d="M 440 315 C 380 295, 350 270, 312 235" />
          </svg>
          <AtlasGlobe compact active />
          {AGENTS.map((agent) => (
            <div className={`intake-preview__agent intake-preview__agent--${agent.id}`} key={agent.id}>
              <AgentGlyph agentId={agent.id} />
              <span><strong>{agent.name}</strong>{agent.role}</span>
            </div>
          ))}
          <p><strong>Four perspectives.</strong> One conditional recommendation.</p>
        </motion.div>

        <motion.div
          className="intake-instrument"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="intake-instrument__heading">
            <div><strong>Career decision composer</strong><span>Calibrated demo: stable role, startup, and research paths</span></div>
            <button className="example-chip" type="button" onClick={() => onPromptChange(BUILTIN_PROMPT)}>Use the CS career example</button>
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
                <label className="guidance-toggle">
                  <input type="checkbox" checked={guided} onChange={(event) => onGuidedChange(event.target.checked)} />
                  Guide me through the result
                </label>
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
