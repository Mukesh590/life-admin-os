'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment, Float } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import { Color } from 'three'
import type * as THREE from 'three'

// Barometer signature: the orb's glass tint reads real dashboard urgency —
// clear indigo-violet when on track, warming toward amber/rose as overdue
// items and expiring items accumulate. `urgency` is a clamped 0-1 score.
const CALM = { color: '#b4b8ff', attenuation: '#6366f1' }
const WARM = { color: '#ffbfa8', attenuation: '#fb7185' }

function OrbMesh({ urgency }: { urgency: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null)

  const calmColor = useMemo(() => new Color(CALM.color), [])
  const calmAttenuation = useMemo(() => new Color(CALM.attenuation), [])
  const warmColor = useMemo(() => new Color(WARM.color), [])
  const warmAttenuation = useMemo(() => new Color(WARM.attenuation), [])
  const liveColor = useRef(new Color(CALM.color))
  const liveAttenuation = useRef(new Color(CALM.attenuation))

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = clock.elapsedTime * 0.12
    meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.08

    if (materialRef.current) {
      const targetColor = calmColor.clone().lerp(warmColor, urgency)
      const targetAttenuation = calmAttenuation.clone().lerp(warmAttenuation, urgency)
      liveColor.current.lerp(targetColor, 0.04)
      liveAttenuation.current.lerp(targetAttenuation, 0.04)
      materialRef.current.color = liveColor.current
      materialRef.current.attenuationColor = liveAttenuation.current
    }
  })

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <MeshTransmissionMaterial
          ref={materialRef}
          backside
          samples={6}
          thickness={0.45}
          roughness={0.02}
          transmission={1}
          ior={1.52}
          chromaticAberration={0.045}
          anisotropy={0.18}
          distortion={0.06}
          distortionScale={0.2}
          temporalDistortion={0.04}
          color={CALM.color}
          attenuationColor={CALM.attenuation}
          attenuationDistance={0.9}
        />
      </mesh>
    </Float>
  )
}

export function GlassOrb({ className = '', urgency = 0 }: { className?: string; urgency?: number }) {
  const clamped = Math.max(0, Math.min(1, urgency))
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[6, 8, 4]} intensity={0.7} color="#c4c8ff" />
        <pointLight position={[-4, -2, -3]} intensity={0.35} color="#6366f1" />
        <spotLight position={[0, 6, 2]} intensity={0.3} color="#a5b4fc" angle={0.5} />
        <Suspense fallback={null}>
          <Environment preset="night" />
          <OrbMesh urgency={clamped} />
        </Suspense>
      </Canvas>
    </div>
  )
}
