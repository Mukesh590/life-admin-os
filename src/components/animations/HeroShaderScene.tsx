'use client'
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), f.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.1;

  vec2 q = vec2(fbm(uv + t * 0.1), fbm(uv + vec2(1.0)));
  vec2 r = vec2(
    fbm(uv + 2.0*q + vec2(1.7, 9.2) + t*0.12),
    fbm(uv + 2.0*q + vec2(8.3, 2.8) + t*0.08)
  );
  float f = fbm(uv + 2.0 * r);

  float md = length(uv - uMouse);
  f += smoothstep(0.35, 0.0, md) * 0.25;

  vec3 c = mix(vec3(0.035,0.035,0.043), vec3(0.12,0.09,0.22), clamp(f*f*3.5, 0.0, 1.0));
  c = mix(c, vec3(0.22,0.19,0.52), clamp(length(q)*0.7, 0.0, 1.0));
  c = mix(c, vec3(0.08,0.06,0.18), clamp(r.x*r.y*2.0, 0.0, 1.0));

  vec2 vig = (uv - 0.5) * 2.0;
  c *= clamp(1.0 - dot(vig*0.65, vig*0.65), 0.0, 1.0);

  gl_FragColor = vec4(c, 1.0);
}
`

function ShaderPlane() {
  const { viewport, gl } = useThree()
  const targetMouseRef = useRef(new THREE.Vector2(0.5, 0.5))

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }), [])

  useEffect(() => {
    const canvas = gl.domElement
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetMouseRef.current.set(
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height
      )
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [gl])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uMouse.value.lerp(targetMouseRef.current, 0.04)
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export function HeroShaderScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: false }}
    >
      <ShaderPlane />
    </Canvas>
  )
}
