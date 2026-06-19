import { useEffect, useRef } from 'react'
import { TIMELINE, type TimelineEvent } from './builtin'

interface TimelineOptions {
  running: boolean
  paused: boolean
  speed?: number
  onEvent: (event: TimelineEvent) => void
}

export function useDemoTimeline({ running, paused, speed = 1, onEvent }: TimelineOptions) {
  const elapsedRef = useRef(0)
  const startedAtRef = useRef<number | null>(null)
  const firedRef = useRef(new Set<number>())

  useEffect(() => {
    if (!running) {
      elapsedRef.current = 0
      startedAtRef.current = null
      firedRef.current.clear()
      return
    }

    if (paused) {
      if (startedAtRef.current !== null) {
        elapsedRef.current += (performance.now() - startedAtRef.current) * speed
        startedAtRef.current = null
      }
      return
    }

    startedAtRef.current = performance.now()
    let animationFrame = 0

    const tick = () => {
      const elapsed = elapsedRef.current + (performance.now() - (startedAtRef.current ?? performance.now())) * speed
      TIMELINE.forEach((event, index) => {
        if (event.at <= elapsed && !firedRef.current.has(index)) {
          firedRef.current.add(index)
          onEvent(event)
        }
      })
      animationFrame = requestAnimationFrame(tick)
    }

    animationFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrame)
  }, [onEvent, paused, running, speed])
}
