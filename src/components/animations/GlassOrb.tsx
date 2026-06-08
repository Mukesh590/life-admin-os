'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment, Float } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import type * as THREE from 'three'

function OrbMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = clock.elapsedTime * 0.12
    meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.08
  })

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <MeshTransmissionMaterial
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
          color="#b4b8ff"
          attenuationColor="#6366f1"
          attenuationDistance={0.9}
        />
      </mesh>
    </Float>
  )
}

export function GlassOrb({ className = '' }: { className?: string }) {
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
          <OrbMesh />
        </Suspense>
      </Canvas>
    </div>
  )
}
