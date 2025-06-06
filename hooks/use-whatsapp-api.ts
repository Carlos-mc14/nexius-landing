"use client"

import { useState, useEffect, useCallback } from "react"
import type { ApiResponse } from "@/types/whatsapp"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(apiCall: () => Promise<ApiResponse<T>>, dependencies: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall()
      if (response.success) {
        setState({ data: response.data, loading: false, error: null })
      } else {
        setState({ data: null, loading: false, error: response.message || "Error desconocido" })
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Error de conexión",
      })
    }
  }, dependencies)

  useEffect(() => {
    execute()
  }, [execute])

  return { ...state, refetch: execute }
}

export function usePolling<T>(apiCall: () => Promise<ApiResponse<T>>, interval = 30000, dependencies: any[] = []) {
  const { data, loading, error, refetch } = useApi(apiCall, dependencies)

  useEffect(() => {
    if (interval > 0) {
      const intervalId = setInterval(refetch, interval)
      return () => clearInterval(intervalId)
    }
  }, [refetch, interval])

  return { data, loading, error, refetch }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
      }
      return initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue] as const
}
