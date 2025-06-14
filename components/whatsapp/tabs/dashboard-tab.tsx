"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Activity, Settings } from "lucide-react"
import type { Estadisticas, Lead } from "../types"

interface DashboardTabProps {
  stats: Estadisticas | null
  leads: Lead[]
}

export function DashboardTab({ stats, leads }: DashboardTabProps) {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "nuevo":
        return "bg-blue-500"
      case "en_proceso":
        return "bg-yellow-500"
      case "completado":
        return "bg-green-500"
      case "cancelado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Servicios Más Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.servicios_populares.slice(0, 5).map((servicio, index) => (
                <div key={servicio._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-300">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm sm:text-base">{servicio._id}</span>
                  </div>
                  <Badge variant="secondary">{servicio.count} leads</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getEstadoColor(lead.estado)}`}></div>
                    <div>
                      <div className="font-medium text-sm">{lead.usuario_info.nombre || lead.numero}</div>
                      <div className="text-xs text-muted-foreground">{lead.servicio}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(lead.timestamp).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estado del sistema */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-background">
                <div
                  className={`w-3 h-3 rounded-full ${stats?.resumen.ia_disponible ? "bg-green-500" : "bg-red-500"}`}
                />
                <div>
                  <div className="font-medium text-sm sm:text-base">Inteligencia Artificial</div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.resumen.ia_disponible ? "Funcionando" : "Desconectada"}
                  </div>
                  {stats?.ia_status.modelo && (
                    <div className="text-xs text-muted-foreground">{stats.ia_status.modelo}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg bg-background">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium text-sm sm:text-base">API Backend</div>
                  <div className="text-sm text-muted-foreground">Conectada</div>
                  <div className="text-xs text-muted-foreground">api.nexius.lat</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg bg-background">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium text-sm sm:text-base">WhatsApp API</div>
                  <div className="text-sm text-muted-foreground">Activa</div>
                  <div className="text-xs text-muted-foreground">Meta Business</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
