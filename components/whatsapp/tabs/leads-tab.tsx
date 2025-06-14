"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, XCircle, TrendingUp, UserCheck, MessageSquare, AlertTriangle, Star } from "lucide-react"
import type { Lead, LeadFilter } from "../types"

interface LeadsTabProps {
  leads: Lead[]
  leadFilter: LeadFilter
  setLeadFilter: (filter: LeadFilter) => void
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void
  onStartManualSession: (numero: string, motivo?: string) => void
  onSelectUser: (numero: string) => void
  onSwitchToChat: () => void
}

export function LeadsTab({
  leads,
  leadFilter,
  setLeadFilter,
  onUpdateLead,
  onStartManualSession,
  onSelectUser,
  onSwitchToChat,
}: LeadsTabProps) {
  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesEstado = !leadFilter.estado || leadFilter.estado === "all" || lead.estado === leadFilter.estado
    const matchesServicio =
      !leadFilter.servicio || lead.servicio.toLowerCase().includes(leadFilter.servicio.toLowerCase())
    const matchesPrioridad =
      !leadFilter.prioridad || leadFilter.prioridad === "all" || lead.prioridad === leadFilter.prioridad
    const matchesSearch =
      !leadFilter.search ||
      lead.numero.includes(leadFilter.search) ||
      lead.usuario_info.nombre.toLowerCase().includes(leadFilter.search.toLowerCase()) ||
      lead.servicio.toLowerCase().includes(leadFilter.search.toLowerCase())

    return matchesEstado && matchesServicio && matchesPrioridad && matchesSearch
  })

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "destructive"
      case "alta":
        return "default"
      case "normal":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleChatClick = (numero: string) => {
    onSelectUser(numero)
    onSwitchToChat()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Gestión de Leads
              </CardTitle>
              <CardDescription>Administra y da seguimiento a los leads generados por el bot</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm w-fit">
              {filteredLeads.length} de {leads.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros responsive */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                value={leadFilter.search}
                onChange={(e) => setLeadFilter({ ...leadFilter, search: e.target.value })}
                className="flex-1"
              />
            </div>

            <Select
              value={leadFilter.estado}
              onValueChange={(value) => setLeadFilter({ ...leadFilter, estado: value })}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="nuevo">Nuevo</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={leadFilter.prioridad}
              onValueChange={(value) => setLeadFilter({ ...leadFilter, prioridad: value })}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setLeadFilter({ estado: "", servicio: "", prioridad: "", search: "" })}
              className="w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>

          {/* Tabla responsive */}
          <div className="rounded-md border bg-background overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[200px]">Cliente</TableHead>
                    <TableHead className="min-w-[150px]">Servicio</TableHead>
                    <TableHead className="min-w-[120px]">Estado</TableHead>
                    <TableHead className="min-w-[100px]">Prioridad</TableHead>
                    <TableHead className="min-w-[100px]">Fecha</TableHead>
                    <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead._id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                            {lead.usuario_info.nombre
                              ? lead.usuario_info.nombre.charAt(0).toUpperCase()
                              : lead.numero.slice(-2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">
                              {lead.usuario_info.nombre || "Sin nombre"}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">{lead.numero}</div>
                            {lead.usuario_info.email && (
                              <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                {lead.usuario_info.email}
                              </div>
                            )}
                            {lead.usuario_info.empresa && (
                              <div className="text-xs text-muted-foreground truncate">{lead.usuario_info.empresa}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{lead.servicio}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground max-w-xs truncate">
                            {lead.mensaje}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.estado}
                          onValueChange={(value) => onUpdateLead(lead._id, { estado: value as any })}
                        >
                          <SelectTrigger className="w-full min-w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nuevo">Nuevo</SelectItem>
                            <SelectItem value="en_proceso">En Proceso</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPrioridadColor(lead.prioridad)} className="text-xs">
                          {lead.prioridad === "urgente" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {lead.prioridad === "alta" && <Star className="h-3 w-3 mr-1" />}
                          {lead.prioridad}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs sm:text-sm">
                          {new Date(lead.timestamp).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(lead.timestamp).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStartManualSession(lead.numero, `Lead: ${lead.servicio}`)}
                            title="Iniciar sesión manual"
                          >
                            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChatClick(lead.numero)}
                            title="Ver conversación"
                          >
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron leads con los filtros aplicados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
