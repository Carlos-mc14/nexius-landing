"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Users, MessageSquare, Calendar, Building, Phone, Mail, Activity } from "lucide-react"
import { useApi } from "@/hooks/use-whatsapp-api"
import { whatsappAPI } from "@/lib/whatsapp-api"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Usuario } from "@/types/whatsapp"

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [isHistorialOpen, setIsHistorialOpen] = useState(false)

  const { data: usuarios, loading, error, refetch } = useApi(() => whatsappAPI.getUsuarios(searchTerm), [searchTerm])

  const { data: conversacion, loading: conversacionLoading } = useApi(
    () =>
      selectedUser ? whatsappAPI.getConversacion(selectedUser.numero) : Promise.resolve({ success: true, data: null }),
    [selectedUser],
  )

  const filteredUsuarios =
    usuarios?.filter(
      (usuario: Usuario) =>
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.numero.includes(searchTerm) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios de WhatsApp</h1>
          <p className="text-muted-foreground">Lista de usuarios registrados en el sistema</p>
        </div>
        <Button onClick={refetch} disabled={loading}>
          Actualizar
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios ({filteredUsuarios.length})
          </CardTitle>
          <CardDescription>Usuarios que han interactuado con el bot de WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-20 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsuarios.map((usuario: Usuario) => (
                <div
                  key={usuario._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{usuario.nombre}</h3>
                        <Badge variant="outline">{usuario.total_interacciones} interacciones</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {usuario.numero}
                        </span>
                        {usuario.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {usuario.email}
                          </span>
                        )}
                        {usuario.empresa && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {usuario.empresa}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Registrado{" "}
                          {formatDistanceToNow(new Date(usuario.fecha_registro), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Última actividad{" "}
                          {formatDistanceToNow(new Date(usuario.ultima_actividad), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Dialog open={isHistorialOpen && selectedUser?._id === usuario._id} onOpenChange={setIsHistorialOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedUser(usuario)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ver historial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Historial de Conversaciones</DialogTitle>
                        <DialogDescription>
                          Conversaciones de {selectedUser?.nombre} ({selectedUser?.numero})
                        </DialogDescription>
                      </DialogHeader>

                      {selectedUser && (
                        <div className="space-y-4">
                          {/* Información del usuario */}
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="grid gap-2 md:grid-cols-2">
                              <div>
                                <p className="text-sm font-medium">Información Personal</p>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Nombre: {selectedUser.nombre}</p>
                                  <p>Teléfono: {selectedUser.numero}</p>
                                  {selectedUser.email && <p>Email: {selectedUser.email}</p>}
                                  {selectedUser.empresa && <p>Empresa: {selectedUser.empresa}</p>}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Estadísticas</p>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Total interacciones: {selectedUser.total_interacciones}</p>
                                  <p>Fecha registro: {new Date(selectedUser.fecha_registro).toLocaleDateString()}</p>
                                  <p>
                                    Última actividad: {new Date(selectedUser.ultima_actividad).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Historial de mensajes */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Historial de Mensajes</h4>
                            {conversacionLoading ? (
                              <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className="p-3 bg-muted rounded-lg animate-pulse">
                                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                                  </div>
                                ))}
                              </div>
                            ) : conversacion?.mensajes && conversacion.mensajes.length > 0 ? (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {conversacion.mensajes.map((mensaje, index) => (
                                  <div
                                    key={mensaje._id || index}
                                    className={`p-3 rounded-lg ${
                                      mensaje.tipo === "automatico"
                                        ? "bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-950"
                                        : "bg-green-50 border-l-4 border-green-500 dark:bg-green-950"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <Badge variant={mensaje.tipo === "automatico" ? "default" : "secondary"}>
                                        {mensaje.tipo === "automatico" ? "Bot" : "Manual"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(mensaje.timestamp), {
                                          addSuffix: true,
                                          locale: es,
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm">{mensaje.contenido}</p>
                                    {mensaje.enviado_por && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Enviado por: {mensaje.enviado_por}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No hay mensajes registrados</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
