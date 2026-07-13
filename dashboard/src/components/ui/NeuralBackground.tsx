'use client'

import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import type { FC } from 'react'

const PARTICLE_COUNT = 120
const CONNECTION_DISTANCE = 2.5
const SPREAD = 6
const MAX_CONNECTIONS = 400

let purple: { r: number; g: number; b: number }
let cyan: { r: number; g: number; b: number }

function ParticlesInner() {
  // Lazy-load Three.js only on client
  const THREE = require('three')
  const { Canvas, useFrame } = require('@react-three/fiber')

  if (!purple) {
    purple = new THREE.Color('#8b5cf6')
    cyan = new THREE.Color('#06b6d4')
  }

  const pointsRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)

  const [particleGeo] = useState(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const basePositions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      const x = (Math.random() - 0.5) * SPREAD * 2
      const y = (Math.random() - 0.5) * SPREAD * 2
      const z = (Math.random() - 0.5) * SPREAD * 2
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      basePositions[i3] = x
      basePositions[i3 + 1] = y
      basePositions[i3 + 2] = z
      velocities[i3] = (Math.random() - 0.5) * 0.002
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.002
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.002

      const t = Math.random()
      const col = purple.clone().lerp(cyan, t)
      colors[i3] = col.r
      colors[i3 + 1] = col.g
      colors[i3 + 2] = col.b
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.userData = { basePositions, velocities }

    return geo
  })

  const [lineGeo] = useState(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_CONNECTIONS * 6), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_CONNECTIONS * 6), 3))
    geo.setDrawRange(0, 0)
    return geo
  })

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array
    const { basePositions, velocities } = particleGeo.userData as {
      basePositions: Float32Array
      velocities: Float32Array
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      positions[i3] =
        basePositions[i3] +
        Math.sin(time * 0.3 + i * 0.5) * 0.4 +
        velocities[i3] * time * 10
      positions[i3 + 1] =
        basePositions[i3 + 1] +
        Math.cos(time * 0.25 + i * 0.3) * 0.3 +
        velocities[i3 + 1] * time * 10
      positions[i3 + 2] =
        basePositions[i3 + 2] +
        Math.sin(time * 0.2 + i * 0.7) * 0.35 +
        velocities[i3 + 2] * time * 10
    }

    posAttr.needsUpdate = true

    const linePosAttr = lineGeo.getAttribute('position') as THREE.BufferAttribute
    const lineColAttr = lineGeo.getAttribute('color') as THREE.BufferAttribute
    const linePositions = linePosAttr.array as Float32Array
    const lineColors = lineColAttr.array as Float32Array

    let lineIdx = 0
    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; j++) {
        const i3 = i * 3
        const j3 = j * 3
        const dx = positions[i3] - positions[j3]
        const dy = positions[i3 + 1] - positions[j3 + 1]
        const dz = positions[i3 + 2] - positions[j3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.08
          const li = lineIdx * 6

          linePositions[li] = positions[i3]
          linePositions[li + 1] = positions[i3 + 1]
          linePositions[li + 2] = positions[i3 + 2]
          linePositions[li + 3] = positions[j3]
          linePositions[li + 4] = positions[j3 + 1]
          linePositions[li + 5] = positions[j3 + 2]

          lineColors[li] = purple.r * opacity
          lineColors[li + 1] = purple.g * opacity
          lineColors[li + 2] = purple.b * opacity
          lineColors[li + 3] = cyan.r * opacity
          lineColors[li + 4] = cyan.g * opacity
          lineColors[li + 5] = cyan.b * opacity

          lineIdx++
        }
      }
    }

    lineGeo.setDrawRange(0, lineIdx * 2)
    linePosAttr.needsUpdate = true
    lineColAttr.needsUpdate = true
  })

  return (
    <>
      <points ref={pointsRef} geometry={particleGeo}>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  )
}

const NeuralCanvas: FC = () => {
  const THREE = require('three')
  const { Canvas } = require('@react-three/fiber')
  const { AdditiveBlending } = THREE

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ParticlesInner />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default function NeuralBackground() {
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkWidth = () => setIsDesktop(window.innerWidth > 1024)
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  if (!mounted || !isDesktop) return null

  return <NeuralCanvas />
}
