import { useState, useEffect, useCallback, useRef } from 'react'
import { formatTime } from '../formatters'

export interface UseGameTimerReturn {
  seconds: number
  formatted: string
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
  setSeconds: React.Dispatch<React.SetStateAction<number>>
}

export function useGameTimer(active: boolean = false): UseGameTimerReturn {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(active)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setIsRunning(active)
  }, [active])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  const start = useCallback(() => setIsRunning(true), [])
  const stop = useCallback(() => setIsRunning(false), [])
  const reset = useCallback(() => {
    setSeconds(0)
    setIsRunning(false)
  }, [])

  return {
    seconds,
    formatted: formatTime(seconds),
    isRunning,
    start,
    stop,
    reset,
    setSeconds,
  }
}
