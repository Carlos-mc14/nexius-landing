"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Activity, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"
import { usePolling } from "@/hooks/use-whatsapp-api"
import { whatsappAPI } from "@/lib/whatsapp-api"
import { useWhatsApp } from "@/components/whatsapp/whatsapp-provider"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Lead } from "@/types/whatsapp"

export default function WhatsAppDashboard() {
  const { autoRefresh, refreshInterval } = useWhatsApp()

  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = usePolling(() => whatsappAPI.getStats(), autoRefresh ? refreshInterval : 0)

  const { data: recentLeads, loading: leadsLoading } = usePolling(
    () => whatsappAPI.getLeads({ limit: 10, page: 1 }),
    autoRefresh ? refreshInterval : 0,
  )

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "destructive"
      case "alta":
        return "default"
      case "normal":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "nuevo":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "en_proceso":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "completado":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cerrado":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground">{statsError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Bot Dashboard</h1>
          <p className="text-muted-foreground">Gestiona leads, usuarios y conversaciones de WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/whatsapp/leads">
            <Button>Ver todos los leads</Button>
          </Link>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.total_leads || 0}</div>
            <p className="text-xs text-muted-foreground">Leads generados por el bot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.usuarios_activos || 0}</div>
            <p className="text-xs text-muted-foreground">Usuarios con actividad reciente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.sesiones_activas || 0}</div>
            <p className="text-xs text-muted-foreground">Conversaciones manuales activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : `${stats?.tasa_conversion || 0}%`}</div>
            <p className="text-xs text-muted-foreground">Leads convertidos a clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y tablas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Leads por servicio */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Leads por Servicio</CardTitle>
            <CardDescription>Distribución de leads por tipo de servicio solicitado</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-8 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.leads_por_servicio?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.servicio}</span>
                    <Badge variant="outline">{item.cantidad}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos leads */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimos Leads</CardTitle>
              <CardDescription>Los 10 leads más recientes generados por el bot</CardDescription>
            </div>
            <Link href="/dashboard/whatsapp/leads">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentLeads?.data?.slice(0, 10).map((lead: Lead) => (
                  <div key={lead._id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-3">
                      {getEstadoIcon(lead.estado)}
                      <div>
                        <p className="text-sm font-medium">{lead.usuario_info.nombre || lead.numero}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.servicio} •{" "}
                          {formatDistanceToNow(new Date(lead.timestamp), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(lead.prioridad) as any}>{lead.prioridad}</Badge>
                      <Link href={`/dashboard/whatsapp/leads?id=${lead._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {(!recentLeads?.data || recentLeads.data.length === 0) && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay leads recientes</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enlaces rápidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/whatsapp/leads">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <MessageSquare className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-base">Gestionar Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Ver, filtrar y gestionar todos los leads</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/whatsapp/usuarios">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Users className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-base">Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lista de usuarios registrados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/whatsapp/conversaciones">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Activity className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-base">Conversaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Historial de chats y mensajes</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/whatsapp/sesiones">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-base">Sesiones Manuales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Gestionar sesiones de chat manual</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
