import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'

function circlePoints(radius: number, y = 0, tilt = 0): [number, number, number][] {
  return Array.from({ length: 97 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2
    return [Math.cos(angle) * radius, y + Math.sin(angle) * radius * Math.sin(tilt), Math.sin(angle) * radius * Math.cos(tilt)]
  })
}

function GlobeScene({ compact, reducedMotion, reveal }: { compact: boolean; reducedMotion: boolean; reveal: boolean }) {
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

  useFrame((_, delta) => {
    if (!globe.current) return
    if (!reducedMotion) globe.current.rotation.y += delta * (reveal ? 0.16 : compact ? 0.055 : 0.085)
    if (reveal) {
      const next = Math.min(1.12, globe.current.scale.x + delta * 0.13)
      globe.current.scale.setScalar(next)
    }
  })

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 4, 5]} intensity={3.2} color="#eaf3ff" />
      <pointLight position={[-3, -1, 3]} intensity={4} color="#2f80ff" />
      <group ref={globe} rotation={[0.08, -0.35, -0.04]} scale={reveal ? 0.84 : 1}>
        <mesh>
          <sphereGeometry args={[1, compact ? 40 : 64, compact ? 40 : 64]} />
          <meshPhysicalMaterial color="#155eef" roughness={0.28} metalness={0.08} transmission={0.18} thickness={1.2} clearcoat={0.75} clearcoatRoughness={0.18} />
        </mesh>
        {latitudeLines.map((points, index) => <Line key={`lat-${index}`} points={points} color="#b9d6ff" transparent opacity={0.42} lineWidth={0.55} />)}
        {longitudeLines.map((points, index) => <Line key={`lng-${index}`} points={points} color={index === 0 ? '#ffffff' : '#b9d6ff'} transparent opacity={index === 0 ? 0.9 : 0.35} lineWidth={index === 0 ? (reveal ? 2.4 : 1.1) : 0.5} />)}
        <mesh position={[0, 1.01, 0]}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, -1.01, 0]}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      <group rotation={[0.2, 0.05, -0.28]}>
        <Line points={circlePoints(1.34, 0, 0.22)} color="#8bbcff" transparent opacity={0.62} lineWidth={0.75} />
        <Line points={circlePoints(1.52, 0, -0.2)} color="#c8ddff" transparent opacity={0.48} lineWidth={0.55} />
      </group>
      <mesh position={[0, -1.25, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 64]} />
        <meshBasicMaterial color="#4d9cff" transparent opacity={0.08} />
      </mesh>
    </>
  )
}

export function AtlasGlobe({ compact = false, reveal = false, className = '' }: { compact?: boolean; reveal?: boolean; className?: string }) {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <div className={`atlas-globe${compact ? ' atlas-globe--compact' : ''} ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, compact ? 4.2 : 3.85], fov: compact ? 40 : 43, near: 0.1, far: 20 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <GlobeScene compact={compact} reducedMotion={reducedMotion} reveal={reveal} />
      </Canvas>
    </div>
  )
}
