"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, BellOff, RefreshCw, Zap } from "lucide-react"
import type { Estadisticas } from "../../types/whatsapp"

interface WhatsAppHeaderProps {
  isConnected: boolean
  lastUpdate: Date
  stats: Estadisticas | null
  isRealTimeEnabled: boolean
  setIsRealTimeEnabled: (enabled: boolean) => void
  notifications: boolean
  setNotifications: (enabled: boolean) => void
  onRefresh: () => void
}

export function WhatsAppHeader({
  isConnected,
  lastUpdate,
  stats,
  isRealTimeEnabled,
  setIsRealTimeEnabled,
  notifications,
  setNotifications,
  onRefresh,
}: WhatsAppHeaderProps) {
  return (
    <div className="bg-background border-b border-border shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center">
                  WhatsApp Panel
                  <span
                    className={`ml-2 inline-block h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                  ></span>
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {isConnected ? "Conectado" : "Desconectado"} • Actualizado: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Estado de IA */}
            <div className="hidden sm:flex items-center space-x-2">
              <Badge
                variant={stats?.resumen.ia_disponible ? "default" : "secondary"}
                className="flex items-center gap-2"
              >
                <Zap className="h-3 w-3" />
                <span className="hidden md:inline">IA {stats?.resumen.ia_disponible ? "Activa" : "Inactiva"}</span>
              </Badge>
              {stats?.resumen.ia_disponible && (
                <span className="text-xs text-muted-foreground hidden lg:inline">
                  {stats.resumen.conversaciones_ia_hoy} hoy
                </span>
              )}
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2">
                <Label htmlFor="realtime" className="text-sm">
                  Tiempo Real
                </Label>
                <Switch id="realtime" checked={isRealTimeEnabled} onCheckedChange={setIsRealTimeEnabled} />
              </div>

              <Button onClick={() => setNotifications(!notifications)} variant="ghost" size="sm">
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>

              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
