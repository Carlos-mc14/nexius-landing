"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  Building,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { useApi, useLocalStorage } from "@/hooks/use-whatsapp-api"
import { whatsappAPI } from "@/lib/whatsapp-api"
import { useWhatsApp } from "@/components/whatsapp/whatsapp-provider"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Lead, LeadFilters } from "@/types/whatsapp"

export default function LeadsPage() {
  const { currentUser } = useWhatsApp()
  const { toast } = useToast()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [newNote, setNewNote] = useState("")
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Filtros persistentes
  const [filters, setFilters] = useLocalStorage<LeadFilters>("whatsapp-lead-filters", {
    page: 1,
    limit: 50,
  })

  const { data: leadsResponse, loading, error, refetch } = useApi(() => whatsappAPI.getLeads(filters), [filters])

  const leads = leadsResponse?.data || []
  const totalPages = Math.ceil((leadsResponse?.total || 0) / (filters.limit || 50))

  const handleFilterChange = (key: keyof LeadFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset page when changing other filters
    }))
  }

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      await whatsappAPI.updateLead(leadId, updates)
      toast({
        title: "Lead actualizado",
        description: "Los cambios se han guardado correctamente",
      })
      refetch()
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead({ ...selectedLead, ...updates })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el lead",
        variant: "destructive",
      })
    }
  }

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return

    try {
      const response = await whatsappAPI.addLeadNote(selectedLead._id, newNote, currentUser)
      toast({
        title: "Nota agregada",
        description: "La nota se ha guardado correctamente",
      })
      setNewNote("")
      setSelectedLead(response.data)
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar la nota",
        variant: "destructive",
      })
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Leads</h1>
          <p className="text-muted-foreground">Administra y da seguimiento a los leads generados por WhatsApp</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, teléfono..."
                  className="pl-8"
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filters.estado || "todos"}
                onValueChange={(value) => handleFilterChange("estado", value === "todos" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={filters.prioridad || "todas"}
                onValueChange={(value) => handleFilterChange("prioridad", value === "todas" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Servicio</Label>
              <Select
                value={filters.servicio || "todos"}
                onValueChange={(value) => handleFilterChange("servicio", value === "todos" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="desarrollo_web">Desarrollo Web</SelectItem>
                  <SelectItem value="desarrollo_movil">Desarrollo Móvil</SelectItem>
                  <SelectItem value="consultoria">Consultoría</SelectItem>
                  <SelectItem value="soporte">Soporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Asignado a</Label>
              <Select
                value={filters.asignado_a || "todos"}
                onValueChange={(value) => handleFilterChange("asignado_a", value === "todos" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agente1">Agente 1</SelectItem>
                  <SelectItem value="agente2">Agente 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ page: 1, limit: 50 })} className="w-full">
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads ({leadsResponse?.total || 0})</CardTitle>
              <CardDescription>
                Página {filters.page} de {totalPages}
              </CardDescription>
            </div>
            <Button onClick={refetch} disabled={loading}>
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron leads</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead: Lead) => (
                <div
                  key={lead._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    {getEstadoIcon(lead.estado)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{lead.usuario_info.nombre || "Sin nombre"}</h3>
                        <Badge variant={getPriorityColor(lead.prioridad) as any}>{lead.prioridad}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.numero}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {lead.usuario_info.empresa || "Sin empresa"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(lead.timestamp), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{lead.servicio}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Select
                      value={lead.estado}
                      onValueChange={(value) => handleUpdateLead(lead._id, { estado: value as any })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuevo">Nuevo</SelectItem>
                        <SelectItem value="en_proceso">En Proceso</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
                        <SelectItem value="cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Dialog open={isDetailOpen && selectedLead?._id === lead._id} onOpenChange={setIsDetailOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalle del Lead</DialogTitle>
                          <DialogDescription>Información completa y historial de notas</DialogDescription>
                        </DialogHeader>

                        {selectedLead && (
                          <div className="space-y-6">
                            {/* Información del usuario */}
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Información del Usuario</Label>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Nombre:</strong> {selectedLead.usuario_info.nombre || "Sin nombre"}
                                  </p>
                                  <p>
                                    <strong>Teléfono:</strong> {selectedLead.numero}
                                  </p>
                                  <p>
                                    <strong>Email:</strong> {selectedLead.usuario_info.email || "Sin email"}
                                  </p>
                                  <p>
                                    <strong>Empresa:</strong> {selectedLead.usuario_info.empresa || "Sin empresa"}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Información del Lead</Label>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Servicio:</strong> {selectedLead.servicio}
                                  </p>
                                  <p>
                                    <strong>Estado:</strong> {selectedLead.estado}
                                  </p>
                                  <p>
                                    <strong>Prioridad:</strong> {selectedLead.prioridad}
                                  </p>
                                  <p>
                                    <strong>Asignado a:</strong> {selectedLead.asignado_a || "Sin asignar"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Mensaje inicial */}
                            <div className="space-y-2">
                              <Label>Mensaje Inicial</Label>
                              <div className="p-3 bg-muted rounded-lg text-sm">{selectedLead.mensaje}</div>
                            </div>

                            {/* Historial de notas */}
                            <div className="space-y-2">
                              <Label>Historial de Notas</Label>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedLead.notas_agente.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No hay notas registradas</p>
                                ) : (
                                  selectedLead.notas_agente.map((nota, index) => (
                                    <div key={index} className="p-3 bg-muted rounded-lg">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-medium">{nota.agente}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDistanceToNow(new Date(nota.timestamp), {
                                            addSuffix: true,
                                            locale: es,
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-sm">{nota.nota}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Agregar nueva nota */}
                            <div className="space-y-2">
                              <Label>Agregar Nota</Label>
                              <Textarea
                                placeholder="Escribe una nota sobre este lead..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                              />
                              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                Agregar Nota
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {((filters.page || 1) - 1) * (filters.limit || 50) + 1} a{" "}
                {Math.min((filters.page || 1) * (filters.limit || 50), leadsResponse?.total || 0)} de{" "}
                {leadsResponse?.total || 0} leads
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
                  disabled={(filters.page || 1) <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {filters.page || 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
                  disabled={(filters.page || 1) >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
