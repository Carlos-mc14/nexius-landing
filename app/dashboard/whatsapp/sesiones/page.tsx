"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, MessageSquare, Send, StopCircle, Play, User, Phone, Activity, Calendar } from "lucide-react"
import { useApi, usePolling } from "@/hooks/use-whatsapp-api"
import { whatsappAPI } from "@/lib/whatsapp-api"
import { useWhatsApp } from "@/components/whatsapp/whatsapp-provider"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import type { SesionManual } from "@/types/whatsapp"

export default function SesionesPage() {
  const { currentUser, autoRefresh, refreshInterval } = useWhatsApp()
  const { toast } = useToast()
  const [nuevoNumero, setNuevoNumero] = useState("")
  const [mensajeModal, setMensajeModal] = useState("")
  const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionManual | null>(null)
  const [isEnviarOpen, setIsEnviarOpen] = useState(false)
  const [isIniciarOpen, setIsIniciarOpen] = useState(false)
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)

  // Sesiones activas con polling
  const {
    data: sesionesActivas,
    loading: loadingActivas,
    refetch: refetchActivas,
  } = usePolling(() => whatsappAPI.getSesionesActivas(), autoRefresh ? refreshInterval : 0)

  // Historial de sesiones
  const {
    data: sesionesHistorial,
    loading: loadingHistorial,
    refetch: refetchHistorial,
  } = useApi(() => whatsappAPI.getSesionesHistorial(), [])

  const handleIniciarSesion = async () => {
    if (!nuevoNumero.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un número de teléfono",
        variant: "destructive",
      })
      return
    }

    try {
      await whatsappAPI.iniciarSesionManual(nuevoNumero, currentUser)
      toast({
        title: "Sesión iniciada",
        description: `Sesión manual iniciada para ${nuevoNumero}`,
      })
      setNuevoNumero("")
      setIsIniciarOpen(false)
      refetchActivas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión manual",
        variant: "destructive",
      })
    }
  }

  const handleFinalizarSesion = async (sesionId: string) => {
    try {
      await whatsappAPI.finalizarSesionManual(sesionId)
      toast({
        title: "Sesión finalizada",
        description: "La sesión manual ha sido finalizada",
      })
      refetchActivas()
      refetchHistorial()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo finalizar la sesión",
        variant: "destructive",
      })
    }
  }

  const handleEnviarMensaje = async () => {
    if (!sesionSeleccionada || !mensajeModal.trim()) {
      toast({
        title: "Error",
        description: "Selecciona una sesión y escribe un mensaje",
        variant: "destructive",
      })
      return
    }

    setEnviandoMensaje(true)
    try {
      await whatsappAPI.enviarMensaje(sesionSeleccionada.numero, mensajeModal, currentUser)
      toast({
        title: "Mensaje enviado",
        description: "El mensaje se ha enviado correctamente",
      })
      setMensajeModal("")
      setIsEnviarOpen(false)
      refetchActivas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setEnviandoMensaje(false)
    }
  }

  const getTiempoSesion = (inicio: string) => {
    const minutos = differenceInMinutes(new Date(), new Date(inicio))
    if (minutos < 60) {
      return `${minutos} min`
    }
    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60
    return `${horas}h ${minutosRestantes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sesiones Manuales</h1>
          <p className="text-muted-foreground">Gestiona las sesiones de chat manual de WhatsApp</p>
        </div>
        <Dialog open={isIniciarOpen} onOpenChange={setIsIniciarOpen}>
          <DialogTrigger asChild>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Iniciar Sesión Manual</DialogTitle>
              <DialogDescription>Inicia una nueva sesión de chat manual con un usuario</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Teléfono</Label>
                <Input
                  placeholder="Ej: +1234567890"
                  value={nuevoNumero}
                  onChange={(e) => setNuevoNumero(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Agente</Label>
                <Input value={currentUser} disabled />
              </div>
              <Button onClick={handleIniciarSesion} className="w-full">
                Iniciar Sesión
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activas" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sesiones Activas ({sesionesActivas?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Sesiones Activas */}
        <TabsContent value="activas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Sesiones Activas
              </CardTitle>
              <CardDescription>Sesiones de chat manual actualmente en curso</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingActivas ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="h-8 w-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !sesionesActivas || sesionesActivas.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay sesiones activas</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Inicia una nueva sesión para comenzar a chatear manualmente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sesionesActivas.map((sesion: SesionManual) => (
                    <div
                      key={sesion._id}
                      className="p-4 border rounded-lg bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900">
                            <User className="h-5 w-5 text-green-600 dark:text-green-300" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{sesion.usuario_nombre}</h3>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                Activa
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {sesion.numero}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {sesion.agente}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTiempoSesion(sesion.inicio)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {sesion.mensajes_enviados} mensajes
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Dialog
                            open={isEnviarOpen && sesionSeleccionada?._id === sesion._id}
                            onOpenChange={setIsEnviarOpen}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSesionSeleccionada(sesion)}>
                                <Send className="h-4 w-4 mr-2" />
                                Enviar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enviar Mensaje</DialogTitle>
                                <DialogDescription>
                                  Enviar mensaje a {sesion.usuario_nombre} ({sesion.numero})
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Mensaje</Label>
                                  <Textarea
                                    placeholder="Escribe tu mensaje aquí..."
                                    value={mensajeModal}
                                    onChange={(e) => setMensajeModal(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                                <Button
                                  onClick={handleEnviarMensaje}
                                  disabled={enviandoMensaje || !mensajeModal.trim()}
                                  className="w-full"
                                >
                                  {enviandoMensaje ? "Enviando..." : "Enviar Mensaje"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button variant="destructive" size="sm" onClick={() => handleFinalizarSesion(sesion._id)}>
                            <StopCircle className="h-4 w-4 mr-2" />
                            Finalizar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historial */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historial de Sesiones
              </CardTitle>
              <CardDescription>Sesiones manuales finalizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistorial ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="h-6 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !sesionesHistorial || sesionesHistorial.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay sesiones en el historial</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sesionesHistorial.map((sesion: SesionManual) => (
                    <div key={sesion._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{sesion.usuario_nombre}</h3>
                              <Badge variant="secondary">Finalizada</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {sesion.numero}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {sesion.agente}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {sesion.fin
                                  ? `${differenceInMinutes(new Date(sesion.fin), new Date(sesion.inicio))} min`
                                  : "Duración desconocida"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {sesion.mensajes_enviados} mensajes
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(sesion.inicio), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
