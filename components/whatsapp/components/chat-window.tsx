"use client"

import { useEffect, useRef } from "react"
import { CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Archive, ArchiveRestore, XCircle, UserCheck, Send, MessageSquare, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatUser, Conversacion, SesionManual, ChatFilter } from "../types"

interface ChatWindowProps {
  selectedUser: string
  usuarios: ChatUser[]
  conversaciones: Conversacion[]
  sesiones: SesionManual[]
  messageText: string
  setMessageText: (text: string) => void
  onSendMessage: () => void
  onToggleIA: (numero: string, usar_ia: boolean) => void
  onArchivar: (numero: string) => void
  onDesarchivar: (numero: string) => void
  onStartManualSession: (numero: string, motivo?: string) => void
  onEndManualSession: (numero: string) => void
  chatFilter: ChatFilter
}

export function ChatWindow({
  selectedUser,
  usuarios,
  conversaciones,
  sesiones,
  messageText,
  setMessageText,
  onSendMessage,
  onToggleIA,
  onArchivar,
  onDesarchivar,
  onStartManualSession,
  onEndManualSession,
  chatFilter,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const currentUser = usuarios.find((u) => u.numero === selectedUser)
  const currentSession = sesiones.find((s) => s.numero === selectedUser)

  // Auto-scroll to bottom when new messages arrive - FIXED
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversaciones.length])

  // Scroll to bottom when user changes - FIXED
  useEffect(() => {
    if (selectedUser && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      }, 100)
    }
  }, [selectedUser])

  return (
    <>
      {/* Header del chat */}
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                {currentUser?.nombre?.charAt(0).toUpperCase() || selectedUser.slice(-2)}
              </div>
              {currentUser?.is_online && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            <div>
              <div className="font-medium text-sm sm:text-base">{currentUser?.nombre || selectedUser}</div>
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                {selectedUser}
                {currentUser?.is_online ? (
                  <span className="text-green-500 text-xs">• En línea</span>
                ) : (
                  <span className="text-muted-foreground text-xs">• Desconectado</span>
                )}
              </div>
            </div>
          </div>

          {/* Acciones del chat */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* Toggle IA */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="ia-toggle" className="text-xs">
                IA
              </Label>
              <Switch
                id="ia-toggle"
                checked={currentUser?.preferencias?.usa_ia || false}
                onCheckedChange={(checked) => onToggleIA(selectedUser, checked)}
              />
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Archivar/Desarchivar */}
            {currentUser?.has_archived ? (
              <Button size="sm" variant="outline" onClick={() => onDesarchivar(selectedUser)}>
                <ArchiveRestore className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Desarchivar</span>
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onArchivar(selectedUser)}>
                <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Archivar</span>
              </Button>
            )}

            {/* Sesión manual */}
            {currentSession ? (
              <Button size="sm" variant="destructive" onClick={() => onEndManualSession(selectedUser)}>
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Finalizar</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={() => onStartManualSession(selectedUser, "Iniciado desde chat")}
              >
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Manual</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Mensajes */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-550px)] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {conversaciones.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay mensajes en esta conversación</p>
                {chatFilter.showArchived && <p className="text-sm mt-2">Mostrando conversaciones archivadas</p>}
              </div>
            ) : (
              conversaciones.map((conv) => (
                <div key={conv._id} className={cn("flex", conv.tipo === "recibido" ? "justify-start" : "justify-end")}>
                  <div
                    className={cn(
                      "max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm",
                      conv.tipo === "recibido"
                        ? "bg-background border text-foreground"
                        : conv.generado_por_ia
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                          : conv.tipo === "enviado_manual"
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
                      conv.archivado && "opacity-60",
                    )}
                  >
                    <div className="text-sm leading-relaxed break-words">{conv.mensaje}</div>
                    <div className="text-xs opacity-70 mt-2 flex items-center justify-between">
                      <span>
                        {new Date(conv.timestamp).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex items-center space-x-1">
                        {conv.generado_por_ia && <Bot className="h-3 w-3" />}
                        {conv.en_modo_manual && <UserCheck className="h-3 w-3" />}
                        {conv.archivado && <Archive className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input de mensaje */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2 sm:gap-3">
          <Textarea
            placeholder="Escribe tu mensaje..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 min-h-[60px] resize-none text-sm"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSendMessage()
              }
            }}
          />
          <Button onClick={onSendMessage} className="self-end h-[60px] px-4 sm:px-6" disabled={!messageText.trim()}>
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 text-xs text-muted-foreground gap-2">
          <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
          {currentSession && (
            <Badge variant="outline" className="text-xs w-fit">
              Modo Manual Activo
            </Badge>
          )}
        </div>
      </div>
    </>
  )
}
