'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  className?: string
  decimals?: number
  prefix?: string
  suffix?: string
}

export function AnimatedNumber({ value, className, decimals = 0, prefix = '', suffix = '' }: AnimatedNumberProps) {
  // Защита: бэкенд может не прислать поле → не падаем на undefined.toFixed()
  const safe = typeof value === 'number' && Number.isFinite(value) ? value : 0
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`)
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState(`${prefix}${safe.toFixed(decimals)}${suffix}`)

  useEffect(() => {
    spring.set(safe)
    const unsubscribe = display.on('change', (v) => setText(v))
    return () => unsubscribe()
  }, [safe, spring, display])

  return <motion.span ref={ref} className={className}>{text}</motion.span>
}
