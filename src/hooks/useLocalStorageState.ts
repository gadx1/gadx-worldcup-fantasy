import { useEffect, useState } from 'react'

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const storedValue = window.localStorage.getItem(key)

      if (!storedValue) {
        return initialValue
      }

      return JSON.parse(storedValue) as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Local storage can fail in private browsing or restricted browser modes.
    }
  }, [key, value])

  function resetValue() {
    setValue(initialValue)

    try {
      window.localStorage.removeItem(key)
    } catch {
      // Local storage can fail in private browsing or restricted browser modes.
    }
  }

  return [value, setValue, resetValue] as const
}