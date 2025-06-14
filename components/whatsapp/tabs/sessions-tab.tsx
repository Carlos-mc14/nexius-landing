"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck, XCircle } from "lucide-react"
import type { SesionManual } from "../types"

interface SessionsTabProps {
  sesiones: SesionManual[]
  onEndSession: (numero: string) => void
}

export function SessionsTab({ sesiones, onEndSession }: SessionsTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Sesiones Manuales
              </CardTitle>
              <CardDescription>Gestiona las sesiones de atención manual en curso</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm w-fit">
              {sesiones.length} activas
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {sesiones.length > 0 ? (
            <div className="rounded-md border bg-background overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="min-w-[150px]">Usuario</TableHead>
                      <TableHead className="min-w-[100px]">Agente</TableHead>
                      <TableHead className="min-w-[150px]">Motivo</TableHead>
                      <TableHead className="min-w-[120px]">Inicio</TableHead>
                      <TableHead className="min-w-[100px]">Mensajes</TableHead>
                      <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sesiones.map((sesion) => (
                      <TableRow key={sesion._id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                              {sesion.numero.slice(-2)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm sm:text-base truncate">{sesion.numero}</div>
                              <Badge variant="default" className="text-xs">
                                Activa
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{sesion.agente_id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate">{sesion.motivo}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs sm:text-sm">
                            {new Date(sesion.inicio).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {sesion.mensajes_intercambiados}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onEndSession(sesion.numero)}
                            title="Finalizar sesión"
                          >
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Finalizar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay sesiones manuales activas</h3>
              <p className="text-sm">Las sesiones manuales aparecerán aquí cuando se inicien</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
