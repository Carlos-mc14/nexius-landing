"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, MessageSquare, UserCheck } from "lucide-react"
import type { ChatUser } from "../types"

interface UsersTabProps {
  usuarios: ChatUser[]
  onToggleIA: (numero: string, usar_ia: boolean) => void
  onSelectUser: (numero: string) => void
  onStartManualSession: (numero: string) => void
  onSwitchToChat: () => void
}

export function UsersTab({ usuarios, onToggleIA, onSelectUser, onStartManualSession, onSwitchToChat }: UsersTabProps) {
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
                <Users className="h-5 w-5" />
                Usuarios Registrados
              </CardTitle>
              <CardDescription>Lista de todos los usuarios que han interactuado con el bot</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm w-fit">
              {usuarios.length} usuarios
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-background overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[200px]">Usuario</TableHead>
                    <TableHead className="min-w-[120px]">Estado</TableHead>
                    <TableHead className="min-w-[120px]">Interacciones</TableHead>
                    <TableHead className="min-w-[100px]">IA</TableHead>
                    <TableHead className="min-w-[120px]">Última Actividad</TableHead>
                    <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario._id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                              {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : usuario.numero.slice(-2)}
                            </div>
                            {usuario.is_online && (
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">
                              {usuario.nombre || "Sin nombre"}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">{usuario.numero}</div>
                            {usuario.email && (
                              <div className="text-xs sm:text-sm text-muted-foreground truncate">{usuario.email}</div>
                            )}
                            {usuario.empresa && (
                              <div className="text-xs text-muted-foreground truncate">{usuario.empresa}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-xs w-fit">
                            {usuario.estado_conversacion}
                          </Badge>
                          {usuario.is_online && (
                            <Badge variant="default" className="text-xs w-fit">
                              En línea
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm sm:text-base">{usuario.total_interacciones}</span>
                          {usuario.unread_count && usuario.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {usuario.unread_count} nuevos
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={usuario.preferencias?.usa_ia || false}
                            onCheckedChange={(checked) => onToggleIA(usuario.numero, checked)}
                          />
                          <Badge variant={usuario.preferencias?.usa_ia ? "default" : "secondary"} className="text-xs">
                            {usuario.preferencias?.usa_ia ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs sm:text-sm">
                          {new Date(usuario.ultima_actividad).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(usuario.ultima_actividad).toLocaleTimeString("es-ES", {
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
                            onClick={() => handleChatClick(usuario.numero)}
                            title="Ver conversación"
                          >
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStartManualSession(usuario.numero)}
                            title="Iniciar sesión manual"
                          >
                            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
