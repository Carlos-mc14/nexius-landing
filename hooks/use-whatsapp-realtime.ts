"use client"

import { useState, useEffect, useRef } from "react"

const POLLING_INTERVAL = 3000 // 3 seconds

interface UseWhatsAppRealtimeProps {
  loadDashboardData: (silent?: boolean) => void
  loadConversaciones: (numero: string, silent?: boolean) => void
  activeTab: string
}

export function useWhatsAppRealtime({ loadDashboardData, loadConversaciones, activeTab }: UseWhatsAppRealtimeProps) {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Setup polling for real-time updates
  useEffect(() => {
    if (isRealTimeEnabled) {
      pollingRef.current = setInterval(() => {
        loadDashboardData(true) // Silent load

        // If we're in chat tab and have a selected user, update conversations
        if (activeTab === "chat") {
          // This would need to be passed from the parent component
          // For now, we'll just update dashboard data
        }
      }, POLLING_INTERVAL)
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [isRealTimeEnabled, activeTab, loadDashboardData])

  return {
    isRealTimeEnabled,
    setIsRealTimeEnabled,
    notifications,
    setNotifications,
  }
}
