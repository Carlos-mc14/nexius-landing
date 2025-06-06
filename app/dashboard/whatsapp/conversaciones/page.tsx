"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Send, Bot, User, Phone } from "lucide-react"
import { useApi } from "@/hooks/use-whatsapp-api"
import { whatsappAPI } from "@/lib/whatsapp-api"
import { useWhatsApp } from "@/components/whatsapp/whatsapp-provider"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function ConversacionesPage() {
  const { currentUser } = useWhatsApp()
  const { toast } = useToast()
  const [numeroTelefono, setNumeroTelefono] = useState("")
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)

  const {
    data: conversacion,
    loading,
    error,
    refetch,
  } = useApi(
    () =>
      numeroTelefono ? whatsappAPI.getConversacion(numeroTelefono) : Promise.resolve({ success: true, data: null }),
    [numeroTelefono],
  )

  const handleBuscarConversacion = () => {
    if (!numeroTelefono.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un número de teléfono",
        variant: "destructive",
      })
      return
    }
    refetch()
  }

  const handleEnviarMensaje = async () => {
    if (!numeroTelefono.trim() || !nuevoMensaje.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un número de teléfono y un mensaje",
        variant: "destructive",
      })
      return
    }

    setEnviandoMensaje(true)
    try {
      await whatsappAPI.enviarMensaje(numeroTelefono, nuevoMensaje, currentUser)
      toast({
        title: "Mensaje enviado",
        description: "El mensaje se ha enviado correctamente",
      })
      setNuevoMensaje("")
      refetch()
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

  const handleIniciarSesionManual = async () => {
    if (!numeroTelefono.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un número de teléfono",
        variant: "destructive",
      })
      return
    }

    try {
      await whatsappAPI.iniciarSesionManual(numeroTelefono, currentUser)
      toast({
        title: "Sesión iniciada",
        description: "Se ha iniciado una sesión manual para este número",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión manual",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversaciones</h1>
          <p className="text-muted-foreground">Busca y visualiza el historial de conversaciones de WhatsApp</p>
        </div>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Conversación
          </CardTitle>
          <CardDescription>Ingresa el número de teléfono para ver el historial de mensajes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Número de teléfono (ej: +1234567890)"
                className="pl-8"
                value={numeroTelefono}
                onChange={(e) => setNumeroTelefono(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleBuscarConversacion()}
              />
            </div>
            <Button onClick={handleBuscarConversacion} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={handleIniciarSesionManual}>
              Iniciar Sesión Manual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversación */}
      {numeroTelefono && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chat */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversación con {numeroTelefono}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-8 w-8 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : !conversacion ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Busca un número para ver la conversación</p>
                </div>
              ) : conversacion.mensajes.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay mensajes en esta conversación</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversacion.mensajes.map((mensaje, index) => (
                    <div
                      key={mensaje._id || index}
                      className={`flex gap-3 ${mensaje.tipo === "manual" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          mensaje.tipo === "automatico"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        }`}
                      >
                        {mensaje.tipo === "automatico" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className={`flex-1 max-w-xs ${mensaje.tipo === "manual" ? "text-right" : ""}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            mensaje.tipo === "automatico"
                              ? "bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                              : "bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800"
                          }`}
                        >
                          <p className="text-sm">{mensaje.contenido}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge variant={mensaje.tipo === "automatico" ? "default" : "secondary"} className="text-xs">
                            {mensaje.tipo === "automatico" ? "Bot" : "Manual"}
                          </Badge>
                          <span>
                            {formatDistanceToNow(new Date(mensaje.timestamp), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                          {mensaje.enviado_por && <span>• {mensaje.enviado_por}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Mensaje
              </CardTitle>
              <CardDescription>Envía un mensaje manual a este número</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Escribe tu mensaje aquí..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                />
              </div>
              <Button
                onClick={handleEnviarMensaje}
                disabled={enviandoMensaje || !numeroTelefono.trim() || !nuevoMensaje.trim()}
                className="w-full"
              >
                {enviandoMensaje ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Usuario actual:</strong> {currentUser}
                </p>
                <p className="text-xs text-muted-foreground">
                  Los mensajes manuales aparecerán en verde y se marcarán con tu nombre de usuario.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
