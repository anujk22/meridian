import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import type { DecisionResults } from '../domain/types'

function circlePoints(radius: number, y = 0, tilt = 0): [number, number, number][] {
  return Array.from({ length: 97 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2
    return [Math.cos(angle) * radius, y + Math.sin(angle) * radius * Math.sin(tilt), Math.sin(angle) * radius * Math.cos(tilt)]
  })
}

const nodeColors = ['#3b6cff', '#f39a42', '#28b9c7']
const clusterCenters: [number, number, number][] = [
  [-0.42, -0.18, 0.18],
  [0.42, -0.18, 0.08],
  [0, 0.42, 0.04],
]

function GlobeScene({ compact, reducedMotion, active, shares }: { compact: boolean; reducedMotion: boolean; active: boolean; shares: number[] }) {
  const globe = useRef<Group>(null)
  const latitudeLines = useMemo(() => [-0.72, -0.4, 0, 0.4, 0.72].map((y) => {
    const radius = Math.sqrt(1 - y * y)
    return circlePoints(radius, y)
  }), [])
  const longitudeLines = useMemo(() => [0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4].map((rotation) =>
    Array.from({ length: 97 }, (_, index) => {
      const angle = (index / 96) * Math.PI * 2
      return [Math.sin(angle) * Math.cos(rotation), Math.cos(angle), Math.sin(angle) * Math.sin(rotation)] as [number, number, number]
    })), [])
  const nodes = useMemo(() => {
    const total = compact ? 24 : 48
    const counts = [Math.round(total * shares[0] / 100), Math.round(total * shares[1] / 100)]
    counts.push(total - counts[0] - counts[1])
    return counts.flatMap((count, cluster) => Array.from({ length: Math.max(0, count) }, (_, index) => {
      const angle = index * 2.399 + cluster * 0.8
      const radius = 0.08 + 0.38 * ((index % 7) / 7)
      const center = clusterCenters[cluster]
      return {
        cluster,
        position: [
          center[0] + Math.cos(angle) * radius,
          center[1] + Math.sin(angle) * radius * 0.72,
          center[2] + Math.sin(angle * 1.7) * 0.18,
        ] as [number, number, number],
      }
    }))
  }, [compact, shares])

  useFrame((_, delta) => {
    if (!globe.current || reducedMotion) return
    globe.current.rotation.y += delta * (active ? 0.14 : compact ? 0.055 : 0.08)
  })

  return (
    <>
      <ambientLight intensity={2.2} />
      <directionalLight position={[3, 4, 5]} intensity={2.8} color="#ffffff" />
      <pointLight position={[-3, -1, 3]} intensity={3.6} color="#4f8cff" />
      <group ref={globe} rotation={[0.08, -0.35, -0.04]}>
        <mesh>
          <sphereGeometry args={[1, compact ? 40 : 64, compact ? 40 : 64]} />
          <meshPhysicalMaterial color="#dfeeff" roughness={0.32} metalness={0} transmission={0.72} thickness={0.65} transparent opacity={0.58} depthWrite={false} />
        </mesh>
        <mesh scale={1.006}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color="#75a5ef" wireframe transparent opacity={0.08} />
        </mesh>
        {latitudeLines.map((points, index) => <Line key={`lat-${index}`} points={points} color="#6f9edf" transparent opacity={0.38} lineWidth={0.55} />)}
        {longitudeLines.map((points, index) => <Line key={`lng-${index}`} points={points} color={index === 0 ? '#2f67d7' : '#77a4df'} transparent opacity={index === 0 ? 0.72 : 0.34} lineWidth={index === 0 ? 1.25 : 0.5} />)}
        {nodes.map((node, index) => (
          <mesh key={`${node.cluster}-${index}`} position={node.position}>
            <sphereGeometry args={[compact ? 0.018 : 0.022, 8, 8]} />
            <meshBasicMaterial color={nodeColors[node.cluster]} transparent opacity={0.82} />
          </mesh>
        ))}
      </group>
      <group rotation={[0.2, 0.05, -0.28]}>
        <Line points={circlePoints(1.32, 0, 0.22)} color="#3f76dd" transparent opacity={active ? 0.68 : 0.42} lineWidth={0.75} />
        <Line points={circlePoints(1.5, 0, -0.2)} color="#8a5ee9" transparent opacity={active ? 0.44 : 0.28} lineWidth={0.55} />
      </group>
      <Line points={[[-0.75, -0.34, 0.72], [-0.2, 0.18, 0.94], [0.62, 0.36, 0.72]]} color="#f19a44" transparent opacity={0.62} lineWidth={0.8} />
    </>
  )
}

interface AtlasGlobeProps {
  compact?: boolean
  active?: boolean
  preparing?: boolean
  results?: DecisionResults
  className?: string
}

export function AtlasGlobe({ compact = false, active = false, preparing = false, results, className = '' }: AtlasGlobeProps) {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const shares = results?.options.map((option) => option.share) ?? [34, 28, 38]
  return (
    <div className={`atlas-globe${compact ? ' atlas-globe--compact' : ''}${active ? ' is-active' : ''}${preparing ? ' is-preparing' : ''} ${className}`}>
      <Canvas
        aria-hidden="true"
        camera={{ position: [0, 0, compact ? 4.15 : 3.8], fov: compact ? 39 : 42, near: 0.1, far: 20 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <GlobeScene compact={compact} reducedMotion={reducedMotion} active={active || preparing} shares={shares} />
      </Canvas>
      {!compact && (
        <div className="atlas-globe__readout">
          <strong>{preparing ? 'Assembling Council' : active ? 'Synthesizing Paths' : 'Decision Atlas'}</strong>
          <span>{results ? `${results.sampleCount.toLocaleString()} Scenarios · 5 Weighted Factors` : 'Mapping the Decision Space'}</span>
        </div>
      )}
    </div>
  )
}
