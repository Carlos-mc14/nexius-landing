// pages/dashboard/whatsapp.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  MessageSquare, 
  Target, 
  Activity,
  Phone,
  Send,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  StopCircle
} from 'lucide-react'

interface Stats {
  resumen: {
    total_usuarios: number
    total_leads: number
    leads_nuevos: number
    leads_en_proceso: number
    sesiones_activas: number
  }
  servicios_populares: Array<{ _id: string; count: number }>
}

interface Lead {
  _id: string
  numero: string
  servicio: string
  mensaje: string
  prioridad: 'normal' | 'alta' | 'urgente'
  estado: 'nuevo' | 'en_proceso' | 'completado'
  timestamp: string
  usuario_info: {
    nombre: string
    email: string
    empresa: string
  }
}

interface Usuario {
  _id: string
  numero: string
  nombre: string
  email: string
  empresa: string
  estado_conversacion: string
  total_interacciones: number
  ultima_actividad: string
}

interface Conversacion {
  _id: string
  mensaje: string
  tipo: string
  timestamp: string
}

interface SesionManual {
  _id: string
  numero: string
  agente_id: string
  motivo: string
  inicio: string
  activa: boolean
  mensajes_intercambiados: number
}

const API_BASE = 'https://api.nexius.lat'
const VERIFY_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_VERIFY_TOKEN || 'tu_verify_token'

export default function WhatsAppDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [users, setUsers] = useState<Usuario[]>([])
  const [conversations, setConversations] = useState<Conversacion[]>([])
  const [sessions, setSessions] = useState<SesionManual[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch data functions
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats?verify_token=${VERIFY_TOKEN}`)
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leads?verify_token=${VERIFY_TOKEN}&limit=20`)
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/usuarios?verify_token=${VERIFY_TOKEN}&limit=20`)
      const data = await res.json()
      setUsers(data.usuarios || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sesiones-manuales?verify_token=${VERIFY_TOKEN}&activas_solo=true`)
      const data = await res.json()
      setSessions(data.sesiones || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const fetchConversations = async (numero: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/conversaciones/${numero}?verify_token=${VERIFY_TOKEN}`)
      const data = await res.json()
      setConversations(data.conversaciones || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/mensajes/enviar?verify_token=${VERIFY_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero: selectedUser,
          mensaje: newMessage,
          agente_id: 'dashboard-user'
        })
      })
      
      if (res.ok) {
        setNewMessage('')
        fetchConversations(selectedUser)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
    setLoading(false)
  }

  const startManualSession = async (numero: string) => {
    try {
      await fetch(`${API_BASE}/api/sesiones-manuales?verify_token=${VERIFY_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero,
          agente_id: 'dashboard-user',
          motivo: 'Iniciado desde dashboard'
        })
      })
      fetchSessions()
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const endManualSession = async (numero: string) => {
    try {
      await fetch(`${API_BASE}/api/sesiones-manuales/${numero}?verify_token=${VERIFY_TOKEN}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Finalizado desde dashboard' })
      })
      fetchSessions()
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const updateLeadStatus = async (leadId: string, estado: string) => {
    try {
      await fetch(`${API_BASE}/api/leads/${leadId}?verify_token=${VERIFY_TOKEN}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      })
      fetchLeads()
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

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
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-500'
      case 'alta': return 'bg-orange-500'
      default: return 'bg-blue-500'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'nuevo': return 'bg-green-500'
      case 'en_proceso': return 'bg-yellow-500'
      case 'completado': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard WhatsApp</h1>
          <p className="text-gray-600 dark:text-white">Gestiona conversaciones y leads en tiempo real</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resumen.total_usuarios || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resumen.total_leads || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Nuevos</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.resumen.leads_nuevos || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.resumen.leads_en_proceso || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.resumen.sesiones_activas || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
            <TabsTrigger value="sessions">Sesiones Manuales</TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Leads Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPriorityColor(lead.prioridad)}>{lead.prioridad}</Badge>
                          <Badge className={getEstadoColor(lead.estado)}>{lead.estado}</Badge>
                        </div>
                        <p className="font-medium">{lead.usuario_info.nombre || lead.numero}</p>
                        <p className="text-sm text-gray-600">{lead.servicio}</p>
                        <p className="text-sm text-gray-500">{lead.mensaje}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(lead.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateLeadStatus(lead._id, 'en_proceso')}
                        >
                          En Proceso
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateLeadStatus(lead._id, 'completado')}
                        >
                          Completar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{user.nombre || user.numero}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.empresa}</p>
                        <p className="text-xs text-gray-400">
                          {user.total_interacciones} interacciones - {new Date(user.ultima_actividad).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user.numero)
                            fetchConversations(user.numero)
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startManualSession(user.numero)}
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seleccionar Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => {
                          setSelectedUser(user.numero)
                          fetchConversations(user.numero)
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedUser === user.numero 
                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <p className="font-medium">{user.nombre || user.numero}</p>
                        <p className="text-sm text-gray-500">{user.empresa}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversación</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser ? (
                    <div className="space-y-4">
                      <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                        {conversations.map((conv) => (
                          <div
                            key={conv._id}
                            className={`flex ${
                              conv.tipo.includes('enviado') ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs rounded-lg p-2 ${
                                conv.tipo.includes('enviado')
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <p className="text-sm">{conv.mensaje}</p>
                              <p className="text-xs opacity-75">
                                {new Date(conv.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Escribir mensaje..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={sendMessage} 
                          disabled={loading || !newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Selecciona un usuario para ver la conversación
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Sesiones Manuales Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{session.numero}</p>
                        <p className="text-sm text-gray-600">Agente: {session.agente_id}</p>
                        <p className="text-sm text-gray-500">{session.motivo}</p>
                        <p className="text-xs text-gray-400">
                          Inicio: {new Date(session.inicio).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          Mensajes: {session.mensajes_intercambiados}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => endManualSession(session.numero)}
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Finalizar
                      </Button>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No hay sesiones manuales activas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}