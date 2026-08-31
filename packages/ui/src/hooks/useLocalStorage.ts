import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) {
        return JSON.parse(item)
      }
      return initialValue instanceof Function ? initialValue() : initialValue
    } catch {
      return initialValue instanceof Function ? initialValue() : initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const next = value instanceof Function ? value(prev) : value
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Storage full or unavailable
      }
      return next
    })
  }, [key])

  return [storedValue, setValue]
}
