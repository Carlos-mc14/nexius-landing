"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Bot, UserCheck } from "lucide-react"
import type { Estadisticas, ChatUser } from "../../types/whatsapp"

interface WhatsAppStatsProps {
  stats: Estadisticas | null
  usuarios: ChatUser[]
}

export function WhatsAppStats({ stats, usuarios }: WhatsAppStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">Usuarios</CardTitle>
          <Users className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats?.resumen.total_usuarios || 0}</div>
          <p className="text-xs opacity-90">{usuarios.filter((u) => u.is_online).length} en línea</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">Leads</CardTitle>
          <TrendingUp className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats?.resumen.leads_nuevos || 0}</div>
          <p className="text-xs opacity-90">{stats?.resumen.leads_en_proceso || 0} en proceso</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">IA</CardTitle>
          <Bot className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats?.resumen.conversaciones_ia || 0}</div>
          <p className="text-xs opacity-90">{stats?.resumen.conversaciones_ia_hoy || 0} hoy</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">Sesiones</CardTitle>
          <UserCheck className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats?.resumen.sesiones_activas || 0}</div>
          <p className="text-xs opacity-90">Activas</p>
        </CardContent>
      </Card>
    </div>
  )
}
