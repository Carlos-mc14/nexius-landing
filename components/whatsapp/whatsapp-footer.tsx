"use client"

import type { Estadisticas } from "../../types/whatsapp"

interface WhatsAppFooterProps {
  isConnected: boolean
  isRealTimeEnabled: boolean
  stats: Estadisticas | null
}

export function WhatsAppFooter({ isConnected, isRealTimeEnabled, stats }: WhatsAppFooterProps) {
  return (
    <div className="bg-background border-t border-border">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground gap-4">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span>API: {isConnected ? "Conectada" : "Desconectada"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? "bg-blue-500" : "bg-gray-400"}`}></div>
              <span>Tiempo Real: {isRealTimeEnabled ? "Activo" : "Inactivo"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${stats?.resumen.ia_disponible ? "bg-purple-500" : "bg-gray-400"}`}
              ></div>
              <span>IA: {stats?.resumen.ia_disponible ? "Disponible" : "No disponible"}</span>
            </div>
          </div>
          <div className="text-xs">© 2024 NEXIUS - Panel de Control del Bot WhatsApp</div>
        </div>
      </div>
    </div>
  )
}
