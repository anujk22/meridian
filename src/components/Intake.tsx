import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
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
}

const exampleDecision = 'I’m choosing between a stable SWE role, joining a friend’s early AI startup, or pursuing a funded AI research program. I want deep AI skills, financial independence, and choices I won’t regret in five years.'

const councilMembers = [
  { id: 'stableAdvocate' as const, name: 'Harbor', shortRole: 'Floor', role: 'Protects the financial floor', probe: 'Income security' },
  { id: 'startupAdvocate' as const, name: 'Aster', shortRole: 'Upside', role: 'Tests asymmetric upside', probe: 'Ownership value' },
  { id: 'researchAdvocate' as const, name: 'Lumen', shortRole: 'Evidence', role: 'Maps durable AI depth', probe: 'Learning depth' },
  { id: 'skeptic' as const, name: 'Vesper', shortRole: 'Challenge', role: 'Challenges the story', probe: 'Hidden assumptions' },
]

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void
}

export function Intake({ prompt, onPromptChange, onStart, recording, mode, onModeChange, models, selectedModel, onModelChange, loadingModels, generating, error }: IntakeProps) {
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const reduceMotion = useReducedMotion()
  const [composerFocused, setComposerFocused] = useState(false)
  const hasDecision = Boolean(prompt.trim())
  const startDisabled = !hasDecision || generating || (mode === 'live' && !selectedModel)

  const launchCouncil = () => {
    if (startDisabled) return
    const transitionDocument = document as ViewTransitionDocument
    if (!reduceMotion && transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(onStart)
      return
    }
    onStart()
  }

  return (
    <main className={`intake-shell phase-zero${composerFocused ? ' is-composing' : ''}${hasDecision ? ' has-decision' : ''}`}>
      <div className="phase-zero__field" aria-hidden="true"><span /><i /><b /></div>

      <header className="intake-rail">
        <BrandMark compact />
      </header>

      <div className="phase-zero__stage">
        <motion.section
          className="briefing-bay"
          initial={reduceMotion ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          aria-labelledby="intake-title"
        >
          <h1 className="meridian-display" id="intake-title">Make your best decisions with AI that reasons with you.</h1>
          <p className="meridian-thesis">Explore the paths your life could take.</p>
          <p className="briefing-bay__lede">
            Meridian turns one consequential choice into a four-agent simulation, mapping the downside, testing the upside, challenging the story, and showing what could change the outcome.
          </p>

          <form
            className="decision-brief"
            onSubmit={(event) => {
              event.preventDefault()
              launchCouncil()
            }}
          >
            <div className="decision-brief__heading">
              <div>
                <span>Decision brief</span>
                <strong>Describe the decision you want to simulate</strong>
              </div>
              <small className={hasDecision ? 'is-ready' : ''}><i />{hasDecision ? 'Brief ready' : 'Awaiting input'}</small>
            </div>

            <label className="sr-only" htmlFor="decision-prompt">Describe the decision you want to simulate</label>
            <textarea
              ref={promptRef}
              id="decision-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              maxLength={520}
              rows={5}
              placeholder="Name the paths, what matters, and the constraints the council should respect."
            />

            <div className="decision-brief__signals" aria-label="Scenario paths">
              <span className="signal-path signal-path--stable"><i />Stable SWE</span>
              <span className="signal-path signal-path--startup"><i />Early AI startup</span>
              <span className="signal-path signal-path--research"><i />Funded research</span>
            </div>

            {!recording && (
              <div className="run-mode" aria-label="Council run mode">
                <span>Run mode</span>
                <button type="button" className={mode === 'curated' ? 'is-active' : ''} aria-pressed={mode === 'curated'} onClick={() => onModeChange('curated')}>
                  <strong>Prepared council</strong><small>Fast, repeatable demonstration</small>
                </button>
                <button type="button" className={mode === 'live' ? 'is-active' : ''} aria-pressed={mode === 'live'} onClick={() => onModeChange('live')}>
                  <strong>Local model</strong><small>Private generation in LM Studio</small>
                </button>
              </div>
            )}

            {mode === 'live' && !recording && (
              <label className="decision-model-picker">
                <span>LM Studio model</span>
                <select value={selectedModel} onChange={(event) => onModelChange(event.target.value)} disabled={loadingModels || models.length === 0}>
                  {models.length > 0 ? models.map((model) => <option key={model} value={model}>{model}</option>) : <option>{loadingModels ? 'Discovering loaded models…' : 'No chat model loaded'}</option>}
                </select>
              </label>
            )}

            <div className="decision-brief__footer">
              <button className="example-decision" type="button" onClick={() => {
                onPromptChange(exampleDecision)
                promptRef.current?.focus()
              }}>
                <span aria-hidden="true">↺</span> Use example decision
              </button>
              <span className="decision-count">{prompt.length}/520</span>
              <motion.button className="convene-button" type="submit" disabled={startDisabled} whileTap={{ scale: 0.985 }}>
                <span>{generating ? 'Assembling council…' : 'Convene council'}</span>
                <i aria-hidden="true">→</i>
              </motion.button>
            </div>
            {error && <p className="intake-error" role="alert">{error}</p>}
          </form>
        </motion.section>

        <motion.section
          className="council-standby"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.72, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Four-agent council preview"
        >
          <div className="standby-stage">
            <svg className="standby-stage__map" viewBox="0 0 640 640" aria-hidden="true">
              <circle className="standby-ring standby-ring--outer" cx="320" cy="320" r="224" />
              <circle className="standby-ring standby-ring--middle" cx="320" cy="320" r="165" />
              <circle className="standby-ring standby-ring--inner" cx="320" cy="320" r="112" />
              <path className="standby-axis" d="M96 320H544M320 96V544" />
              <path className="standby-axis standby-axis--faint" d="M162 162 478 478M478 162 162 478" />
              <path className={`standby-beam standby-beam--harbor${hasDecision ? ' is-ready' : ''}`} d="M320 96V320" />
              <path className={`standby-beam standby-beam--aster${hasDecision ? ' is-ready' : ''}`} d="M544 320H320" />
              <path className={`standby-beam standby-beam--lumen${hasDecision ? ' is-ready' : ''}`} d="M96 320H320" />
              <path className={`standby-beam standby-beam--vesper${hasDecision ? ' is-ready' : ''}`} d="M320 544V320" />
              <g className="standby-ticks">
                <circle cx="320" cy="96" r="3" /><circle cx="544" cy="320" r="3" />
                <circle cx="320" cy="544" r="3" /><circle cx="96" cy="320" r="3" />
                <circle cx="162" cy="162" r="2.5" /><circle cx="478" cy="162" r="2.5" />
                <circle cx="478" cy="478" r="2.5" /><circle cx="162" cy="478" r="2.5" />
              </g>
            </svg>

            <motion.div
              className="standby-atlas intake-atlas-transition"
              initial={false}
              animate={{ x: '-50%', y: '-50%', scale: composerFocused && !reduceMotion ? 1.025 : 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <AtlasGlobe compact active={hasDecision} />
              <div className="standby-atlas__status"><span>Decision Atlas</span><strong>{hasDecision ? 'Brief signal acquired' : 'Awaiting decision brief'}</strong></div>
            </motion.div>

            {councilMembers.map((agent, index) => (
              <motion.article
                className={`standby-agent standby-agent--${agent.id}`}
                key={agent.id}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.75 }}
                animate={{ x: '-50%', y: '-50%', opacity: hasDecision ? 1 : 0.76, scale: hasDecision ? 1 : 0.94 }}
                transition={{ duration: 0.48, delay: reduceMotion ? 0 : 0.22 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="standby-agent__portrait"><AgentGlyph agentId={agent.id} active={hasDecision} /></span>
                <span className="standby-agent__copy"><small>{agent.shortRole}</small><strong>{agent.name}</strong><span>{agent.role}</span></span>
              </motion.article>
            ))}

            {councilMembers.map((agent) => (
              <span className={`standby-probe standby-probe--${agent.id}`} key={`${agent.id}-probe`}><i />{agent.probe}</span>
            ))}
          </div>

          <div className="council-protocol">
            <div><span>Protocol</span><strong>Independent memos → cross-examination → synthesis</strong></div>
            <small><i /> 4 agents <i /> evidence retrieval <i /> assumption ledger</small>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
