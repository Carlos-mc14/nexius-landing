"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import type { WhatsAppDashboardState, Lead } from "../types/whatsapp"

// API Configuration
const API_BASE_URL = "https://api.nexius.lat"
const VERIFY_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_VERIFY_TOKEN || "nexius_2024_secure_token"

export function useWhatsAppData() {
  const { toast } = useToast()

  const [state, setState] = useState<WhatsAppDashboardState>({
    stats: null,
    leads: [],
    usuarios: [],
    conversaciones: [],
    sesiones: [],
    loading: true,
    isConnected: true,
    lastUpdate: new Date(),
  })

  // API request helper with better error handling
  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}verify_token=${VERIFY_TOKEN}`
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isConnected: true }))
      return data
    } catch (error) {
      console.error("API Error:", error)
      setState((prev) => ({ ...prev, isConnected: false }))
      throw error
    }
  }, [])

  // Load all dashboard data
  const loadDashboardData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setState((prev) => ({ ...prev, loading: true }))

        // Load stats
        const statsData = await apiRequest("/api/stats")

        // Load leads
        const leadsData = await apiRequest("/api/leads?limit=100")

        // Load users with enhanced online status (last 10 minutes instead of 5)
        const usuariosData = await apiRequest("/api/usuarios?limit=100")
        const usuariosConChat = (usuariosData.usuarios || []).map((usuario: any) => ({
          ...usuario,
          is_online: new Date(usuario.ultima_actividad) > new Date(Date.now() - 10 * 60 * 1000), // 10 minutes
          unread_count: 0,
        }))

        // Load active manual sessions
        const sesionesData = await apiRequest("/api/sesiones-manuales?activas_solo=true")

        setState((prev) => ({
          ...prev,
          stats: statsData,
          leads: leadsData.leads || [],
          usuarios: usuariosConChat,
          sesiones: sesionesData.sesiones || [],
          lastUpdate: new Date(),
          loading: false,
        }))
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        if (!silent) setState((prev) => ({ ...prev, loading: false }))
      }
    },
    [apiRequest],
  )

  // Load conversations for a specific user
  const loadConversaciones = useCallback(
    async (numero: string, silent = false) => {
      try {
        const data = await apiRequest(`/api/conversaciones/${numero}?limit=100`)
        setState((prev) => ({
          ...prev,
          conversaciones: data.conversaciones || [],
          usuarios: prev.usuarios.map((u) => (u.numero === numero ? { ...u, unread_count: 0 } : u)),
        }))
      } catch (error) {
        console.error("Error loading conversations:", error)
      }
    },
    [apiRequest],
  )

  // Send message
  const sendMessage = useCallback(
    async (numero: string, mensaje: string, agente_id: string) => {
      await apiRequest("/api/mensajes/enviar", {
        method: "POST",
        body: JSON.stringify({
          numero,
          mensaje,
          agente_id,
        }),
      })
      // Reload conversations after sending
      loadConversaciones(numero)
    },
    [apiRequest, loadConversaciones],
  )

  // Update lead
  const updateLead = useCallback(
    async (leadId: string, updates: Partial<Lead>) => {
      await apiRequest(`/api/leads/${leadId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })
      loadDashboardData(true)
    },
    [apiRequest, loadDashboardData],
  )

  // Toggle IA for user
  const toggleIAUsuario = useCallback(
    async (numero: string, usar_ia: boolean) => {
      await apiRequest(`/api/ia/toggle/${numero}`, {
        method: "POST",
        body: JSON.stringify({ usar_ia }),
      })
      setState((prev) => ({
        ...prev,
        usuarios: prev.usuarios.map((u) =>
          u.numero === numero ? { ...u, preferencias: { ...u.preferencias, usa_ia: usar_ia } } : u,
        ),
      }))
    },
    [apiRequest],
  )

  // Archive conversations
  const archivarConversaciones = useCallback(
    async (numero: string) => {
      await apiRequest(`/api/conversaciones/${numero}/archivar`, {
        method: "POST",
      })
      setState((prev) => ({
        ...prev,
        usuarios: prev.usuarios.map((u) => (u.numero === numero ? { ...u, has_archived: true } : u)),
      }))
      loadDashboardData(true)
    },
    [apiRequest, loadDashboardData],
  )

  // Unarchive conversations
  const desarchivarConversaciones = useCallback(
    async (numero: string) => {
      await apiRequest(`/api/conversaciones/${numero}/desarchivar`, {
        method: "POST",
      })
      setState((prev) => ({
        ...prev,
        usuarios: prev.usuarios.map((u) => (u.numero === numero ? { ...u, has_archived: false } : u)),
      }))
      loadDashboardData(true)
    },
    [apiRequest, loadDashboardData],
  )

  // Start manual session
  const startManualSession = useCallback(
    async (numero: string, motivo = "Iniciado desde panel") => {
      await apiRequest("/api/sesiones-manuales", {
        method: "POST",
        body: JSON.stringify({
          numero,
          agente_id: "admin_panel",
          motivo,
        }),
      })
      loadDashboardData(true)
    },
    [apiRequest, loadDashboardData],
  )

  // End manual session
  const endManualSession = useCallback(
    async (numero: string) => {
      await apiRequest(`/api/sesiones-manuales/${numero}`, {
        method: "DELETE",
        body: JSON.stringify({
          motivo: "Finalizado desde panel",
        }),
      })
      loadDashboardData(true)
    },
    [apiRequest, loadDashboardData],
  )

  return {
    ...state,
    loadDashboardData,
    loadConversaciones,
    sendMessage,
    updateLead,
    toggleIAUsuario,
    archivarConversaciones,
    desarchivarConversaciones,
    startManualSession,
    endManualSession,
  }
}
