import { useEffect, useId, useState } from 'react'
import type { DecisionResults } from '../domain/types'
import type { AgentId } from '../scenario/builtin'

interface AtlasGlobeProps {
  compact?: boolean
  active?: boolean
  preparing?: boolean
  pointingAt?: AgentId | null
  results?: DecisionResults
  className?: string
}

export function AtlasGlobe({ compact = false, active = false, preparing = false, pointingAt = null, results, className = '' }: AtlasGlobeProps) {
  const id = useId().replaceAll(':', '')
  const glassId = `core-glass-${id}`
  const glowId = `core-glow-${id}`
  const [bearingTarget, setBearingTarget] = useState<AgentId | null>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setBearingTarget(pointingAt))
    return () => window.cancelAnimationFrame(frame)
  }, [pointingAt])

  return (
    <div className={`atlas-globe meridian-core${compact ? ' atlas-globe--compact' : ''}${active ? ' is-active' : ''}${preparing ? ' is-preparing' : ''}${bearingTarget ? ` is-pointing-${bearingTarget}` : ''} ${className}`}>
      <svg className="meridian-core__svg" viewBox="0 0 320 320" aria-hidden="true">
        <defs>
          <radialGradient id={glassId} cx="50%" cy="42%" r="62%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="0.42" stopColor="#e6f3ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#b9d9ff" stopOpacity="0.12" />
          </radialGradient>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle className="meridian-core__glass" cx="160" cy="160" r="111" fill={`url(#${glassId})`} />
        <circle className="meridian-core__rim" cx="160" cy="160" r="112" />
        <circle className="meridian-core__grid" cx="160" cy="160" r="82" />
        <circle className="meridian-core__grid meridian-core__grid--inner" cx="160" cy="160" r="52" />

        <g className="meridian-core__radials">
          <path d="M160 50V270M50 160H270" />
          <path d="M82 82 238 238M238 82 82 238" />
        </g>

        <g className="meridian-core__orbit meridian-core__orbit--one">
          <ellipse cx="160" cy="160" rx="126" ry="69" transform="rotate(-13 160 160)" />
        </g>
        <g className="meridian-core__orbit meridian-core__orbit--two">
          <ellipse cx="160" cy="160" rx="78" ry="121" transform="rotate(31 160 160)" />
        </g>
        <circle className="meridian-core__orbit meridian-core__orbit--three" cx="160" cy="160" r="99" />

        <g className="meridian-core__axis">
          <path d="M160 55V265M55 160H265" />
          <path d="M160 55l-5 13h10l-5-13ZM265 160l-13-5v10l13-5ZM160 265l5-13h-10l5 13ZM55 160l13 5v-10l-13 5Z" />
        </g>

        <circle className="meridian-core__pulse" cx="160" cy="160" r="33" />
        <g className="meridian-core__bearing">
          <path
            className="meridian-core__star"
            d="M160 92 170 148 228 160 170 172 160 228 150 172 92 160 150 148 160 92Z"
            filter={`url(#${glowId})`}
          />
        </g>
        <circle className="meridian-core__center-ring" cx="160" cy="160" r="15" />
        <circle className="meridian-core__center" cx="160" cy="160" r="5" />

        <g className="meridian-core__shimmers">
          <circle cx="160" cy="48" r="3" />
          <circle cx="257" cy="111" r="2.5" />
          <circle cx="91" cy="235" r="2.5" />
          <circle cx="224" cy="246" r="2" />
        </g>
      </svg>

      {!compact && (
        <div className="atlas-globe__readout">
          <strong>{preparing ? 'Assembling Council' : active ? 'Synthesizing Paths' : 'Decision Atlas'}</strong>
          <span>{results ? `${results.sampleCount.toLocaleString()} Scenarios · 5 Weighted Factors` : 'Mapping the Decision Space'}</span>
        </div>
      )}
    </div>
  )
}
