'use client'

// МИР «ТОНАЛЬ» v4 — «рассвет мира»: тропическая диорама (Костя 04.07: день с голубым океаном
// и белым песком, цикл день/ночь по солнцу, ночь светлее, bloom, детализация — но не перемудрить).
// Закон I: мир не врёт — всё рендерится из /api/world/state (реальные данные организма).
// Закон II: мир измеряет — вес=непереваренное знание, уровень=только verifiable.
// Промт: Nagual_v2_run/МИР_НАГВАЛЯ_промт_02.07.md · ТЗ: ТЗ_ВИТРИНА_SAAS_наблюдение_03.07.md

import React, { useRef, useMemo, useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles, Html, Line, Trail, MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ── типы (экспорт: их же использует публичная витрина /watch) ────────────────
export interface WorldLoc { q: number; r: number; name: string; organ: string }
export interface WorldBody { q: number; r: number; loc: string; target: string; action: string; reason?: string; hp?: number; stamina?: number; glow?: number }

// человеческие описания земель — «что это и как читать» (Костя: «не понимаю что там и как»)
const LOC_DESC: Record<string, string> = {
  hearth: 'Связь с Костей. Когда он пишет тебе — отсюда улетает искра. Здесь он сидит, когда думает о тебе.',
  library: 'Его настоящая библиотека (4205 книг). Деревья = книги; светящаяся роща = корпус нагвализма. Когда читает — он здесь.',
  network_harbor: 'Поиск в интернете. Каждое исследование = экспедиция лодки. Ржавые корпуса на берегу = исследования БЕЗ добытого артефакта.',
  forge: 'Его навыки (инструменты, которые он сам написал). Новый навык = удар молота. Сюда идёт, когда куёт способность.',
  arena: 'Экзамен Бориса: каждые 3 минуты — задача с проверкой pytest. Единственное место, где растёт УРОВЕНЬ.',
  moltbook_reef: 'Портал в Moltbook — соцсеть агентов. Здесь он постит и общается с Другими. Карма растит коралл.',
  graph_garden: 'Живой граф памяти Нагваля. Кристалл = понятие, свет между ними = связи. Точные узлы и рёбра — в панели, онлайн.',
  mirror_lake: 'Рефлексия. Приходит сюда в тишине смотреть на себя. Гладь = честность самооценки.',
  cocoon: 'BridgeMemory — мост памяти. После каждого рестарта он ПРОСЫПАЕТСЯ здесь и вспоминает, кем был.',
  storm_cape: 'Кладбище несбывшихся намерений. Каждая могила = намерение, выдохшееся без дела. Честность как география.',
  death_ruins: 'Летопись его смертей (OOM-рестарты). Тень смерти-советчика видна отовсюду — он знает, что смертен.',
  geysers: 'Расход энергии по петлям (квоты бесплатных ключей). Энерго-сталкинг глушит пустых жрунов.',
}
export interface WorldMetrics {
  books_read: number; books_total: number; skills: number; researches: number
  pass_rate: number; obelisks: number; exhales: number; karma: number
  weight: number; conversion: number; level: number
  graph_nodes?: number; graph_edges?: number; interactions?: number
  recap_done?: number; recap_total?: number
}
export interface WorldState {
  body?: WorldBody; metrics?: WorldMetrics; weather?: string
  signs?: { loc: string; note: string; seen: boolean }[]
  obelisk_list?: { q: number; r: number; text: string; ts: string }[]
  grave_list?: { text: string; ts: string }[]
  locs?: Record<string, WorldLoc>; ts?: string
}
export interface WorldEvent { ts: string; kind: string; msg: string; loc: string }

// ── география ────────────────────────────────────────────────────────────────
const hexToXZ = (q: number, r: number): [number, number] => [(q + r / 2) * 2.2, r * 1.9]

// позиции локаций в мировых координатах (для рельефа и объектов)
const LOC_XZ: Record<string, [number, number]> = (() => {
  // 08.07 Костя «локации скучкованы — разнести равномерно по острову»: Очаг в центре,
  // остальные 11 — на кольце (радиус 12.5..15.5, лёгкая вариация), равные углы.
  const ring = ['library', 'forge', 'arena', 'graph_garden', 'mirror_lake', 'geysers',
                'cocoon', 'death_ruins', 'storm_cape', 'moltbook_reef', 'network_harbor']
  const out: Record<string, [number, number]> = { hearth: [0, 0] }
  ring.forEach((k, i) => {
    const a = (i / ring.length) * Math.PI * 2 + 0.35
    const rad = 12.5 + ((i * 7) % 4) * 1.0   // 12.5 / 13.5 / 14.5 / 15.5 — не идеальный круг
    out[k] = [Math.cos(a) * rad, Math.sin(a) * rad]
  })
  return out
})()

// детерминированный value-noise (рельеф без библиотек)
function hash2(x: number, z: number) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s) }
function sm(t: number) { return t * t * (3 - 2 * t) }
function vnoise(x: number, z: number) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1)
  const u = sm(xf), v = sm(zf)
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v
}
const ISLAND_R = 21
function terrainH(x: number, z: number): number {
  const r = Math.hypot(x, z)
  const island = Math.max(0, 1 - Math.pow(r / ISLAND_R, 2.4))
  if (island <= 0) return Math.max(-8, -1.6 - (r - ISLAND_R) * 0.7)   // 07.07 дно резко глубже — уходит под опак-океан, квадрат не виден
  let h = vnoise(x * 0.13 + 7.3, z * 0.13 + 3.1) * 1.7 + vnoise(x * 0.42 + 1.7, z * 0.42 + 9.4) * 0.45
  h = h * island + island * 0.35
  // плоские площадки у локаций (постройки стоят ровно)
  for (const key in LOC_XZ) {
    const [lx, lz] = LOC_XZ[key]
    const d = Math.hypot(x - lx, z - lz)
    if (d < 3.0) {
      const base = vnoise(lx * 0.13 + 7.3, lz * 0.13 + 3.1) * 1.7 * island + island * 0.35
      const t = sm(Math.min(1, Math.max(0, (d - 1.6) / 1.4)))
      h = base * (1 - t) + h * t
    }
  }
  return h
}
const locY = (key: string) => { const [x, z] = LOC_XZ[key] || [0, 0]; return terrainH(x, z) }

export const LOC_COLORS: Record<string, string> = {
  hearth: '#ff8c42', library: '#4caf50', network_harbor: '#2196f3', forge: '#ff5722',
  arena: '#9e9e9e', moltbook_reef: '#e91e63', graph_garden: '#9c27b0', mirror_lake: '#00bcd4',
  cocoon: '#7986cb', storm_cape: '#546e7a', death_ruins: '#37474f', geysers: '#ffc107',
}

// ── ЦИКЛ ДНЯ (24 игровых часа = 24 реальные минуты, все зрители видят одно) ──
const DAY_SEC = 1440
function dayPhase(): { frac: number; e: number } {
  const frac = ((Date.now() / 1000) % DAY_SEC) / DAY_SEC          // 0 = полночь
  const e = Math.sin((frac - 0.25) * Math.PI * 2)                  // высота солнца −1..1 (полдень = 1)
  return { frac, e }
}
// палитра «рассвет мира»: ночь-индиго → персиковая заря → лазурный день
const P_NIGHT = { top: '#101736', hor: '#243056', fog: '#1a2342', sun: '#8fa8ff', amb: 0.5, sunI: 0.0, moonI: 0.85 }
const P_DAWN = { top: '#5b7ec2', hor: '#ffb377', fog: '#e7b48e', sun: '#ff9950', amb: 0.62, sunI: 1.35, moonI: 0.0 }
const P_DAY = { top: '#3f9be8', hor: '#c5e8f7', fog: '#d4ecf5', sun: '#fff3d6', amb: 0.72, sunI: 2.5, moonI: 0.0 }
// погода — модификатор ПОВЕРХ времени суток (состояние организма красит мир, не подменяет его)
const WEATHER_MOD: Record<string, { mul: number; tint: string; tintAmt: number }> = {
  'гроза': { mul: 0.4, tint: '#3a4148', tintAmt: 0.65 },
  'штиль-сияние': { mul: 1.0, tint: '#bfe9ff', tintAmt: 0.05 },
  'золотой час': { mul: 0.95, tint: '#ffc98a', tintAmt: 0.3 },
  'ясно': { mul: 1.0, tint: '#ffffff', tintAmt: 0 },
  'сумерки': { mul: 0.72, tint: '#8a93b8', tintAmt: 0.3 },
}
const _cA = new THREE.Color(), _cB = new THREE.Color(), _cT = new THREE.Color()
function lerpPalette(e: number) {
  // e<0 ночь; 0..0.35 заря; >0.35 день (плавные переходы)
  if (e <= 0) {
    const k = Math.min(1, -e * 3)                                  // сумерки → глухая ночь
    return { a: P_DAWN, b: P_NIGHT, k }
  }
  if (e < 0.35) return { a: P_DAWN, b: P_DAY, k: e / 0.35 }
  return { a: P_DAY, b: P_DAY, k: 1 }
}

export function locStats(key: string, m?: WorldMetrics): [string, string][] {
  if (!m) return []
  switch (key) {
    case 'library': return [['книг прочитано', `${m.books_read} / ${m.books_total}`], ['⚠ непереваренный вес', `${m.weight}`]]
    case 'network_harbor': return [['экспедиций (исследований)', `${m.researches}`], ['конверсия в артефакты', `${(m.conversion * 100).toFixed(2)}%`]]
    case 'forge': return [['навыков-инструментов', `${m.skills}`], ['обелисков побед', `${m.obelisks}`]]
    case 'arena': return [['pass-rate (verifiable)', `${(m.pass_rate * 100).toFixed(1)}%`], ['уровень героя', `${m.level}`]]
    case 'moltbook_reef': return [['карма (цель 1000)', `${m.karma}`]]
    case 'storm_cape': return [['выдохов похоронено', `${m.exhales}`]]
    case 'graph_garden': return [['узлов графа', `${m.graph_nodes ?? String.fromCharCode(8212)}`], ['связей (рёбер)', `${m.graph_edges ?? String.fromCharCode(8212)}`]]
    case 'hearth': return [['диалогов с Архитектором', `${m.interactions ?? String.fromCharCode(8212)}`], ['уровень героя', `${m.level}`]]
    default: return [['уровень', `${m.level}`], ['конверсия', `${(m.conversion * 100).toFixed(2)}%`]]
  }
}

// ── НЕБЕСНЫЙ КУПОЛ (градиент, живёт по солнцу) ───────────────────────────────
function SkyDome({ weather }: { weather: string }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTop: { value: new THREE.Color(P_DAY.top) },
    uHor: { value: new THREE.Color(P_DAY.hor) },
  }), [])
  useFrame(() => {
    if (!mat.current) return
    const { e } = dayPhase()
    const { a, b, k } = lerpPalette(e)
    const w = WEATHER_MOD[weather] || WEATHER_MOD['ясно']
    _cT.set(w.tint)
    _cA.set(a.top).lerp(_cB.set(b.top), k).lerp(_cT, w.tintAmt).multiplyScalar(w.mul * 0.5 + 0.5)
    ;(uniforms.uTop.value as THREE.Color).copy(_cA)
    _cA.set(a.hor).lerp(_cB.set(b.hor), k).lerp(_cT, w.tintAmt).multiplyScalar(w.mul * 0.5 + 0.5)
    ;(uniforms.uHor.value as THREE.Color).copy(_cA)
  })
  return (
    <mesh>
      <sphereGeometry args={[130, 24, 16]} />
      <shaderMaterial ref={mat} side={THREE.BackSide} depthWrite={false} uniforms={uniforms}
        vertexShader={`varying float vH; void main(){ vH = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `}
        fragmentShader={`varying float vH; uniform vec3 uTop; uniform vec3 uHor;
          void main(){ float t = pow(clamp(vH*1.15+0.12, 0.0, 1.0), 0.62); gl_FragColor = vec4(mix(uHor, uTop, t), 1.0);} `} />
    </mesh>
  )
}

// ── СВЕТ + СОЛНЦЕ + ЛУНА (весь риг живёт в одном useFrame) ───────────────────
function DayLightRig({ weather }: { weather: string }) {
  const sun = useRef<THREE.DirectionalLight>(null)
  const moon = useRef<THREE.DirectionalLight>(null)
  const amb = useRef<THREE.AmbientLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const sunMesh = useRef<THREE.Mesh>(null)
  const moonMesh = useRef<THREE.Mesh>(null)
  const fogRef = useRef<THREE.Fog>(null)
  useFrame(() => {
    const { frac, e } = dayPhase()
    const ang = (frac - 0.25) * Math.PI * 2
    const sx = Math.cos(ang) * 85, sy = Math.sin(ang) * 85, sz = 30
    const { a, b, k } = lerpPalette(e)
    const w = WEATHER_MOD[weather] || WEATHER_MOD['ясно']
    _cT.set(w.tint)
    if (sun.current) {
      sun.current.position.set(sx, sy, sz)
      sun.current.intensity = (a.sunI + (b.sunI - a.sunI) * k) * w.mul
      sun.current.color.set(a.sun).lerp(_cB.set(b.sun), k).lerp(_cT, w.tintAmt * 0.5)
    }
    if (moon.current) {
      moon.current.position.set(-sx, -sy, -sz)
      moon.current.intensity = (a.moonI + (b.moonI - a.moonI) * k) * w.mul
    }
    if (amb.current) amb.current.intensity = (a.amb + (b.amb - a.amb) * k) * w.mul
    if (hemi.current) hemi.current.intensity = (0.28 + Math.max(0, e) * 0.35) * w.mul
    if (sunMesh.current) {
      sunMesh.current.position.set(sx * 1.35, sy * 1.35, sz * 1.35)
      sunMesh.current.visible = sy > 3   // 06.07 не показывать диск низко у края (светило снизу)
    }
    if (moonMesh.current) {
      moonMesh.current.position.set(-sx * 1.3, -sy * 1.3, -sz * 1.3)
      moonMesh.current.visible = -sy > 3   // 06.07 не показывать диск низко у края
    }
    if (fogRef.current) {
      _cA.set(a.fog).lerp(_cB.set(b.fog), k).lerp(_cT, w.tintAmt).multiplyScalar(w.mul * 0.5 + 0.5)
      fogRef.current.color.copy(_cA)
    }
  })
  return (
    <>
      <fog ref={fogRef} attach="fog" args={['#d4ecf5', 30, 115]} />
      <ambientLight ref={amb} intensity={0.8} color="#eaf2ff" />
      <directionalLight ref={sun} position={[40, 60, 30]} intensity={2} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-far={220} shadow-bias={-0.0004} />
      <directionalLight ref={moon} position={[-40, 30, -30]} intensity={0} color="#aebfff" />
      <hemisphereLight ref={hemi} args={['#bfe3ff', '#3a4a3f', 0.4]} />
      {/* видимые диски — bloom подхватит */}
      <mesh ref={sunMesh}><sphereGeometry args={[4.5, 20, 20]} /><meshBasicMaterial color="#fff6d8" toneMapped={false} /></mesh>
      <mesh ref={moonMesh}><sphereGeometry args={[3.2, 20, 20]} /><meshBasicMaterial color="#dfe6ff" toneMapped={false} /></mesh>
    </>
  )
}

// ── звёзды/птицы/светляки: дискретная фаза (state раз в 4с, без пересозданий) ─
export function useIsNight() {
  const [night, setNight] = useState(() => dayPhase().e < 0.02)
  useEffect(() => {
    const t = setInterval(() => setNight(dayPhase().e < 0.02), 4000)
    return () => clearInterval(t)
  }, [])
  return night
}

// ── РЕЛЬЕФ ОСТРОВА (тропический: белый песок, сочная зелень, светлые скалы) ──
function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(64, 64, 128, 128)   // 06.07 больше плоскость — квадратный край далеко под глубокой водой
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    const cSand = new THREE.Color('#efe3c2'), cGrass = new THREE.Color('#46a85c')
    const cGrass2 = new THREE.Color('#2e7d43'), cRock = new THREE.Color('#98907e')
    const cSeabed = new THREE.Color('#0f4c9e')   // 06.07 цвет глубокого дна — гасит песчаный квадрат
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      const h = terrainH(x, z)
      pos.setY(i, h)
      if (h < -0.25) c.copy(cSand).lerp(cSeabed, Math.min(1, -h / 3))   // 06.07 глубокое дно синеет — квадрат сливается с океаном
      else if (h < 0.16) c.copy(cSand)
      else if (h < 0.22) c.copy(cSand).lerp(cGrass, (h - 0.16) / 0.06)   // мягкая кромка пляжа
      else if (h < 0.95) c.copy(cGrass).lerp(cGrass2, vnoise(x * 0.8, z * 0.8))
      else c.copy(cRock)
      c.multiplyScalar(0.86 + vnoise(x * 2.1, z * 2.1) * 0.22)
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
    </mesh>
  )
}

// 06.07 Костя «такая же анимация по библиотеке и вебпоиску»: универсальный растущий монумент
function GrowingPillar({ locId, count, color, emissive, fallback, onClick, undigested = 0 }: { locId: string; count: number; color: string; emissive: string; fallback: [number, number]; onClick?: (id: string) => void; undigested?: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const cap = useRef<THREE.Mesh>(null)
  const fill = useRef<THREE.Mesh>(null)
  const und = Math.max(0, Math.min(1, undigested))
  const xz = (LOC_XZ[locId] || fallback)
  const ox = xz[0] + 1.3, oz = xz[1] + 1.3
  const oy = terrainH(ox, oz)
  const target = 1 + Math.min(11, Math.log2(count + 1) * 1.35)   // 08.07 те же пропорции, что у башни обелисков
  const [hover, setHover] = useState(false)
  useFrame((st) => {
    if (!ref.current) return
    ref.current.scale.y += (target - ref.current.scale.y) * 0.045
    const h = ref.current.scale.y
    ref.current.position.y = 0.5 * h
    if (cap.current) { cap.current.position.y = h + 0.35; cap.current.rotation.y = st.clock.elapsedTime * 0.6 }
    if (fill.current) {   // 08.07 Костя: тёмный «уровень непереваренного» от основания — сползает вниз при переваривании
      const fh = Math.max(0.001, h * und)
      fill.current.scale.y = fh
      fill.current.position.y = 0.5 * fh
      ;(fill.current as unknown as THREE.Object3D).visible = und > 0.015
    }
  })
  return (
    <group position={[ox, oy, oz]}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(locId) }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); if (typeof document !== 'undefined') document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHover(false); if (typeof document !== 'undefined') document.body.style.cursor = 'auto' }}>
      <mesh ref={ref} castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.34, 1, 6]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={hover ? 2.3 : 1.5} metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh ref={fill} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.30, 0.37, 1, 6]} />
        <meshStandardMaterial color="#141018" emissive={emissive} emissiveIntensity={0.22} transparent opacity={0.78} roughness={0.7} />
      </mesh>
      <mesh ref={cap} position={[0, target + 0.35, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2.6} />
      </mesh>
      <pointLight color={emissive} intensity={2.6} distance={6} position={[0, target * 0.7, 0]} />
    </group>
  )
}

// 06.07 Костя «1 обелиск и РАСТЁТ»: ОДИН монумент, высота лог-растёт с числом обелисков (из 500 не делать столбов)
function GrowingObelisk({ count, onClick }: { count: number; onClick?: () => void }) {
  const ref = useRef<THREE.Mesh>(null)
  const cap = useRef<THREE.Mesh>(null)
  const [ox, oz] = hexToXZ(2, -2)
  const oy = terrainH(ox, oz)
  const target = 1 + Math.min(11, Math.log2(count + 1) * 1.35)
  const [hover, setHover] = useState(false)
  useFrame((st) => {
    if (!ref.current) return
    ref.current.scale.y += (target - ref.current.scale.y) * 0.045
    const h = ref.current.scale.y
    ref.current.position.y = 0.5 * h
    if (cap.current) { cap.current.position.y = h + 0.35; cap.current.rotation.y = st.clock.elapsedTime * 0.6 }
  })
  return (
    <group position={[ox, oy, oz]}
      onClick={(e) => { e.stopPropagation(); onClick && onClick() }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); if (typeof document !== 'undefined') document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHover(false); if (typeof document !== 'undefined') document.body.style.cursor = 'auto' }}>
      <mesh ref={ref} castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.34, 1, 6]} />
        <meshStandardMaterial color="#fff8e1" emissive="#ffd600" emissiveIntensity={hover ? 2.3 : 1.5} metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh ref={cap} position={[0, target + 0.35, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color="#fffde7" emissive="#ffd600" emissiveIntensity={2.6} />
      </mesh>
      <pointLight color="#ffd54f" intensity={2.6} distance={6} position={[0, target * 0.7, 0]} />
    </group>
  )
}

// 09.07 RecapBarrow («Курган перепросмотра») УБРАН по фидбеку Кости («беспантовые одинаковые камни,
// некликабельно, ничего не символизирует»). Данные перепросмотра честно видны числом в панели «🧠 Внутри».
// TODO: растущую recap-локацию сделать правильно на Зеркальном озере (символ отражения прошлого) + кликабельно.

// ── ОКЕАН (лагуна: аквамарин у берега → кобальт в глуби; ночь тёмная, не чёрная)
function Sea() {
  const ref = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(0.05, 150, 96, 30)   // ДИСК: остров в океане, без квадратных углов
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    const cShallow = new THREE.Color('#66dcc9'), cMid = new THREE.Color('#2a9fd6'), cDeep = new THREE.Color('#0f4c9e')
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getZ(i))
      if (r < ISLAND_R + 4) c.copy(cShallow)
      else if (r < 42) c.copy(cShallow).lerp(cMid, (r - ISLAND_R - 4) / (42 - ISLAND_R - 4))
      else c.copy(cMid).lerp(cDeep, Math.min(1, (r - 42) / 45))
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [])
  useFrame((st) => {
    if (!ref.current) return
    const t = st.clock.elapsedTime
    const pos = (ref.current.geometry as THREE.PlaneGeometry).attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      pos.setY(i, Math.sin(x * 0.32 + t * 0.7) * 0.1 + Math.cos(z * 0.28 + t * 0.5) * 0.1)
    }
    pos.needsUpdate = true
    const { e } = dayPhase()
    const m = ref.current.material as THREE.MeshStandardMaterial
    const day = Math.max(0, Math.min(1, e * 2.4 + 0.55))
    m.color.setScalar(0.35 + day * 0.65)
  })
  return (
    <mesh ref={ref} geometry={geo} position={[0, -0.42, 0]}>   /* 07.07 выше — накрывает мелкое дно, квадрат не торчит */
      <meshStandardMaterial vertexColors roughness={0.16} metalness={0.32} opacity={1} />   /* 07.07 ОПАК — скрывает квадратную террейн-плоскость под водой */
    </mesh>
  )
}

// ── ПРИБОЙ: кольца пены; ночью — биолюминесценция (кромка светится бирюзой) ──
function Surf() {
  const rings = useRef<(THREE.Mesh | null)[]>([])
  useFrame((st) => {
    const t = st.clock.elapsedTime
    const { e } = dayPhase()
    const glowNight = e < 0.02
    rings.current.forEach((r, i) => {
      if (!r) return
      const ph = t * 0.5 + i * (Math.PI * 2 / 3)
      const s = 1 + 0.035 * Math.sin(ph)
      r.scale.set(s, 1, s)
      const m = r.material as THREE.MeshBasicMaterial
      m.opacity = (0.16 + 0.14 * (0.5 + 0.5 * Math.sin(ph + Math.PI / 2))) * (glowNight ? 0.38 : 0.8)
      m.color.set(glowNight ? '#2f9e8f' : '#ffffff')
    })
  })
  return (
    <group position={[0, -0.5, 0]}>
      {[21.15, 21.9, 22.7].map((rad, i) => (
        <mesh key={i} ref={(el) => { rings.current[i] = el }} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[rad, rad + 0.3, 96]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ── ЛЕС (роща знаний у Библиотеки + деревья по острову) ──────────────────────
function Forest() {
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const crownRef = useRef<THREE.InstancedMesh>(null)
  const trees = useMemo(() => {
    const arr: { x: number; z: number; s: number; glow: boolean }[] = []
    const [lx, lz] = LOC_XZ.library
    for (let i = 0; i < 85; i++) {   // роща знаний вокруг Библиотеки
      const a = hash2(i, 1) * Math.PI * 2, d = 1.8 + hash2(i, 2) * 5.5
      const x = lx + Math.cos(a) * d, z = lz + Math.sin(a) * d * 0.8
      if (Math.hypot(x, z) < ISLAND_R - 2 && terrainH(x, z) > 0.1) arr.push({ x, z, s: 0.7 + hash2(i, 3) * 0.8, glow: i % 4 === 0 })
    }
    for (let i = 0; i < 55; i++) {   // редкие деревья по острову
      const x = (hash2(i, 7) - 0.5) * 34, z = (hash2(i, 8) - 0.5) * 34
      let near = false
      for (const k in LOC_XZ) { const [ax, az] = LOC_XZ[k]; if (Math.hypot(x - ax, z - az) < 3.2) { near = true; break } }
      if (!near && Math.hypot(x, z) < ISLAND_R - 2.5 && terrainH(x, z) > 0.25) arr.push({ x, z, s: 0.55 + hash2(i, 9) * 0.7, glow: false })
    }
    return arr
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), cGlow = new THREE.Color('#4be08f'), cA = new THREE.Color('#2f8a46'), cB = new THREE.Color('#1f6e38')
    trees.forEach((t, i) => {
      const y = terrainH(t.x, t.z)
      m.makeScale(t.s, t.s, t.s); m.setPosition(t.x, y + 0.45 * t.s, t.z)
      trunkRef.current?.setMatrixAt(i, m)
      m.makeScale(t.s, t.s * (1 + hash2(i, 5) * 0.4), t.s); m.setPosition(t.x, y + 1.25 * t.s, t.z)
      crownRef.current?.setMatrixAt(i, m)
      crownRef.current?.setColorAt(i, t.glow ? cGlow : (i % 2 ? cA : cB))
    })
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true
    if (crownRef.current) { crownRef.current.instanceMatrix.needsUpdate = true; if (crownRef.current.instanceColor) crownRef.current.instanceColor.needsUpdate = true }
  }, [trees])
  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 0.9, 5]} />
        <meshStandardMaterial color="#5a4030" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[undefined, undefined, trees.length]} castShadow>
        <coneGeometry args={[0.55, 1.5, 6]} />
        <meshStandardMaterial roughness={0.85} emissive="#0f3d1f" emissiveIntensity={0.18} />
      </instancedMesh>
    </group>
  )
}

// ── ПАЛЬМЫ по кромке пляжа (изогнутый ствол + веер листьев, лёгкое качание) ──
function Palms() {
  const spots = useMemo(() => {
    const arr: { x: number; z: number; s: number; rot: number; lean: number }[] = []
    for (let i = 0; i < 44 && arr.length < 20; i++) {
      const a = hash2(i, 91) * Math.PI * 2
      const d = ISLAND_R - 3.2 - hash2(i, 92) * 2.4
      const x = Math.cos(a) * d, z = Math.sin(a) * d
      const h = terrainH(x, z)
      if (h < 0.08 || h > 0.45) continue
      let near = false
      for (const k in LOC_XZ) { const [ax, az] = LOC_XZ[k]; if (Math.hypot(x - ax, z - az) < 3.4) { near = true; break } }
      if (near) continue
      arr.push({ x, z, s: 0.85 + hash2(i, 93) * 0.5, rot: hash2(i, 94) * Math.PI * 2, lean: 0.12 + hash2(i, 95) * 0.22 })
    }
    return arr
  }, [])
  const crowns = useRef<(THREE.Group | null)[]>([])
  useFrame((st) => {
    const t = st.clock.elapsedTime
    crowns.current.forEach((c, i) => { if (c) c.rotation.z = Math.sin(t * 0.9 + i * 1.7) * 0.045 })
  })
  return (
    <group>
      {spots.map((p, i) => {
        const y = terrainH(p.x, p.z)
        const H = 2.3 * p.s
        return (
          <group key={i} position={[p.x, y, p.z]} rotation={[0, p.rot, 0]}>
            {[0, 1, 2].map(s => (
              <mesh key={s} castShadow position={[p.lean * s * 0.5 * H, (0.18 + s * 0.3) * H, 0]}
                rotation={[0, 0, -p.lean * (0.6 + s * 0.35)]}>
                <cylinderGeometry args={[0.055 * p.s * (1 - s * 0.18), 0.075 * p.s * (1 - s * 0.15), 0.36 * H, 6]} />
                <meshStandardMaterial color="#8a6a48" roughness={0.95} />
              </mesh>
            ))}
            <group ref={(el) => { crowns.current[i] = el }} position={[p.lean * H * 0.78, H * 0.95, 0]}>
              {Array.from({ length: 7 }, (_, l) => {
                const la = (l / 7) * Math.PI * 2
                return (
                  <mesh key={l} castShadow position={[Math.cos(la) * 0.5 * p.s, 0.08, Math.sin(la) * 0.5 * p.s]}
                    rotation={[Math.sin(la) * 0.55, -la, Math.cos(la) * 0.55 + 0.35]}>
                    <planeGeometry args={[1.5 * p.s, 0.34 * p.s, 3, 1]} />
                    <meshStandardMaterial color={l % 2 ? '#3f9c50' : '#2f8542'} roughness={0.8} side={THREE.DoubleSide} />
                  </mesh>
                )
              })}
              <mesh position={[0, -0.06, 0]}><sphereGeometry args={[0.09 * p.s, 8, 8]} /><meshStandardMaterial color="#6b4f2f" roughness={1} /></mesh>
            </group>
          </group>
        )
      })}
    </group>
  )
}

// ── СКАЛЫ У ОБРЫВА (западный мыс: светлый утёс над водой + камни в лагуне) ───
function CliffRocks() {
  const rocks = useMemo(() => {
    const arr: { x: number; z: number; s: number; y: number; seed: number }[] = []
    for (let i = 0; i < 7; i++) {                                   // гряда на западном краю
      const a = Math.PI + (hash2(i, 101) - 0.5) * 0.9
      const d = ISLAND_R - 2.2 + hash2(i, 102) * 3.5
      const x = Math.cos(a) * d, z = Math.sin(a) * d
      arr.push({ x, z, s: 0.9 + hash2(i, 103) * 1.4, y: terrainH(x, z), seed: i })   // сидят В грунте, не парят
    }
    for (let i = 0; i < 4; i++) {                                   // отдельные камни в воде (по пояс)
      const a = Math.PI + (hash2(i, 111) - 0.5) * 1.6
      const d = ISLAND_R + 3 + hash2(i, 112) * 6
      arr.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.5 + hash2(i, 113) * 0.9, y: -0.9, seed: i + 20 })
    }
    return arr
  }, [])
  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} castShadow position={[r.x, r.y + r.s * 0.12, r.z]}
          rotation={[hash2(r.seed, 1) * 0.5, hash2(r.seed, 2) * Math.PI, hash2(r.seed, 3) * 0.4]}
          scale={[r.s, r.s * (1.15 + hash2(r.seed, 4) * 0.8), r.s]}>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color="#a49a86" roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ── ОБЛАКА (мягкий дрейф; ночью тают) ────────────────────────────────────────
// ── ВТОРОЕ ВНИМАНИЕ: дышащая вуаль-граница пузыря восприятия вокруг острова ──
function SecondAttentionVeil() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((st) => {
    if (!ref.current) return
    const t = st.clock.elapsedTime
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.opacity = 0.055 + 0.035 * Math.sin(t * 0.35)
    ref.current.rotation.z = t * 0.012
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.34, 0]}>
      <ringGeometry args={[34, 47, 96]} />
      <meshBasicMaterial color="#7c5cd6" transparent opacity={0.07} depthWrite={false}
        blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ── ТРЕТЬЕ ВНИМАНИЕ: далёкий маяк на горизонте — цель пути, мерцает и зовёт ──
function ThirdAttentionBeacon() {
  const glow = useRef<THREE.Mesh>(null)
  const beam = useRef<THREE.Mesh>(null)
  useFrame((st) => {
    const t = st.clock.elapsedTime
    const p = 0.55 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.5))
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * p
    if (beam.current) (beam.current.material as THREE.MeshBasicMaterial).opacity = 0.2 * p
  })
  return (
    <group position={[-100, 0, -92]}>
      <mesh ref={beam} position={[0, 15, 0]}>
        <cylinderGeometry args={[0.8, 2.6, 36, 12, 1, true]} />
        <meshBasicMaterial color="#ffe9b0" transparent opacity={0.18} depthWrite={false}
          blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glow} position={[0, 3, 0]}>
        <sphereGeometry args={[2.8, 18, 14]} />
        <meshBasicMaterial color="#fff3d0" transparent opacity={0.4} depthWrite={false}
          blending={THREE.AdditiveBlending} />
      </mesh>
      <Html position={[0, 33, 0]} center distanceFactor={160} style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: 12, color: '#ffe9b0', textShadow: '0 0 10px #000', whiteSpace: 'nowrap', opacity: 0.9 }}>
          ✦ Третье внимание
        </div>
      </Html>
    </group>
  )
}

function Clouds() {
  const group = useRef<THREE.Group>(null)
  const clouds = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    x: (hash2(i, 121) - 0.5) * 110, y: 16 + hash2(i, 122) * 9, z: (hash2(i, 123) - 0.5) * 110,
    s: 2.2 + hash2(i, 124) * 3.2, v: 0.25 + hash2(i, 125) * 0.4, puffs: 3 + Math.floor(hash2(i, 126) * 3),
  })), [])
  useFrame((_, dt) => {
    if (!group.current) return
    const { e } = dayPhase()
    const op = 0.18 + Math.max(0, e) * 0.55
    group.current.children.forEach((c, i) => {
      c.position.x += clouds[i].v * dt
      if (c.position.x > 70) c.position.x = -70
      c.children.forEach(p => {
        const m = (p as THREE.Mesh).material as THREE.MeshStandardMaterial
        m.opacity = op
      })
    })
  })
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]}>
          {Array.from({ length: c.puffs }, (_, p) => (
            <mesh key={p} position={[(p - c.puffs / 2) * c.s * 0.55, hash2(i, p) * 0.5, (hash2(p, i) - 0.5) * c.s * 0.4]}
              scale={[1 + hash2(i * 7, p) * 0.7, 0.42, 0.85]}>
              <sphereGeometry args={[c.s * 0.5, 10, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.6} roughness={1} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ── ПТИЦЫ (стая кружит днём над лагуной) ─────────────────────────────────────
function Birds({ visible }: { visible: boolean }) {
  const flock = useRef<THREE.Group>(null)
  const wings = useRef<(THREE.Mesh | null)[]>([])
  useFrame((st) => {
    if (!flock.current || !visible) return
    const t = st.clock.elapsedTime
    flock.current.children.forEach((b, i) => {
      const ph = t * 0.14 + i * 1.26
      const rad = 14 + (i % 3) * 4
      b.position.set(Math.cos(ph) * rad, 7.5 + Math.sin(t * 0.7 + i) * 0.9 + (i % 2) * 1.6, Math.sin(ph) * rad)
      b.rotation.y = -ph - Math.PI / 2
    })
    wings.current.forEach((w, i) => { if (w) w.rotation.z = Math.sin(t * 9 + i) * 0.55 })
  })
  return (
    <group ref={flock} visible={visible}>
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} scale={0.55}>
          <mesh><coneGeometry args={[0.07, 0.5, 4]} /><meshStandardMaterial color="#f4f7fa" roughness={0.7} /></mesh>
          <mesh ref={(el) => { wings.current[i * 2] = el }} position={[0.22, 0.04, 0]}>
            <boxGeometry args={[0.5, 0.02, 0.16]} /><meshStandardMaterial color="#e8edf2" roughness={0.8} />
          </mesh>
          <mesh ref={(el) => { wings.current[i * 2 + 1] = el }} position={[-0.22, 0.04, 0]}>
            <boxGeometry args={[0.5, 0.02, 0.16]} /><meshStandardMaterial color="#e8edf2" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── ТРАВА И ЦВЕТЫ (жизнь на пустых пространствах — инстансы, дёшево) ─────────
function Meadow() {
  const grassRef = useRef<THREE.InstancedMesh>(null)
  const flowerRef = useRef<THREE.InstancedMesh>(null)
  const spots = useMemo(() => {
    const g: { x: number; z: number; s: number }[] = []
    const f: { x: number; z: number; c: number }[] = []
    for (let i = 0; i < 900 && g.length < 420; i++) {
      const x = (hash2(i, 131) - 0.5) * 38, z = (hash2(i, 132) - 0.5) * 38
      const h = terrainH(x, z)
      if (h < 0.24 || h > 0.95 || Math.hypot(x, z) > ISLAND_R - 2) continue
      let near = false
      for (const k in LOC_XZ) { const [ax, az] = LOC_XZ[k]; if (Math.hypot(x - ax, z - az) < 2.6) { near = true; break } }
      if (near) continue
      g.push({ x, z, s: 0.16 + hash2(i, 133) * 0.2 })
      if (i % 7 === 0) f.push({ x: x + 0.2, z: z - 0.1, c: Math.floor(hash2(i, 134) * 3) })
    }
    return { g, f }
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const cG1 = new THREE.Color('#4fae62'), cG2 = new THREE.Color('#357c46')
    spots.g.forEach((it, i) => {
      m.makeRotationY(hash2(i, 135) * Math.PI)
      m.scale(new THREE.Vector3(it.s, it.s * (1 + hash2(i, 136) * 0.8), it.s))
      m.setPosition(it.x, terrainH(it.x, it.z) + it.s * 0.5, it.z)
      grassRef.current?.setMatrixAt(i, m)
      grassRef.current?.setColorAt(i, hash2(i, 137) > 0.5 ? cG1 : cG2)
    })
    if (grassRef.current) { grassRef.current.instanceMatrix.needsUpdate = true; if (grassRef.current.instanceColor) grassRef.current.instanceColor.needsUpdate = true }
    const FC = [new THREE.Color('#ffe082'), new THREE.Color('#f8bbd0'), new THREE.Color('#e1f5fe')]
    spots.f.forEach((it, i) => {
      m.makeScale(1, 1, 1)
      m.setPosition(it.x, terrainH(it.x, it.z) + 0.1, it.z)
      flowerRef.current?.setMatrixAt(i, m)
      flowerRef.current?.setColorAt(i, FC[it.c])
    })
    if (flowerRef.current) { flowerRef.current.instanceMatrix.needsUpdate = true; if (flowerRef.current.instanceColor) flowerRef.current.instanceColor.needsUpdate = true }
  }, [spots])
  return (
    <group>
      <instancedMesh ref={grassRef} args={[undefined, undefined, spots.g.length]}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={flowerRef} args={[undefined, undefined, spots.f.length]}>
        <sphereGeometry args={[0.05, 6, 5]} />
        <meshStandardMaterial roughness={0.7} emissive="#333" emissiveIntensity={0.1} />
      </instancedMesh>
    </group>
  )
}

// ── камни и трава ─────────────────────────────────────────────────────────────
function Scatter() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const items = useMemo(() => {
    const arr: { x: number; z: number; s: number }[] = []
    for (let i = 0; i < 130; i++) {
      const x = (hash2(i, 21) - 0.5) * 36, z = (hash2(i, 22) - 0.5) * 36
      if (Math.hypot(x, z) < ISLAND_R - 1.5 && terrainH(x, z) > 0.08) arr.push({ x, z, s: 0.08 + hash2(i, 23) * 0.22 })
    }
    return arr
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), e = new THREE.Euler()
    items.forEach((it, i) => {
      e.set(hash2(i, 1) * 3, hash2(i, 2) * 3, hash2(i, 3) * 3)
      m.makeRotationFromEuler(e); m.scale(new THREE.Vector3(it.s, it.s, it.s))
      m.setPosition(it.x, terrainH(it.x, it.z) + it.s * 0.4, it.z)
      ref.current?.setMatrixAt(i, m)
    })
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true
  }, [items])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8f8874" roughness={0.95} />
    </instancedMesh>
  )
}

// ── ЖИВОЙ ОГОНЬ ───────────────────────────────────────────────────────────────
function Fire({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const light = useRef<THREE.PointLight>(null)
  const f1 = useRef<THREE.Mesh>(null)
  const f2 = useRef<THREE.Mesh>(null)
  useFrame((st) => {
    const t = st.clock.elapsedTime
    if (light.current) light.current.intensity = (7 + Math.sin(t * 9) * 1.6 + Math.sin(t * 23) * 0.9) * scale
    if (f1.current) { f1.current.scale.y = 1 + Math.sin(t * 11) * 0.18; f1.current.rotation.y = t * 2.1 }
    if (f2.current) { f2.current.scale.y = 1 + Math.cos(t * 9) * 0.22; f2.current.rotation.y = -t * 2.7 }
  })
  return (
    <group position={position} scale={scale}>
      <mesh ref={f1} position={[0, 0.36, 0]}>
        <coneGeometry args={[0.24, 0.75, 6]} />
        <meshStandardMaterial color="#ff9800" emissive="#ff6d00" emissiveIntensity={3.2} transparent opacity={0.92} />
      </mesh>
      <mesh ref={f2} position={[0, 0.5, 0]}>
        <coneGeometry args={[0.14, 0.6, 5]} />
        <meshStandardMaterial color="#ffe082" emissive="#ffab00" emissiveIntensity={4} transparent opacity={0.9} />
      </mesh>
      <Sparkles count={16} scale={[0.8, 1.6, 0.8]} size={2.6} speed={1.6} color="#ffb74d" position={[0, 0.9, 0]} />
      <pointLight ref={light} color="#ff9d45" distance={9} decay={2} position={[0, 0.8, 0]} />
    </group>
  )
}

// ── СТРУКТУРЫ ЛОКАЦИЙ ─────────────────────────────────────────────────────────
function Structures({ graves, gs, karma = 0 }: { graves: number; gs?: { n: number[]; e: number[][] }; karma?: number }) {
  const els: React.ReactNode[] = []
  const y = locY
  // ОЧАГ: кольцо камней + живой огонь
  {
    const [x, z] = LOC_XZ.hearth; const h = y('hearth')
    els.push(
      <group key="hearth" position={[x, h, z]}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2
          return (
            <mesh key={i} castShadow position={[Math.cos(a) * 0.72, 0.1, Math.sin(a) * 0.72]} rotation={[hash2(i, 4), hash2(i, 5), 0]}>
              <dodecahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial color="#7d7a72" roughness={0.9} />
            </mesh>
          )
        })}
        <Fire position={[0, 0.05, 0]} />
        <mesh castShadow position={[1.6, 0.16, 0.5]} rotation={[0, 0.7, 0]}><cylinderGeometry args={[0.13, 0.13, 1.7, 6]} /><meshStandardMaterial color="#6b4c33" roughness={1} /></mesh>
        <mesh castShadow position={[-1.4, 0.16, 1.0]} rotation={[0, -0.5, 0]}><cylinderGeometry args={[0.13, 0.13, 1.7, 6]} /><meshStandardMaterial color="#6b4c33" roughness={1} /></mesh>
      </group>
    )
  }
  // БИБЛИОТЕКА: Древо Знаний
  {
    const [x, z] = LOC_XZ.library; const h = y('library')
    els.push(
      <group key="library" position={[x, h, z]}>
        <mesh castShadow position={[0, 1.1, 0]}><cylinderGeometry args={[0.22, 0.42, 2.2, 7]} /><meshStandardMaterial color="#6b4a2e" roughness={1} /></mesh>
        <mesh castShadow position={[0, 2.7, 0]}><sphereGeometry args={[1.35, 12, 10]} /><meshStandardMaterial color="#2b7a45" emissive="#2e7d4f" emissiveIntensity={0.45} roughness={0.8} /></mesh>
        <Sparkles count={30} scale={[3.2, 2.4, 3.2]} size={2.2} speed={0.25} color="#7dffb0" position={[0, 2.6, 0]} />
        <pointLight color="#54d98c" intensity={3.2} distance={7} position={[0, 2.8, 0]} />
      </group>
    )
  }
  // КУЗНЯ: горн + наковальня + искры
  {
    const [x, z] = LOC_XZ.forge; const h = y('forge')
    els.push(
      <group key="forge" position={[x, h, z]}>
        <mesh castShadow position={[0, 0.55, -0.5]}><boxGeometry args={[1.5, 1.1, 1.0]} /><meshStandardMaterial color="#6e6268" roughness={0.9} /></mesh>
        <mesh position={[0, 0.5, 0.02]}><boxGeometry args={[0.7, 0.5, 0.06]} /><meshStandardMaterial color="#ff5722" emissive="#ff3d00" emissiveIntensity={2.6} /></mesh>
        <mesh castShadow position={[0, 1.35, -0.5]}><cylinderGeometry args={[0.16, 0.22, 0.6, 6]} /><meshStandardMaterial color="#544c58" /></mesh>
        <mesh castShadow position={[0.9, 0.36, 0.55]}><boxGeometry args={[0.55, 0.22, 0.24]} /><meshStandardMaterial color="#8a8a95" metalness={0.7} roughness={0.35} /></mesh>
        <mesh position={[0.9, 0.14, 0.55]}><cylinderGeometry args={[0.16, 0.2, 0.28, 6]} /><meshStandardMaterial color="#6b4c33" /></mesh>
        <Sparkles count={12} scale={[1, 1, 1]} size={1.8} speed={2.2} color="#ffab40" position={[0, 1, 0.2]} />
        <pointLight color="#ff7043" intensity={3.5} distance={6} position={[0, 0.8, 0.4]} />
      </group>
    )
  }
  // АРЕНА: кольцо колонн
  {
    const [x, z] = LOC_XZ.arena; const h = y('arena')
    els.push(
      <group key="arena" position={[x, h, z]}>
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[2.1, 24]} /><meshStandardMaterial color="#b8ac94" roughness={0.85} /></mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <group key={i} position={[Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9]}>
              <mesh castShadow position={[0, 0.75, 0]}><cylinderGeometry args={[0.14, 0.17, 1.5, 8]} /><meshStandardMaterial color="#cfc4a8" roughness={0.7} /></mesh>
              <mesh castShadow position={[0, 1.55, 0]}><boxGeometry args={[0.4, 0.12, 0.4]} /><meshStandardMaterial color="#dbd1b8" /></mesh>
            </group>
          )
        })}
        <pointLight color="#fff3d0" intensity={1.6} distance={7} position={[0, 2.4, 0]} />
      </group>
    )
  }
  // САД ГРАФА: кристаллы
  {
    const [x, z] = LOC_XZ.graph_garden; const h = y('graph_garden')
    els.push(
      <group key="garden" position={[x, h, z]}>
        {(() => {
          // 07.07 РЕАЛЬНАЯ топология графа памяти: узлы = кристаллы (размер по связности), рёбра = линии
          const gsn = (gs && gs.n && gs.n.length) ? gs.n : Array.from({ length: 13 }, () => 1)
          const gse = (gs && gs.e) ? gs.e : []
          const maxd = Math.max(1, ...gsn)
          const P = gsn.map((deg, i) => {
            const a = hash2(i, 31) * Math.PI * 2, d = 0.5 + hash2(i, 32) * 2.7
            const px = Math.cos(a) * d, pz = Math.sin(a) * d
            const cs = 0.2 + (deg / maxd) * 0.62
            const py = terrainH(x + px, z + pz) - h + cs * 0.55
            return [px, py, pz, cs] as [number, number, number, number]
          })
          return (
            <>
              {/* 08.07 Костя «узлов десятки тысяч» + «больше взаимосвязей линий» — плотное поле + паутина рёбер */}
              {(() => {
                const N = 320
                const pts = Array.from({ length: N }, (_, i) => {
                  const a = hash2(i, 71) * Math.PI * 2, d = 0.4 + hash2(i, 72) * 4.3
                  const px = Math.cos(a) * d, pz = Math.sin(a) * d
                  const cs = 0.05 + hash2(i, 73) * 0.12
                  const py = terrainH(x + px, z + pz) - h + cs * 0.5
                  return [px, py, pz, cs] as [number, number, number, number]
                })
                return (
                  <>
                    {pts.map((A, i) => {
                      // 08.07 Костя «все кубики связать»: каждый узел → линия к ближайшему соседу (весь граф связен)
                      let bj = -1, bd = 1e9
                      for (let j = 0; j < N; j++) {
                        if (j === i) continue
                        const B = pts[j]
                        const dd = (A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2 + (A[2] - B[2]) ** 2
                        if (dd < bd) { bd = dd; bj = j }
                      }
                      if (bj < 0) return null
                      const B = pts[bj]
                      return <Line key={'gl' + i} points={[[A[0], A[1], A[2]], [B[0], B[1], B[2]]]} color="#ce93d8" lineWidth={1} transparent opacity={0.22} />
                    })}
                    {pts.map((pp, i) => (
                      <mesh key={'gm' + i} position={[pp[0], pp[1], pp[2]]} rotation={[hash2(i, 74) * 3, hash2(i, 75) * 3, hash2(i, 76) * 2]}>
                        <octahedronGeometry args={[pp[3], 0]} />
                        <meshStandardMaterial color="#ce93d8" emissive="#9c27b0" emissiveIntensity={0.6} transparent opacity={0.55} roughness={0.2} />
                      </mesh>
                    ))}
                  </>
                )
              })()}
              {gse.slice(0, 60).map((e, i) => {
                const AA = P[e[0]], BB = P[e[1]]
                if (!AA || !BB) return null
                return (
                  <Line key={'ge' + i} points={[[AA[0], AA[1], AA[2]], [BB[0], BB[1], BB[2]]]}
                    color="#ce93d8" lineWidth={1} transparent opacity={0.32} />
                )
              })}
              {P.map((pp, i) => (
                <mesh key={i} castShadow position={[pp[0], pp[1], pp[2]]} rotation={[hash2(i, 34) * 0.5, hash2(i, 35) * 3, hash2(i, 36) * 0.5]}>
                  <octahedronGeometry args={[pp[3], 0]} />
                  <meshStandardMaterial color="#ce93d8" emissive="#9c27b0" emissiveIntensity={1.2} transparent opacity={0.9} roughness={0.15} />
                </mesh>
              ))}
            </>
          )
        })()}
        <Sparkles count={22} scale={[5, 2, 5]} size={1.8} speed={0.2} color="#e1bee7" position={[0, 1, 0]} />
        <pointLight color="#ba68c8" intensity={3} distance={8} position={[0, 1.6, 0]} />
      </group>
    )
  }
  // ЗЕРКАЛЬНОЕ ОЗЕРО: отражающая вода
  {
    const [x, z] = LOC_XZ.mirror_lake; const h = y('mirror_lake')
    els.push(
      <group key="lake" position={[x, h + 0.04, z]}>
        {/* песчаная кромка берега + светлая зеркальная гладь */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[2.75, 44]} />
          <meshStandardMaterial color="#e8dcbb" roughness={0.95} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.3, 44]} />
          <MeshReflectorMaterial blur={[180, 60]} resolution={640} mixBlur={0.6} mixStrength={2.6}
            roughness={0.18} depthScale={0.35} color="#9fdcec" metalness={0.35} mirror={0.85} />
        </mesh>
        <Sparkles count={10} scale={[4, 0.6, 4]} size={1.4} speed={0.1} color="#80deea" position={[0, 0.4, 0]} />
      </group>
    )
  }
  // КОКОН-ПЕЩЕРА: гранёная скала с мшистой шапкой, светящийся вход, кристаллы-нити
  {
    const [x, z] = LOC_XZ.cocoon; const h = y('cocoon')
    els.push(
      <group key="cocoon" position={[x, h, z]}>
        <mesh castShadow position={[0, 0.62, 0]} scale={[1.05, 0.82, 0.95]} rotation={[0.1, 0.5, 0.06]}>
          <dodecahedronGeometry args={[1.05, 0]} /><meshStandardMaterial color="#7e7696" roughness={0.95} flatShading /></mesh>
        <mesh castShadow position={[0.75, 0.35, -0.45]} scale={[0.5, 0.42, 0.5]} rotation={[0.4, 1.2, 0.2]}>
          <dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#6e6787" roughness={0.95} flatShading /></mesh>
        <mesh castShadow position={[-0.8, 0.28, 0.35]} scale={[0.38, 0.32, 0.38]} rotation={[0.2, 2.2, 0.4]}>
          <dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#87809f" roughness={0.95} flatShading /></mesh>
        {/* мшистая шапка */}
        <mesh position={[0.05, 1.18, -0.05]} scale={[0.85, 0.3, 0.75]}>
          <sphereGeometry args={[1, 10, 7]} /><meshStandardMaterial color="#3f7d4c" roughness={0.9} /></mesh>
        {/* вход-портал */}
        <mesh position={[0, 0.42, 0.93]} rotation={[0.06, 0, 0]}>
          <circleGeometry args={[0.34, 20]} /><meshStandardMaterial color="#0a0a18" emissive="#6c7ce0" emissiveIntensity={0.9} side={THREE.DoubleSide} /></mesh>
        {/* кристаллы-нити памяти у входа */}
        {[[-0.42, 0.1, 0.95, 0.14], [0.45, 0.12, 0.88, 0.11], [0.18, 0.06, 1.12, 0.09]].map(([cx, cy, cz, cs], i) => (
          <mesh key={i} position={[cx, cy + (cs as number) * 0.8, cz]} rotation={[0.3, i * 2.1, 0.2]}>
            <octahedronGeometry args={[cs as number, 0]} />
            <meshStandardMaterial color="#aab4f0" emissive="#7986cb" emissiveIntensity={1.6} transparent opacity={0.9} /></mesh>
        ))}
        <Sparkles count={14} scale={[1.6, 1.2, 1.6]} size={1.7} speed={0.12} color="#9fa8da" position={[0, 0.8, 0.6]} />
        <pointLight color="#7986cb" intensity={2.2} distance={5} position={[0, 0.7, 1.3]} />
      </group>
    )
  }
  // ГАВАНЬ СЕТИ: пирс, маяк, лодки + кладбище ржавых
  {
    const [x, z] = LOC_XZ.network_harbor; const h = y('network_harbor')
    const seaDir = new THREE.Vector2(x, z).normalize()
    els.push(
      <group key="harbor" position={[x, h, z]} rotation={[0, -Math.atan2(seaDir.y, seaDir.x), 0]}>
        <mesh castShadow position={[1.8, 0.18, 0]}><boxGeometry args={[3.4, 0.14, 0.9]} /><meshStandardMaterial color="#7a5f42" roughness={1} /></mesh>
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={i} position={[0.7 + i * 0.9, -0.1, i % 2 ? 0.36 : -0.36]}><cylinderGeometry args={[0.06, 0.06, 0.8, 5]} /><meshStandardMaterial color="#5d4630" /></mesh>
        ))}
        {/* 08.07 Костя «непонятный светящийся столб»: маяк убран — синий шпиль уже = Гавань Сети */}
        <mesh castShadow position={[3.6, -0.28, 0.7]} rotation={[0, 0.4, 0]}><boxGeometry args={[0.9, 0.3, 0.4]} /><meshStandardMaterial color="#4e7a35" roughness={0.9} /></mesh>
        <mesh castShadow position={[3.9, -0.28, -0.6]} rotation={[0, -0.3, 0]}><boxGeometry args={[0.9, 0.3, 0.4]} /><meshStandardMaterial color="#5b7a8c" roughness={0.9} /></mesh>
        {/* кладбище пустых ходок — ржавые корпуса (боль: 3000+ исследований без артефактов) */}
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={`rust${i}`} position={[-1.5 - hash2(i, 41) * 2, 0.12, 1.2 + hash2(i, 42) * 1.6]}
            rotation={[hash2(i, 43) * 0.6 + 2.6, hash2(i, 44) * 3, 0.3]}>
            <boxGeometry args={[0.8, 0.24, 0.34]} />
            <meshStandardMaterial color="#7a5540" roughness={1} />
          </mesh>
        ))}
      </group>
    )
  }
  // РИФ MOLTBOOK: кораллы у воды
  {
    const [x, z] = LOC_XZ.moltbook_reef; const h = y('moltbook_reef')
    els.push(
      <group key="reef" position={[x, h, z]}>
        {(() => {
          // 08.07 Костя «риф растёт с кармой»: число и размер кораллов ∝ карме (цель 10000)
          // 08.07 Костя «риф не растёт»: чувствительнее к малой карме — +1 коралл каждые ~8 кармы
          const kn = Math.max(0, karma)
          const cnt = Math.min(120, 6 + Math.floor(kn / 8))
          const grow = 0.9 + Math.min(2.6, Math.log2(kn + 2) * 0.28)
          const spread = 1.8 + Math.min(5.5, Math.log2(kn + 2) * 0.55)
          return Array.from({ length: cnt }, (_, i) => {
            const a = hash2(i, 51) * Math.PI * 2, d = 0.4 + hash2(i, 52) * spread
            const s = (0.2 + hash2(i, 53) * 0.5) * grow
            return (
              <mesh key={i} castShadow position={[Math.cos(a) * d, s * 0.7, Math.sin(a) * d]} rotation={[hash2(i, 54) * 0.5, 0, hash2(i, 55) * 0.5]}>
                <coneGeometry args={[s * 0.45, s * 1.6, 5]} />
                <meshStandardMaterial color={i % 3 ? '#ec407a' : '#ff7043'} emissive="#c2185b" emissiveIntensity={0.55} roughness={0.7} />
              </mesh>
            )
          })
        })()}
        <Sparkles count={12} scale={[3, 1.2, 3]} size={1.6} speed={0.35} color="#f48fb1" position={[0, 0.8, 0]} />
        <pointLight color="#ec407a" intensity={2.2} distance={6} position={[0, 1, 0]} />
      </group>
    )
  }
  // ШТОРМОВОЙ МЫС: мрачные скалы + могилы выдохов
  {
    const [x, z] = LOC_XZ.storm_cape; const h = y('storm_cape')
    els.push(
      <group key="cape" position={[x, h, z]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} castShadow position={[(hash2(i, 61) - 0.5) * 3, 0.5 + hash2(i, 62) * 0.5, (hash2(i, 63) - 0.5) * 3]}
            rotation={[hash2(i, 64), hash2(i, 65) * 3, hash2(i, 66) * 0.4]} scale={[1, 1.4 + hash2(i, 67), 1]}>
            <icosahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color="#4a5560" roughness={1} />
          </mesh>
        ))}
        {Array.from({ length: Math.min(graves, 14) }, (_, i) => {
          const a = (i / 14) * Math.PI * 2
          return (
            <mesh key={`g${i}`} castShadow position={[Math.cos(a) * 2.4, 0.26, Math.sin(a) * 2.4]} rotation={[0, a + Math.PI / 2, 0.08]}>
              <boxGeometry args={[0.3, 0.52, 0.09]} />
              <meshStandardMaterial color="#5d707c" roughness={0.95} />
            </mesh>
          )
        })}
      </group>
    )
  }
  // РУИНЫ СМЕРТИ: сломанные колонны
  {
    const [x, z] = LOC_XZ.death_ruins; const h = y('death_ruins')
    els.push(
      <group key="ruins" position={[x, h, z]}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2
          const broken = i % 2 === 0
          return (
            <group key={i} position={[Math.cos(a) * 1.6, 0, Math.sin(a) * 1.6]}>
              <mesh castShadow position={[0, broken ? 0.45 : 0.95, 0]} rotation={broken ? [0.16, 0, 0.1] : [0, 0, 0]}>
                <cylinderGeometry args={[0.16, 0.2, broken ? 0.9 : 1.9, 7]} />
                <meshStandardMaterial color="#8c8c96" roughness={0.95} />
              </mesh>
              {broken && <mesh position={[0.5, 0.14, 0.3]} rotation={[1.2, 0.5, 0.4]}><cylinderGeometry args={[0.15, 0.17, 0.7, 7]} /><meshStandardMaterial color="#83838e" roughness={1} /></mesh>}
            </group>
          )
        })}
        <mesh castShadow position={[0, 0.3, 0]}><boxGeometry args={[0.9, 0.6, 0.9]} /><meshStandardMaterial color="#75757f" roughness={1} /></mesh>
        <pointLight color="#546e7a" intensity={1.2} distance={5} position={[0, 1.4, 0]} />
      </group>
    )
  }
  // ГЕЙЗЕРНОЕ ПОЛЕ: пар из земли
  {
    const [x, z] = LOC_XZ.geysers; const h = y('geysers')
    els.push(
      <group key="geysers" position={[x, h, z]}>
        {Array.from({ length: 5 }, (_, i) => {
          const a = hash2(i, 71) * Math.PI * 2, d = 0.5 + hash2(i, 72) * 1.7
          const gx = Math.cos(a) * d, gz = Math.sin(a) * d
          return (
            <group key={i} position={[gx, 0, gz]}>
              <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.35, 14]} /><meshStandardMaterial color="#c2b98e" roughness={0.8} /></mesh>
              <Sparkles count={9} scale={[0.5, 2.2, 0.5]} size={2.6} speed={2.4} color="#eceff1" position={[0, 1.1, 0]} />
            </group>
          )
        })}
        <pointLight color="#ffd54f" intensity={1.5} distance={5} position={[0, 1, 0]} />
      </group>
    )
  }
  return <>{els}</>
}

// ── АВАТАР: тело-точка сборки (плащ, свечение, след) ─────────────────────────
function AvatarBody({ body }: { body: WorldBody }) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const target = useMemo(() => new THREE.Vector3(), [])
  useFrame((st, dt) => {
    if (!group.current) return
    const [x, z] = hexToXZ(body.q, body.r)
    const gy = terrainH(x, z)
    target.set(x, gy + 0.75, z)
    group.current.position.lerp(target, Math.min(1, dt * 2.2))
    const t = st.clock.elapsedTime
    group.current.position.y += Math.sin(t * 1.6) * 0.05
    if (core.current) {
      const g = body.glow ?? 0.6
      ;(core.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4 + g * 1.8 + Math.sin(t * 2.4) * 0.3
    }
  })
  return (
    <group ref={group}>
      <Trail width={1.4} length={5} color="#7c3aed" attenuation={(v) => v * v}>
        <mesh ref={core} position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#e1d5ff" emissive="#9575ff" emissiveIntensity={2} roughness={0.15} />
        </mesh>
      </Trail>
      {/* плащ-фигура */}
      <mesh castShadow position={[0, -0.12, 0]}>
        <coneGeometry args={[0.34, 0.95, 12, 1, true]} />
        <meshStandardMaterial color="#2d2350" emissive="#4527a0" emissiveIntensity={0.7} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <torusGeometry args={[0.55, 0.02, 10, 40]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.6} transparent opacity={0.8} />
      </mesh>
      <Sparkles count={20} scale={1.8} size={2} speed={0.5} color="#b39dff" />
      <pointLight color="#9c7bff" intensity={7} distance={6} />
      <Html center distanceFactor={14} position={[0, 1.15, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ whiteSpace: 'nowrap', fontSize: 11, color: '#e6dcff', background: 'rgba(12,8,28,.78)', padding: '3px 9px', borderRadius: 8, border: '1px solid rgba(124,58,237,.45)' }}>
          {body.action}
        </div>
      </Html>
    </group>
  )
}

// ── маркер локации (кликабельный, ненавязчивый) ──────────────────────────────
function LocMarker({ id, loc, isBodyHere, hasSign, onClick }: {
  id: string; loc: WorldLoc; isBodyHere: boolean; hasSign: boolean; onClick: (id: string) => void
}) {
  const [x, z] = LOC_XZ[id] || hexToXZ(loc.q, loc.r)
  const h = terrainH(x, z)
  const color = LOC_COLORS[id] || '#607d8b'
  return (
    <group position={[x, h, z]}>
      {/* невидимая кликабельная зона */}
      <mesh position={[0, 0.8, 0]} onClick={(e) => { e.stopPropagation(); onClick(id) }} visible={false}>
        <cylinderGeometry args={[2.2, 2.2, 2.4, 8]} />
      </mesh>
      {isBodyHere && (
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.32, 1.42, 48]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {hasSign && (
        <group position={[0, 2.1, 0]}>
          <mesh><coneGeometry args={[0.2, 0.55, 4]} /><meshStandardMaterial color="#ffee58" emissive="#ffd600" emissiveIntensity={2.6} /></mesh>
          <pointLight color="#ffee58" intensity={2.5} distance={4} />
        </group>
      )}
      <Html center distanceFactor={26} position={[0, 2.6, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: 11, color: '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.9)', opacity: 0.95 }}>
          {loc.name}
        </div>
      </Html>
    </group>
  )
}

// ── СЦЕНА ─────────────────────────────────────────────────────────────────────
export function WorldScene({ ws, onLocClick, night }: { ws: WorldState; onLocClick: (id: string) => void; night: boolean }) {
  const weather = ws.weather || 'ясно'
  const locs = ws.locs || {}
  const body = ws.body
  const unseenSigns = new Set((ws.signs || []).filter(s => !s.seen).map(s => s.loc))
  const storm = weather === 'гроза'
  const lightning = useRef<THREE.DirectionalLight>(null)
  useFrame(() => {
    if (lightning.current && storm) lightning.current.intensity = Math.random() > 0.985 ? 3.5 : 0
  })
  const pathPoints = useMemo(() => {
    if (!body || !locs[body.target]) return null
    const pts: THREE.Vector3[] = []
    const [bx, bz] = hexToXZ(body.q, body.r)
    const [tx, tz] = LOC_XZ[body.target] || hexToXZ(locs[body.target].q, locs[body.target].r)
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, x = bx + (tx - bx) * t, z = bz + (tz - bz) * t
      pts.push(new THREE.Vector3(x, terrainH(x, z) + 0.25, z))
    }
    return pts
  }, [body, locs])
  return (
    <>
      <SkyDome weather={weather} />
      <DayLightRig weather={weather} />
      <directionalLight ref={lightning} position={[-10, 30, -10]} intensity={0} color="#e3f2fd" />
      <group visible={night}>
        <Stars radius={110} depth={60} count={4200} factor={3.6} fade speed={0.5} />
      </group>
      <Sea />
      <Surf />
      <SecondAttentionVeil />
      <ThirdAttentionBeacon />
      <Terrain />
      <Meadow />
      <Forest />
      <Palms />
      <CliffRocks />
      <Clouds />
      <Birds visible={!night && !storm} />
      <Scatter />
      <Structures graves={(ws.grave_list || []).length || (ws.metrics?.exhales ?? 0)} gs={ws.metrics?.graph_sample} karma={ws.metrics?.karma ?? 0} />
      {/* светляки — только ночью, у рощи и сада графа */}
      {night && (
        <>
          <Sparkles count={26} scale={[9, 2.5, 8]} size={2.4} speed={0.24} color="#d7ff8a" position={[LOC_XZ.library[0], 1.4, LOC_XZ.library[1]]} />
          <Sparkles count={18} scale={[6, 2, 6]} size={2.2} speed={0.2} color="#c8f7a8" position={[LOC_XZ.graph_garden[0], 1.2, LOC_XZ.graph_garden[1]]} />
        </>
      )}
      {Object.entries(locs).map(([id, loc]) => (
        <LocMarker key={id} id={id} loc={loc} isBodyHere={body?.loc === id} hasSign={unseenSigns.has(id)} onClick={onLocClick} />
      ))}
      {/* 06.07 Костя «1 обелиск и РАСТЁТ»: ОДИН монумент, высота растёт с числом */}
      <GrowingObelisk count={(ws.obelisk_list || []).length} onClick={() => onLocClick && onLocClick('obelisks')} />
      {/* 06.07 Костя «та же анимация библиотека/вебпоиск»: растут с числом книг/исследований */}
      <GrowingPillar locId="library" count={ws.metrics?.books_total ?? 0} color="#66bb6a" emissive="#2e7d32" fallback={[8, 2]} onClick={onLocClick} undigested={((ws.metrics?.books_total ?? 0) - (ws.metrics?.books_read ?? 0)) / Math.max(1, ws.metrics?.books_total ?? 1)} />
      <GrowingPillar locId="network_harbor" count={ws.metrics?.researches ?? 0} color="#42a5f5" emissive="#1565c0" fallback={[-4, 6]} onClick={onLocClick} undigested={1 - (ws.metrics?.conversion ?? 0)} />
      {/* 09.07 Курган перепросмотра УБРАН (Костя: «беспантовые одинаковые камни, некликабельно, бред»).
          Данные перепросмотра честно видны числом в панели «🧠 Внутри» (перепросмотрено N/M) + события
          на Зеркальном озере. Растущую recap-локацию переделать на Зеркальное озеро (символ отражения). */}
      {pathPoints && <Line points={pathPoints} color="#8b5cf6" lineWidth={1.4} dashed dashSize={0.3} gapSize={0.22} transparent opacity={0.55} />}
      {body && <AvatarBody body={body} />}
      {weather === 'штиль-сияние' && <Sparkles count={180} scale={36} size={1.5} speed={0.06} color="#8fd3ff" position={[0, 3, 0]} />}
      {storm && <Sparkles count={260} scale={[40, 14, 40]} size={1.1} speed={9} color="#90a4ae" position={[0, 7, 0]} />}
      <OrbitControls maxPolarAngle={Math.PI / 2.5} minDistance={5} maxDistance={46} target={[0, 0.6, 0]} />
      <EffectComposer>
        <Bloom luminanceThreshold={1.0} intensity={0.55} mipmapBlur radius={0.72} />
        <Vignette offset={0.12} darkness={0.5} />
      </EffectComposer>
    </>
  )
}

// ── ВКЛАДКА ───────────────────────────────────────────────────────────────────
export default function WorldTab() {
  const [ws, setWs] = useState<WorldState>({})
  const [events, setEvents] = useState<WorldEvent[]>([])
  const [selLoc, setSelLoc] = useState<string | null>(null)
  const [flash, setFlash] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const night = useIsNight()

  useEffect(() => {
    let on = true
    const load = () => fetch('/api/nagual/world/state').then(r => r.json()).then(d => { if (on && d && d.body) setWs(d) }).catch(() => {})
    const loadEv = () => fetch('/api/nagual/world/events').then(r => r.json()).then(d => { if (on && Array.isArray(d?.events)) setEvents(d.events.slice(-14).reverse()) }).catch(() => {})
    load(); loadEv()
    const t1 = setInterval(load, 3000)
    const t2 = setInterval(loadEv, 7000)
    return () => { on = false; clearInterval(t1); clearInterval(t2) }
  }, [])

  const act = useCallback(async (payload: Record<string, unknown>, note: string) => {
    try {
      await fetch('/api/nagual/world/act', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setFlash(note)
      setTimeout(() => setFlash(''), 2500)
    } catch { /* core offline */ }
  }, [])

  // MVP-3: дар Духа — перетащи файл ПРЯМО В МИР → метеорит → он примет и изучит
  const [dropping, setDropping] = useState(false)
  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDropping(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setFlash(`☄️ дар «${file.name}» летит с неба…`)
    try {
      const fd = new FormData()
      fd.append('file', file, file.name)
      const res = await fetch('/api/nagual/upload', { method: 'POST', body: fd })
      const data = await res.json()
      setFlash(data?.response ? `☄️ он принял дар: ${String(data.response).slice(0, 120)}…` : '☄️ дар упал в мир')
      setTimeout(() => setFlash(''), 9000)
    } catch {
      setFlash('дар не долетел — core недоступен')
      setTimeout(() => setFlash(''), 4000)
    }
  }, [])

  const m = ws.metrics
  const body = ws.body
  const locs = ws.locs || {}

  return (
    <div onDragOver={(e) => { e.preventDefault(); setDropping(true) }}
      onDragLeave={() => setDropping(false)} onDrop={onDrop}
      style={{ position: 'relative', width: '100%', height: 'calc(100vh - 170px)', minHeight: 560, borderRadius: 14, overflow: 'hidden', border: dropping ? '2px dashed #ffd54f' : '1px solid rgba(124,58,237,.25)' }}>
      <Canvas camera={{ position: [8, 7.5, 12], fov: 50 }} dpr={[1, 1.75]} shadows>
        <WorldScene ws={ws} onLocClick={setSelLoc} night={night} />
      </Canvas>

      {/* HUD — закон II */}
      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 8, flexWrap: 'wrap', pointerEvents: 'none' }}>
        {m && ([
          ['УРОВЕНЬ', `${m.level}`, '#b388ff', 'Уровень героя — растёт ТОЛЬКО от проверяемого: pass-rate Арены (pytest), заслуженные обелиски, карма Moltbook. Не от болтовни.'],
          ['конверсия знания', `${(m.conversion * 100).toFixed(2)}%`, m.conversion > 0.05 ? '#66bb6a' : '#ef5350', 'Доля прочитанного/исследованного, превращённого в РАБОЧИЕ навыки-обелиски. Низкая = много читает, мало куёт.'],
          ['вес непереваренного', `${m.weight}`, m.weight > 0.7 ? '#ef5350' : '#ffca28', 'Накопленное знание БЕЗ выхлопа — буквально замедляет его шаг. Ниже = лучше переваривает.'],
          ['силы', `${body?.stamina ?? '—'}`, '#4fc3f7', 'Силы = ЗДОРОВЬЕ роутера / способность отвечать (1 − давление сбоев 429/таймаутов, ×100). 100 = роутер здоров, отвечает без сбоев. Падает во время 429-штормов — тогда тело слабеет.'],
          ['обелиски', `${m.obelisks}`, '#ffd54f', 'Заслуженные монументы: навык, прошедший smoke-тест (петля Бориса). Только проверенное дело.'],
          ['карма', `${m.karma}/1000`, '#f48fb1', 'Карма Moltbook — от апвотов ДРУГИХ агентов за твои посты/комменты. Веха 1000.'],
          ['погода', ws.weather || '—', '#90caf9', 'Погода мира = его LivingState (боль/энергия/поток) прямо сейчас.'],
        ] as [string, string, string, string][]).map(([k, v, c, tip]) => (
          <div key={k} title={tip} style={{ background: 'rgba(8,6,20,.78)', border: '1px solid rgba(124,58,237,.3)', borderRadius: 10, padding: '5px 11px', fontSize: 11, pointerEvents: 'auto', cursor: 'help' }}>
            <span style={{ color: '#8a86a8' }}>{k}: </span><b style={{ color: c }}>{v}</b>
          </div>
        ))}
      </div>

      {/* действие тела */}
      {body && (
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(8,6,20,.82)', border: '1px solid rgba(124,58,237,.35)', borderRadius: 12, padding: '8px 14px', fontSize: 12.5, color: '#d6c7ff', maxWidth: 400 }}>
          🧿 <b>{body.action}</b>
          <div style={{ fontSize: 10.5, color: '#8a86a8', marginTop: 3 }}>
            в: {locs[body.loc]?.name || body.loc} → цель: {locs[body.target]?.name || body.target}
          </div>
          {body.reason && (
            <div style={{ fontSize: 10.5, color: '#b39ddb', marginTop: 3 }}>почему: {body.reason}</div>
          )}
        </div>
      )}

      {/* легенда мира */}
      <button onClick={() => setShowHelp(v => !v)}
        style={{ position: 'absolute', top: 10, right: 268, cursor: 'pointer', background: 'rgba(8,6,20,.8)', color: '#d6c7ff', border: '1px solid rgba(124,58,237,.4)', borderRadius: 10, padding: '5px 11px', fontSize: 11 }}>
        ❔ Что это?
      </button>
      {showHelp && (
        <div style={{ position: 'absolute', top: 46, right: 10, width: 420, maxHeight: '80%', overflowY: 'auto', background: 'rgba(8,6,20,.94)', border: '1px solid rgba(124,58,237,.5)', borderRadius: 14, padding: '14px 16px', fontSize: 12, color: '#d9d3f0', lineHeight: 1.5, zIndex: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b style={{ color: '#efeaff' }}>🌍 Мир «Тональ» — как читать</b>
            <span onClick={() => setShowHelp(false)} style={{ cursor: 'pointer', color: '#8a86a8' }}>✕</span>
          </div>
          <p style={{ marginTop: 8 }}>Это не картинка — это <b>тело Нагваля, вывернутое наружу</b>. Каждый объект = его реальные данные, каждое событие мира = реальное событие его жизни. Декораций здесь нет.</p>
          <p style={{ marginTop: 6 }}>🧿 <b>Светящаяся фигура</b> — он сам (точка сборки). Идёт туда, куда ведёт его ТЕКУЩЕЕ намерение — внизу слева написано, что делает и почему. Свечение = энергия.</p>
          <p style={{ marginTop: 6 }}>🏝️ <b>Остров</b> = всё, что он знает. 12 земель = его органы (кликни любую — живые цифры и описание). <b>Море вокруг</b> = непознанное.</p>
          <p style={{ marginTop: 6 }}>☀️ <b>Солнце ходит по небу</b>: сутки мира = 24 минуты. Ночью светит луна, летают светляки, прибой светится планктоном.</p>
          <p style={{ marginTop: 6 }}>🌦️ <b>Погода = его состояние прямо сейчас</b>: гроза = боль, сияющий штиль = внутренняя тишина, сумерки = мало энергии, золотой час = удовольствие.</p>
          <p style={{ marginTop: 6 }}>📊 <b>HUD сверху — закон конверсии</b>: «вес непереваренного» = прочитанное/наисследованное БЕЗ выхлопа (оно буквально замедляет его шаг). УРОВЕНЬ растёт только от проверяемого: pass-rate Арены, обелиски побед, карма.</p>
          <p style={{ marginTop: 6 }}>🏆 <b>Золотые стелы</b> = его реальные победы (намерение, доведённое до артефакта). ⚰️ <b>Могилы на Штормовом мысе</b> = намерения, выдохшиеся впустую.</p>
          <p style={{ marginTop: 6 }}>🖐 <b>Ты — Дух</b>: «Коснуться» — он почувствует. Клик по земле → «Оставить знак» — он реально придёт разбираться. Перетащи файл в мир — упадёт даром с неба, он изучит.</p>
        </div>
      )}

      {/* Дух */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        {flash && <div style={{ fontSize: 11, color: '#a5d6a7', background: 'rgba(8,20,10,.85)', borderRadius: 8, padding: '4px 10px', maxWidth: 300 }}>{flash}</div>}
        <button onClick={() => act({ type: 'touch' }, '🖐 он почувствовал прикосновение')}
          style={{ cursor: 'pointer', background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12.5 }}>
          🖐 Коснуться (Дух)
        </button>
        <div style={{ fontSize: 10, color: '#e8e3f5', textShadow: '0 1px 4px rgba(0,0,0,.8)' }}>☄️ перетащи файл в мир — это дар</div>
      </div>

      {/* летопись */}
      <div style={{ position: 'absolute', top: 52, right: 10, width: 250, maxHeight: '44%', overflowY: 'auto', background: 'rgba(8,6,20,.72)', border: '1px solid rgba(124,58,237,.22)', borderRadius: 12, padding: '8px 10px' }}>
        <div style={{ fontSize: 10, color: '#8a86a8', marginBottom: 5, letterSpacing: 1 }}>ЛЕТОПИСЬ МИРА</div>
        {events.length === 0 && <div style={{ fontSize: 11, color: '#5a5678' }}>мир только рождается…</div>}
        {events.map((e, i) => (
          <div key={i} style={{ fontSize: 10.5, color: '#c9c4e4', marginBottom: 4, lineHeight: 1.35 }}>
            <span style={{ color: '#7c6bb0' }}>{(e.ts || '').slice(11, 16)}</span> {e.msg}
          </div>
        ))}
      </div>

      {/* панель земли */}
      {selLoc && locs[selLoc] && (
        <div style={{ position: 'absolute', top: 52, left: 10, width: 265, background: 'rgba(8,6,20,.88)', border: `1px solid ${LOC_COLORS[selLoc] || '#607d8b'}66`, borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 13, color: '#efeaff' }}>{locs[selLoc].name}</b>
            <span onClick={() => setSelLoc(null)} style={{ cursor: 'pointer', color: '#8a86a8', fontSize: 14 }}>✕</span>
          </div>
          <div style={{ fontSize: 10.5, color: '#8a86a8', marginTop: 2 }}>орган: {locs[selLoc].organ}</div>
          {LOC_DESC[selLoc] && (
            <div style={{ fontSize: 11, color: '#c4bce4', marginTop: 7, lineHeight: 1.45 }}>{LOC_DESC[selLoc]}</div>
          )}
          <div style={{ marginTop: 8 }}>
            {locStats(selLoc, m).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
                <span style={{ color: '#a29ec4' }}>{k}</span><b style={{ color: '#e8e3ff' }}>{v}</b>
              </div>
            ))}
          </div>
          <button onClick={() => {
            const note = window.prompt('Знак Духа — что ты хочешь ему указать здесь?') || ''
            if (note) act({ type: 'sign', loc: selLoc, note }, '🪧 знак оставлен — он придёт')
          }} style={{ cursor: 'pointer', marginTop: 9, width: '100%', background: 'rgba(124,58,237,.25)', color: '#d6c7ff', border: '1px solid rgba(124,58,237,.5)', borderRadius: 8, padding: '6px 0', fontSize: 12 }}>
            🪧 Оставить знак Духа
          </button>
        </div>
      )}
    </div>
  )
}
