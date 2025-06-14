"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { WhatsAppHeader } from "./whatsapp-header"
import { WhatsAppStats } from "./whatsapp-stats"
import { DashboardTab } from "./tabs/dashboard-tab"
import { ChatTab } from "./tabs/chat-tab"
import { LeadsTab } from "./tabs/leads-tab"
import { UsersTab } from "./tabs/users-tab"
import { SessionsTab } from "./tabs/sessions-tab"
import { WhatsAppFooter } from "./whatsapp-footer"
import { useWhatsAppData } from "../../hooks/use-whatsapp-data"
import { useWhatsAppRealtime } from "../../hooks/use-whatsapp-realtime"

export function WhatsAppDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get initial tab from URL or default to dashboard
  const initialTab = searchParams.get("tab") || "dashboard"
  const [activeTab, setActiveTab] = useState(initialTab)

  // Update URL when tab changes
  const handleTabChange = useCallback(
    (newTab: string) => {
      setActiveTab(newTab)
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", newTab)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  // Custom hook for data management
  const {
    stats,
    leads,
    usuarios,
    conversaciones,
    sesiones,
    loading,
    isConnected,
    lastUpdate,
    loadDashboardData,
    loadConversaciones,
    updateLead,
    sendMessage,
    toggleIAUsuario,
    archivarConversaciones,
    desarchivarConversaciones,
    startManualSession,
    endManualSession,
  } = useWhatsAppData()

  // Custom hook for real-time updates
  const { isRealTimeEnabled, setIsRealTimeEnabled, notifications, setNotifications } = useWhatsAppRealtime({
    loadDashboardData,
    loadConversaciones,
    activeTab,
  })

  // Chat-specific state
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [messageText, setMessageText] = useState("")
  const [agentId] = useState("admin_panel")
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false)

  // Filter states
  const [leadFilter, setLeadFilter] = useState({
    estado: "",
    servicio: "",
    prioridad: "",
    search: "",
  })

  const [chatFilter, setChatFilter] = useState({
    showArchived: false,
    search: "",
    onlineOnly: false,
  })

  // Load initial data
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Handle chat user selection
  const handleUserSelect = useCallback(
    (numero: string) => {
      setSelectedUser(numero)
      loadConversaciones(numero)
      setIsChatSidebarOpen(false)
    },
    [loadConversaciones],
  )

  // Handle message send
  const handleSendMessage = useCallback(async () => {
    if (!selectedUser || !messageText.trim()) {
      toast({
        title: "Error",
        description: "Selecciona un usuario y escribe un mensaje",
        variant: "destructive",
      })
      return
    }

    try {
      await sendMessage(selectedUser, messageText, agentId)
      setMessageText("")
      toast({
        title: "Mensaje enviado",
        description: "El mensaje se envió correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    }
  }, [selectedUser, messageText, agentId, sendMessage, toast])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-pulse">🤖</div>
            <div className="absolute -top-1 -right-1">
              <div className="h-4 w-4 bg-green-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">WhatsApp Panel</h2>
          <p className="text-gray-600 dark:text-gray-300">Conectando con el sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background">
      <WhatsAppHeader
        isConnected={isConnected}
        lastUpdate={lastUpdate}
        stats={stats}
        isRealTimeEnabled={isRealTimeEnabled}
        setIsRealTimeEnabled={setIsRealTimeEnabled}
        notifications={notifications}
        setNotifications={setNotifications}
        onRefresh={() => loadDashboardData()}
      />

      <div className="p-4 sm:p-6 h-[calc(100vh-4rem)] overflow-auto">
        <WhatsAppStats stats={stats} usuarios={usuarios} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 bg-background shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              📊 <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Panel</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              💬 Chat
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              📈 Leads
            </TabsTrigger>
            <TabsTrigger
              value="usuarios"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hidden sm:flex"
            >
              👥 Usuarios
            </TabsTrigger>
            <TabsTrigger
              value="sesiones"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hidden sm:flex"
            >
              👤 Sesiones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab stats={stats} leads={leads} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatTab
              usuarios={usuarios}
              conversaciones={conversaciones}
              sesiones={sesiones}
              selectedUser={selectedUser}
              messageText={messageText}
              setMessageText={setMessageText}
              chatFilter={chatFilter}
              setChatFilter={setChatFilter}
              isChatSidebarOpen={isChatSidebarOpen}
              setIsChatSidebarOpen={setIsChatSidebarOpen}
              onUserSelect={handleUserSelect}
              onSendMessage={handleSendMessage}
              onToggleIA={toggleIAUsuario}
              onArchivar={archivarConversaciones}
              onDesarchivar={desarchivarConversaciones}
              onStartManualSession={startManualSession}
              onEndManualSession={endManualSession}
            />
          </TabsContent>

          <TabsContent value="leads">
            <LeadsTab
              leads={leads}
              leadFilter={leadFilter}
              setLeadFilter={setLeadFilter}
              onUpdateLead={updateLead}
              onStartManualSession={startManualSession}
              onSelectUser={handleUserSelect}
              onSwitchToChat={() => handleTabChange("chat")}
            />
          </TabsContent>

          <TabsContent value="usuarios">
            <UsersTab
              usuarios={usuarios}
              onToggleIA={toggleIAUsuario}
              onSelectUser={handleUserSelect}
              onStartManualSession={startManualSession}
              onSwitchToChat={() => handleTabChange("chat")}
            />
          </TabsContent>

          <TabsContent value="sesiones">
            <SessionsTab sesiones={sesiones} onEndSession={endManualSession} />
          </TabsContent>
        </Tabs>
      </div>

      <WhatsAppFooter isConnected={isConnected} isRealTimeEnabled={isRealTimeEnabled} stats={stats} />
    </div>
  )
}
