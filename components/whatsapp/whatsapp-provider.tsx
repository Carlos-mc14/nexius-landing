"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface WhatsAppContextType {
  currentUser: string
  setCurrentUser: (user: string) => void
  autoRefresh: boolean
  setAutoRefresh: (enabled: boolean) => void
  refreshInterval: number
  setRefreshInterval: (interval: number) => void
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState("Admin")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000)
  const { toast } = useToast()

  useEffect(() => {
    // Load user preferences from localStorage
    const savedUser = localStorage.getItem("whatsapp-current-user")
    const savedAutoRefresh = localStorage.getItem("whatsapp-auto-refresh")
    const savedInterval = localStorage.getItem("whatsapp-refresh-interval")

    if (savedUser) setCurrentUser(savedUser)
    if (savedAutoRefresh) setAutoRefresh(JSON.parse(savedAutoRefresh))
    if (savedInterval) setRefreshInterval(Number.parseInt(savedInterval))
  }, [])

  const handleSetCurrentUser = (user: string) => {
    setCurrentUser(user)
    localStorage.setItem("whatsapp-current-user", user)
  }

  const handleSetAutoRefresh = (enabled: boolean) => {
    setAutoRefresh(enabled)
    localStorage.setItem("whatsapp-auto-refresh", JSON.stringify(enabled))

    toast({
      title: enabled ? "Auto-actualización activada" : "Auto-actualización desactivada",
      description: enabled ? "Los datos se actualizarán automáticamente" : "Deberás actualizar manualmente",
    })
  }

  const handleSetRefreshInterval = (interval: number) => {
    setRefreshInterval(interval)
    localStorage.setItem("whatsapp-refresh-interval", interval.toString())
  }

  return (
    <WhatsAppContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        autoRefresh,
        setAutoRefresh: handleSetAutoRefresh,
        refreshInterval,
        setRefreshInterval: handleSetRefreshInterval,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  )
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext)
  if (context === undefined) {
    throw new Error("useWhatsApp must be used within a WhatsAppProvider")
  }
  return context
}
