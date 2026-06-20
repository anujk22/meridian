import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { computeDecision } from '../domain/engine'
import { createInitialModel } from '../domain/model'
import { applyMutation } from '../domain/mutations'
import type { ModelMutation } from '../domain/types'
import { retrieveEvidence, type RetrievalResult } from '../evidence/retrieval'
import { generateLiveScenario, listLocalModels, type LiveScenario } from '../integrations/lmStudio'
import {
  BUILTIN_PROMPT,
  CLAIMS,
  CONTEXT_CHIPS,
  GOAL_CHIPS,
  HIDDEN_CONSIDERATIONS,
  type TimelineEvent,
} from '../scenario/builtin'
import { demoReducer, initialDemoState } from '../scenario/reducer'
import { useDemoTimeline } from '../scenario/useDemoTimeline'
import { BrandMark } from '../components/BrandMark'
import { ControlDeck } from '../components/ControlDeck'
import { Intake } from '../components/Intake'
import { LiveReasoning } from '../components/LiveReasoning'
import { OutcomePanel } from '../components/OutcomePanel'
import { PathArena } from '../components/PathArena'
import { Verdict } from '../components/Verdict'

const phaseLabels = {
  intake: 'Intake',
  decomposition: 'Decomposing decision',
  council: 'Council assembling',
  arguments: 'Opening arguments',
  skeptic: 'Red-team review',
  analysis: 'Quantifying assumptions',
  recompute: 'Recomputing model',
  explore: 'What-if exploration',
  verdict: 'Decision brief',
}

function councilPhase(phase: keyof typeof phaseLabels): 1 | 2 | 3 {
  if (phase === 'decomposition' || phase === 'council') return 1
  if (phase === 'arguments' || phase === 'skeptic') return 2
  return 3
}

function mutationTitle(mutation: ModelMutation): string {
  if (mutation.kind === 'setRisk') return `Risk tolerance set to ${Math.round(mutation.value * 100)}`
  if (mutation.kind === 'setHorizon') return `Time horizon set to ${mutation.value} years`
  if (mutation.kind === 'setWeight') return `${mutation.factor === 'aiGrowth' ? 'AI growth' : mutation.factor === 'financialFloor' ? 'Financial floor' : 'Ownership'} weight changed`
  if (mutation.kind === 'setToggle') {
    const labels = {
      mastersFunded: 'Master’s funding',
      startupTraction: 'Startup traction',
      incomeNow: 'Immediate income need',
      willingToRelocate: 'Relocation flexibility',
      preferBuilding: 'Building preference',
    }
    return `${labels[mutation.toggle]} ${mutation.value ? 'enabled' : 'disabled'}`
  }
  return 'Model range revised'
}

function mutationKey(mutation: ModelMutation): string {
  if (mutation.kind === 'setWeight') return `user-weight-${mutation.factor}`
  if (mutation.kind === 'setToggle') return `user-toggle-${mutation.toggle}`
  return `user-${mutation.kind}`
}

export function App() {
  const [prompt, setPrompt] = useState(BUILTIN_PROMPT)
  const [model, setModel] = useState(createInitialModel)
  const [demo, dispatchDemo] = useReducer(demoReducer, initialDemoState)
  const [citations, setCitations] = useState<Record<string, RetrievalResult>>({})
  const [mode, setMode] = useState<'curated' | 'live'>('curated')
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [loadingModels, setLoadingModels] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [liveScenario, setLiveScenario] = useState<LiveScenario | null>(null)
  const [guided, setGuided] = useState(true)
  const [controlsOpen, setControlsOpen] = useState(false)
  const runtimeScenarioRef = useRef<LiveScenario | null>(null)
  const mutationCursorRef = useRef(0)
  const presentedBriefRef = useRef(false)
  const recording = useMemo(() => new URLSearchParams(window.location.search).get('recording') === '1', [])
  const demoSpeed = useMemo(() => {
    const requested = Number(new URLSearchParams(window.location.search).get('speed') ?? 1)
    return Number.isFinite(requested) ? Math.min(20, Math.max(0.1, requested)) : 1
  }, [])
  const results = useMemo(() => computeDecision(model), [model])
  const scenario = liveScenario ?? {
    contextChips: CONTEXT_CHIPS,
    goalChips: GOAL_CHIPS,
    claims: CLAIMS,
    hiddenConsiderations: HIDDEN_CONSIDERATIONS,
  }

  useEffect(() => {
    if (recording) return
    listLocalModels()
      .then((available) => {
        const ids = available.map(({ id }) => id)
        setModels(ids)
        setSelectedModel((current) => current || ids.find((id) => /qwopus.*35b.*a3b/i.test(id)) || ids[0] || '')
      })
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false))
  }, [recording])

  const retrieveForArtifact = useCallback(async (artifactId: string, query: string | null) => {
    if (!query) return
    const result = await retrieveEvidence(query, 2)
    setCitations((current) => ({ ...current, [artifactId]: result }))
  }, [])

  const handleTimelineEvent = useCallback((event: TimelineEvent) => {
    let runtimeEvent = event
    if (event.type === 'mutation') {
      const generated = runtimeScenarioRef.current?.mutations[mutationCursorRef.current]
      mutationCursorRef.current += 1
      if (generated) {
        runtimeEvent = {
          ...event,
          mutation: generated,
          ledger: {
            ...event.ledger,
            title: mutationTitle(generated),
            detail: generated.reason,
          },
        }
      }
    }
    dispatchDemo({ type: 'timeline', event: runtimeEvent })
    if (runtimeEvent.type === 'mutation') setModel((current) => applyMutation(current, runtimeEvent.mutation))
    if (event.type === 'claim') {
      const claim = (runtimeScenarioRef.current?.claims ?? CLAIMS).find((candidate) => candidate.id === event.claimId)
      void retrieveForArtifact(event.claimId, claim?.retrievalQuery ?? null)
    }
    if (event.type === 'hidden') {
      const consideration = (runtimeScenarioRef.current?.hiddenConsiderations ?? HIDDEN_CONSIDERATIONS).find((candidate) => candidate.id === event.considerationId)
      void retrieveForArtifact(event.considerationId, consideration?.retrievalQuery ?? null)
    }
  }, [retrieveForArtifact])

  useDemoTimeline({
    running: demo.running,
    paused: demo.paused,
    speed: demoSpeed,
    onEvent: handleTimelineEvent,
  })

  const startDemo = useCallback(async () => {
    setLiveError(null)
    let generated: LiveScenario | null = null
    if (mode === 'live') {
      if (!selectedModel) {
        setLiveError('Start LM Studio, load a chat model, and enable its local server on port 1234.')
        return
      }
      setGenerating(true)
      try {
        generated = await generateLiveScenario(prompt, selectedModel)
      } catch (error) {
        setLiveError(error instanceof Error ? error.message : 'LM Studio could not generate the council response.')
        return
      } finally {
        setGenerating(false)
      }
    }
    runtimeScenarioRef.current = generated
    mutationCursorRef.current = 0
    presentedBriefRef.current = false
    setLiveScenario(generated)
    setModel(createInitialModel())
    setCitations({})
    setControlsOpen(false)
    dispatchDemo({ type: 'start' })
  }, [mode, prompt, selectedModel])

  const resetDemo = useCallback(() => {
    setModel(createInitialModel())
    setCitations({})
    mutationCursorRef.current = 0
    presentedBriefRef.current = false
    setControlsOpen(false)
    dispatchDemo({ type: 'reset' })
  }, [])

  useEffect(() => {
    if (demo.phase !== 'explore' || !guided || controlsOpen || presentedBriefRef.current) return
    presentedBriefRef.current = true
    const timeout = window.setTimeout(() => dispatchDemo({ type: 'verdict' }), 700)
    return () => window.clearTimeout(timeout)
  }, [controlsOpen, demo.phase, guided])

  useEffect(() => {
    if (demo.phase === 'intake' || demo.phase === 'verdict') return
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        dispatchDemo({ type: 'pause', value: !demo.paused })
      }
      if (event.key.toLowerCase() === 'r') resetDemo()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [demo.paused, demo.phase, resetDemo])

  const handleUserMutation = useCallback((mutation: ModelMutation) => {
    setModel((current) => applyMutation(current, mutation))
    const key = mutationKey(mutation)
    dispatchDemo({
      type: 'ledger',
      replaceKey: key,
      entry: {
        id: `${key}-${Date.now()}`,
        actor: 'You',
        title: mutationTitle(mutation),
        detail: mutation.reason,
        tone: 'user',
      },
    })
  }, [])

  const handleTestAssumptions = useCallback(() => {
    if (demo.phase === 'explore') {
      setControlsOpen((current) => !current)
      return
    }
    setGuided(false)
    setControlsOpen(true)
    dispatchDemo({ type: 'explore' })
  }, [demo.phase])

  if (demo.phase === 'intake') {
    if (generating) return <LiveReasoning prompt={prompt} model={selectedModel} />
    return <Intake prompt={prompt} onPromptChange={setPrompt} onStart={() => void startDemo()} recording={recording} mode={recording ? 'curated' : mode} onModeChange={setMode} models={models} selectedModel={selectedModel} onModelChange={setSelectedModel} loadingModels={loadingModels} generating={generating} error={liveError} guided={guided} onGuidedChange={setGuided} />
  }

  const activeCouncilPhase = councilPhase(demo.phase)

  return (
    <div className={`simulation-shell simulation-shell--${demo.phase}${controlsOpen ? ' has-controls' : ''}${recording ? ' is-recording' : ''}`}>
      <div className="observatory-background" aria-hidden="true"><span /><i /><b /></div>
      <header className="instrument-rail">
        <BrandMark compact />
        <div className="phase-readout">
          <span><i /> Council deliberation</span>
          <small>{phaseLabels[demo.phase]} · Phase {activeCouncilPhase} of 3</small>
        </div>
        <div className="instrument-rail__status">
          <span className="privacy-badge"><i /> Local & private</span>
          {!recording && <span className="mode-badge">{liveScenario ? `Live · ${liveScenario.modelId}` : 'Curated demo'}</span>}
          {!recording && demo.running && (
            <button className="icon-button" type="button" onClick={() => dispatchDemo({ type: 'pause', value: !demo.paused })}>
              {demo.paused ? 'Resume' : 'Pause'}
            </button>
          )}
          {!recording && <button className="icon-button" type="button" onClick={resetDemo}>Restart</button>}
        </div>
      </header>

      <div className="stage-grid">
        <nav className="phase-stepper" aria-label="Deliberation progress">
          {[
            { number: 1, label: 'Independent memos' },
            { number: 2, label: 'Cross-examination' },
            { number: 3, label: 'Synthesis' },
          ].map((step) => {
            const status = step.number < activeCouncilPhase ? 'complete' : step.number === activeCouncilPhase ? 'active' : 'queued'
            return (
              <div className={`phase-step is-${status}`} key={step.number}>
                <span>{status === 'complete' ? '✓' : step.number}</span>
                <div><strong>{step.label}</strong><small>{status === 'complete' ? 'Completed' : status === 'active' ? 'Active' : 'Queued'}</small></div>
              </div>
            )
          })}
        </nav>
        <PathArena
          phase={demo.phase}
          visibleClaimIds={demo.visibleClaimIds}
          visibleConsiderationIds={demo.visibleConsiderationIds}
          citations={citations}
          claims={scenario.claims}
          hiddenConsiderations={scenario.hiddenConsiderations}
          activeAgent={demo.activeAgent}
          latestLedgerEntry={demo.ledger.at(-1) ?? null}
        />
        <OutcomePanel results={results} focused={demo.focus === 'axis'} controlsOpen={controlsOpen} onTestAssumptions={handleTestAssumptions} />
      </div>

      <AnimatePresence>
        {demo.phase === 'explore' && controlsOpen && (
          <motion.div
            className="control-deck-wrap"
            initial={{ y: 44, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 44, opacity: 0 }}
          >
            <ControlDeck model={model} onMutation={handleUserMutation} onVerdict={() => { setControlsOpen(false); dispatchDemo({ type: 'verdict' }) }} leader={results.options.find((option) => option.id === results.leaderId)?.label ?? 'Leading path'} share={results.options.find((option) => option.id === results.leaderId)?.share ?? 0} sensitivity={results.sensitivity.label} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {demo.phase === 'verdict' && (
          <Verdict
            results={results}
            onBack={() => { setControlsOpen(true); dispatchDemo({ type: 'explore' }) }}
            onRestart={resetDemo}
          />
        )}
      </AnimatePresence>

      {demo.paused && <div className="pause-indicator">Deliberation paused · press Space to resume</div>}
    </div>
  )
}
