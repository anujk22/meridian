import type { DecisionResults } from '../domain/types'
import { FACTOR_LABELS, OPTION_LABELS, formatRange, type MutationTraceItem } from '../domain/trace'
import type { PathExplanation } from '../domain/explain'
import type { EvidenceChunk } from '../evidence/corpus'
import type { ClaimArtifact, HiddenConsideration } from '../scenario/builtin'

interface DecisionTraceProps {
  before: DecisionResults
  after: DecisionResults
  evidence: EvidenceChunk[]
  claims: ClaimArtifact[]
  challenges: HiddenConsideration[]
  mutations: MutationTraceItem[]
  paths: PathExplanation[]
}

function shares(results: DecisionResults) {
  return Object.fromEntries(results.options.map(({ id, share }) => [id, share])) as Record<'stable' | 'startup' | 'research', number>
}

export function DecisionTrace({ before, after, evidence, claims, challenges, mutations, paths }: DecisionTraceProps) {
  const beforeShares = shares(before)
  const afterShares = shares(after)
  const memos = claims.filter(({ kind }) => kind === 'claim')

  return (
    <details className="decision-trace" open>
      <summary>
        <span>Decision Trace</span>
        <strong>Why Meridian changed its mind</strong>
        <small>Evidence → memos → challenge → assumptions → simulation → your decision</small>
      </summary>

      <div className="decision-trace__body">
        <ol className="decision-trace__chain">
          <li>
            <span>01</span>
            <div><strong>Evidence retrieval completed</strong><p>{evidence.length} source chunks entered the council context.</p></div>
            <ul className="decision-trace__sources">{evidence.map((source) => <li key={source.id}><code>{source.id}</code><span>{source.title}</span></li>)}</ul>
          </li>
          <li>
            <span>02</span>
            <div><strong>Independent memos completed</strong><p>Harbor, Aster, and Lumen formed separate evidence-grounded views.</p></div>
            <ul className="decision-trace__memos">{memos.map((memo) => <li key={memo.id}><b>{memo.agentId === 'stableAdvocate' ? 'Harbor' : memo.agentId === 'startupAdvocate' ? 'Aster' : 'Lumen'}</b><span>{memo.title}</span></li>)}</ul>
          </li>
          <li>
            <span>03</span>
            <div><strong>Vesper cross-examined the council</strong><p>{challenges.map(({ title }) => title).join(' · ')}</p></div>
          </li>
          <li>
            <span>04</span>
            <div><strong>Validated assumption mutations</strong><p>Applied changes entered the simulator; ignored proposals did not.</p></div>
            <div className="decision-trace__mutations">
              {mutations.map((item) => (
                <article key={item.id}>
                  <span className={`is-${item.status}`}>{item.status}</span>
                  <strong>{OPTION_LABELS[item.mutation.optionId]} · {FACTOR_LABELS[item.mutation.factor]}</strong>
                  <p>{formatRange(item.previousRange)} → {formatRange(item.mutation.range)}</p>
                  <small>{item.origin} · {item.evidenceIds.join(', ') || 'No cited source'}</small>
                </article>
              ))}
            </div>
          </li>
          <li>
            <span>05</span>
            <div><strong>Deterministic simulation recomputed</strong><p>{after.sampleCount.toLocaleString()} scenarios ran through the same tested engine.</p></div>
            <div className="decision-trace__comparison">
              <section><small>Before council</small><b>Stable {beforeShares.stable}%</b><b>Startup {beforeShares.startup}%</b><b>Research {beforeShares.research}%</b></section>
              <section><small>After validated assumptions</small><b>Stable {afterShares.stable}%</b><b>Startup {afterShares.startup}%</b><b>Research {afterShares.research}%</b></section>
              <section><small>Largest driver</small><strong>{after.sensitivity.label}</strong><p>Most important thing to verify next.</p></section>
            </div>
          </li>
          <li>
            <span>06</span>
            <div><strong>Decision brief remains human-owned</strong><p>Meridian exposes dependencies; it does not accept a job, join a startup, or enroll for you.</p></div>
          </li>
        </ol>

        <section className="path-requirements">
          <div><span>What would need to be true?</span><p>Deterministic assumption tests for each path—not generated advice.</p></div>
          <div className="path-requirements__grid">
            {paths.map((path) => (
              <details key={path.optionId}>
                <summary><strong>{OPTION_LABELS[path.optionId]}</strong><span>{path.leadsNow ? `Leads now · ${path.projectedShare}%` : path.achievesLead ? `Could lead · ${path.projectedShare}%` : `Closest case · ${path.projectedShare}%`}</span></summary>
                <ul>{path.changes.map((change) => <li key={change}>{change}</li>)}</ul>
              </details>
            ))}
          </div>
        </section>
      </div>
    </details>
  )
}
