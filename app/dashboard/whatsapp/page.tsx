"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import {
  Users,
  MessageSquare,
  Target,
  Activity,
  Send,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  StopCircle,
  Archive,
  MoreVertical,
  RefreshCw,
  Filter,
  Search,
  ChevronRight,
  Phone,
  Mail,
  Building,
  Calendar,
  ArrowUpRight,
  ArchiveRestore,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import type { Stats, Lead, Usuario, Conversacion, SesionManual } from "@/types/whatsapp"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.nexius.lat"
const VERIFY_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_VERIFY_TOKEN || "tu_verify_token"

export default function WhatsAppDashboard() {
  const isMobile = useMobile()
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [users, setUsers] = useState<Usuario[]>([])
  const [conversations, setConversations] = useState<Conversacion[]>([])
  const [archivedConversations, setArchivedConversations] = useState<Conversacion[]>([])
  const [sessions, setSessions] = useState<SesionManual[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedUserData, setSelectedUserData] = useState<Usuario | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [confirmArchiveDialogOpen, setConfirmArchiveDialogOpen] = useState(false)
  const [confirmUnarchiveDialogOpen, setConfirmUnarchiveDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch data functions
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats?verify_token=${VERIFY_TOKEN}`)
      if (!res.ok) throw new Error("Failed to fetch stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      })
    }
  }

  const fetchLeads = async () => {
    try {
      setRefreshing(true)
      const res = await fetch(`${API_BASE}/api/leads?verify_token=${VERIFY_TOKEN}&limit=20`)
      if (!res.ok) throw new Error("Failed to fetch leads")
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error("Error fetching leads:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los leads",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setRefreshing(true)
      const res = await fetch(`${API_BASE}/api/usuarios?verify_token=${VERIFY_TOKEN}&limit=20`)
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data.usuarios || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sesiones-manuales?verify_token=${VERIFY_TOKEN}&activas_solo=true`)
      if (!res.ok) throw new Error("Failed to fetch sessions")
      const data = await res.json()
      setSessions(data.sesiones || [])
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las sesiones",
        variant: "destructive",
      })
    }
  }

  const fetchConversations = async (numero: string, archived = false) => {
    try {
      setLoading(true)
      const res = await fetch(
        `${API_BASE}/api/conversaciones/${numero}?verify_token=${VERIFY_TOKEN}&archived=${archived}`,
      )
      if (!res.ok) throw new Error("Failed to fetch conversations")
      const data = await res.json()

      if (archived) {
        setArchivedConversations(data.conversaciones || [])
      } else {
        setConversations(data.conversaciones || [])
      }

      // Find and set the user data for the selected user
      const userData = users.find((user) => user.numero === numero) || null
      setSelectedUserData(userData)

      // Scroll to bottom of messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/mensajes/enviar?verify_token=${VERIFY_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: selectedUser,
          mensaje: newMessage,
          agente_id: "dashboard-user",
        }),
      })

      if (res.ok) {
        setNewMessage("")
        fetchConversations(selectedUser)
        toast({
          title: "Mensaje enviado",
          description: "El mensaje ha sido enviado correctamente",
        })
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startManualSession = async (numero: string) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/sesiones-manuales?verify_token=${VERIFY_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero,
          agente_id: "dashboard-user",
          motivo: "Iniciado desde dashboard",
        }),
      })

      if (res.ok) {
        fetchSessions()
        toast({
          title: "Sesión iniciada",
          description: "La sesión manual ha sido iniciada correctamente",
        })
      } else {
        throw new Error("Failed to start session")
      }
    } catch (error) {
      console.error("Error starting session:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión manual",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const endManualSession = async (numero: string) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/sesiones-manuales/${numero}?verify_token=${VERIFY_TOKEN}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: "Finalizado desde dashboard" }),
      })

      if (res.ok) {
        fetchSessions()
        toast({
          title: "Sesión finalizada",
          description: "La sesión manual ha sido finalizada correctamente",
        })
      } else {
        throw new Error("Failed to end session")
      }
    } catch (error) {
      console.error("Error ending session:", error)
      toast({
        title: "Error",
        description: "No se pudo finalizar la sesión manual",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId: string, estado: string) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/leads/${leadId}?verify_token=${VERIFY_TOKEN}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })

      if (res.ok) {
        fetchLeads()
        toast({
          title: "Lead actualizado",
          description: `El estado del lead ha sido actualizado a "${estado}"`,
        })
      } else {
        throw new Error("Failed to update lead")
      }
    } catch (error) {
      console.error("Error updating lead:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el lead",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // New function to archive conversations
  const archiveConversations = async (numero: string) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/conversaciones/${numero}/archivar?verify_token=${VERIFY_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        setConfirmArchiveDialogOpen(false)
        fetchConversations(numero)
        toast({
          title: "Conversaciones archivadas",
          description: "Las conversaciones han sido archivadas correctamente",
        })
      } else {
        throw new Error("Failed to archive conversations")
      }
    } catch (error) {
      console.error("Error archiving conversations:", error)
      toast({
        title: "Error",
        description: "No se pudieron archivar las conversaciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // New function to unarchive conversations
  const unarchiveConversations = async (numero: string) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/conversaciones/${numero}/desarchivar?verify_token=${VERIFY_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        setConfirmUnarchiveDialogOpen(false)
        fetchConversations(numero, true)
        toast({
          title: "Conversaciones restauradas",
          description: "Las conversaciones han sido restauradas correctamente",
        })
      } else {
        throw new Error("Failed to unarchive conversations")
      }
    } catch (error) {
      console.error("Error unarchiving conversations:", error)
      toast({
        title: "Error",
        description: "No se pudieron restaurar las conversaciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle message input with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Filter leads based on search and filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.numero.includes(searchQuery) ||
      lead.servicio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.usuario_info.nombre && lead.usuario_info.nombre.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesPriority = filterPriority === null || lead.prioridad === filterPriority
    const matchesStatus = filterStatus === null || lead.estado === filterStatus

    return matchesSearch && matchesPriority && matchesStatus
  })

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    return (
      searchQuery === "" ||
      user.numero.includes(searchQuery) ||
      (user.nombre && user.nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  useEffect(() => {
    fetchStats()
    fetchLeads()
    fetchUsers()
    fetchSessions()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
      fetchLeads()
      fetchSessions()

      // Also refresh conversations if a user is selected
      if (selectedUser) {
        fetchConversations(selectedUser, showArchived)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Refresh conversations when switching between archived and active
  useEffect(() => {
    if (selectedUser) {
      fetchConversations(selectedUser, showArchived)
    }
  }, [showArchived])

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "bg-red-500 hover:bg-red-600"
      case "alta":
        return "bg-orange-500 hover:bg-orange-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "nuevo":
        return "bg-green-500 hover:bg-green-600"
      case "en_proceso":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "completado":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard WhatsApp</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestiona conversaciones y leads en tiempo real</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resumen.total_usuarios || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resumen.total_leads || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Nuevos</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.resumen.leads_nuevos || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.resumen.leads_en_proceso || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.resumen.sesiones_activas || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="leads">
              <Target className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="conversations">
              <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Conversaciones</span>
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Activity className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Sesiones Manuales</span>
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leads Recientes</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLeads}
                    disabled={refreshing}
                    aria-label="Refrescar leads"
                  >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" aria-label="Filtrar leads">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="p-2">
                        <p className="text-sm font-medium mb-2">Prioridad</p>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant={filterPriority === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterPriority(null)}
                          >
                            Todas
                          </Button>
                          <Button
                            variant={filterPriority === "normal" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterPriority("normal")}
                          >
                            Normal
                          </Button>
                          <Button
                            variant={filterPriority === "alta" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterPriority("alta")}
                          >
                            Alta
                          </Button>
                          <Button
                            variant={filterPriority === "urgente" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterPriority("urgente")}
                          >
                            Urgente
                          </Button>
                        </div>

                        <Separator className="my-2" />

                        <p className="text-sm font-medium mb-2">Estado</p>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant={filterStatus === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus(null)}
                          >
                            Todos
                          </Button>
                          <Button
                            variant={filterStatus === "nuevo" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("nuevo")}
                          >
                            Nuevo
                          </Button>
                          <Button
                            variant={filterStatus === "en_proceso" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("en_proceso")}
                          >
                            En Proceso
                          </Button>
                          <Button
                            variant={filterStatus === "completado" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("completado")}
                          >
                            Completado
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por número, servicio o nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => (
                        <Card key={lead._id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(lead.prioridad)}>{lead.prioridad}</Badge>
                                <Badge className={getEstadoColor(lead.estado)}>{lead.estado}</Badge>
                                <span className="text-xs text-gray-500 ml-auto">
                                  {new Date(lead.timestamp).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">{lead.usuario_info.nombre || lead.numero}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{lead.servicio}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {lead.mensaje}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-3 flex justify-between items-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUser(lead.numero)
                                  fetchConversations(lead.numero)
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Ver conversación
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <span className="sr-only">Acciones</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => updateLeadStatus(lead._id, "en_proceso")}
                                    disabled={lead.estado === "en_proceso"}
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Marcar en proceso
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateLeadStatus(lead._id, "completado")}
                                    disabled={lead.estado === "completado"}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Marcar completado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => startManualSession(lead.numero)}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Iniciar sesión manual
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchQuery || filterPriority || filterStatus
                            ? "No se encontraron leads con los filtros aplicados"
                            : "No hay leads disponibles"}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuarios Registrados</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={refreshing}
                    aria-label="Refrescar usuarios"
                  >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por número, nombre o email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <Card key={user._id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">{user.nombre || user.numero}</h3>

                                  <div className="mt-2 space-y-1 text-sm">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                      <Phone className="h-3.5 w-3.5 mr-2" />
                                      {user.numero}
                                    </div>

                                    {user.email && (
                                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <Mail className="h-3.5 w-3.5 mr-2" />
                                        {user.email}
                                      </div>
                                    )}

                                    {user.empresa && (
                                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <Building className="h-3.5 w-3.5 mr-2" />
                                        {user.empresa}
                                      </div>
                                    )}

                                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                                      <Calendar className="h-3.5 w-3.5 mr-2" />
                                      Última actividad: {new Date(user.ultima_actividad).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <Badge variant="outline" className="mb-2">
                                    {user.total_interacciones} interacciones
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-3 flex justify-between items-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUser(user.numero)
                                  fetchConversations(user.numero)
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Ver conversación
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>

                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => startManualSession(user.numero)}>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  <span className="sr-only md:not-sr-only">Iniciar sesión</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchQuery
                            ? "No se encontraron usuarios con la búsqueda aplicada"
                            : "No hay usuarios disponibles"}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Usuarios</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={refreshing}
                    aria-label="Refrescar usuarios"
                  >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar usuario..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {filteredUsers.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => {
                            setSelectedUser(user.numero)
                            fetchConversations(user.numero, showArchived)
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-colors flex items-center",
                            selectedUser === user.numero
                              ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800",
                          )}
                        >
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">{user.nombre || user.numero}</p>
                            <p className="text-sm text-gray-500">{user.empresa || user.numero}</p>
                          </div>
                          {selectedUser === user.numero && <ArrowUpRight className="ml-auto h-4 w-4 text-blue-500" />}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Conversación</CardTitle>
                    {selectedUserData && (
                      <Badge variant="outline">{selectedUserData.nombre || selectedUserData.numero}</Badge>
                    )}
                  </div>

                  {selectedUser && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="archived-mode" checked={showArchived} onCheckedChange={setShowArchived} />
                        <Label htmlFor="archived-mode" className="text-sm">
                          {showArchived ? "Archivados" : "Activos"}
                        </Label>
                      </div>

                      {showArchived ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmUnarchiveDialogOpen(true)}
                          disabled={loading || archivedConversations.length === 0}
                        >
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          <span className="sr-only md:not-sr-only">Restaurar</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmArchiveDialogOpen(true)}
                          disabled={loading || conversations.length === 0}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          <span className="sr-only md:not-sr-only">Archivar</span>
                        </Button>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedUser ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-[400px] border rounded-lg p-4">
                        {loading ? (
                          <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                                <Skeleton className={`h-16 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-lg`} />
                              </div>
                            ))}
                          </div>
                        ) : showArchived ? (
                          archivedConversations.length > 0 ? (
                            <div className="space-y-3">
                              {archivedConversations.map((conv) => (
                                <div
                                  key={conv._id}
                                  className={`flex ${conv.tipo.includes("enviado") ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={cn(
                                      "max-w-xs rounded-lg p-3",
                                      conv.tipo.includes("enviado")
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                                    )}
                                  >
                                    <p className="text-sm">{conv.mensaje}</p>
                                    <p className="text-xs opacity-75 mt-1">
                                      {new Date(conv.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                              No hay conversaciones archivadas
                            </p>
                          )
                        ) : conversations.length > 0 ? (
                          <div className="space-y-3">
                            {conversations.map((conv) => (
                              <div
                                key={conv._id}
                                className={`flex ${conv.tipo.includes("enviado") ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={cn(
                                    "max-w-xs rounded-lg p-3",
                                    conv.tipo.includes("enviado")
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                                  )}
                                >
                                  <p className="text-sm">{conv.mensaje}</p>
                                  <p className="text-xs opacity-75 mt-1">
                                    {new Date(conv.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No hay conversaciones activas
                          </p>
                        )}
                      </ScrollArea>

                      {!showArchived && (
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Escribir mensaje..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1"
                            disabled={loading}
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={loading || !newMessage.trim()}
                            aria-label="Enviar mensaje"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Selecciona un usuario para ver la conversación</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sesiones Manuales Activas</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSessions}
                  disabled={refreshing}
                  aria-label="Refrescar sesiones"
                >
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <Card key={session._id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{session.numero}</h3>

                                <div className="mt-2 space-y-1 text-sm">
                                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <User className="h-3.5 w-3.5 mr-2" />
                                    Agente: {session.agente_id}
                                  </div>

                                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <MessageSquare className="h-3.5 w-3.5 mr-2" />
                                    {session.mensajes_intercambiados} mensajes
                                  </div>

                                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 mr-2" />
                                    Inicio: {new Date(session.inicio).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <CardFooter className="bg-gray-50 dark:bg-gray-800 p-3 flex justify-between">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUser(session.numero)
                                fetchConversations(session.numero)
                              }}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Ver conversación
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => endManualSession(session.numero)}
                              disabled={loading}
                            >
                              <StopCircle className="h-4 w-4 mr-2" />
                              Finalizar
                            </Button>
                          </CardFooter>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No hay sesiones manuales activas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={confirmArchiveDialogOpen} onOpenChange={setConfirmArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar conversaciones</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas archivar todas las conversaciones con este usuario? Las conversaciones
              archivadas se pueden restaurar más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && archiveConversations(selectedUser)} disabled={loading}>
              {loading ? "Archivando..." : "Archivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unarchive Confirmation Dialog */}
      <AlertDialog open={confirmUnarchiveDialogOpen} onOpenChange={setConfirmUnarchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar conversaciones</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas restaurar todas las conversaciones archivadas con este usuario?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && unarchiveConversations(selectedUser)} disabled={loading}>
              {loading ? "Restaurando..." : "Restaurar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
