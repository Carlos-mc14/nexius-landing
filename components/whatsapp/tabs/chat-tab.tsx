"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, MessageCircle } from "lucide-react"
import { ChatUserList } from "../components/chat-user-list"
import { ChatWindow } from "../components/chat-window"
import type { ChatUser, Conversacion, SesionManual, ChatFilter } from "../types"

interface ChatTabProps {
  usuarios: ChatUser[]
  conversaciones: Conversacion[]
  sesiones: SesionManual[]
  selectedUser: string
  messageText: string
  setMessageText: (text: string) => void
  chatFilter: ChatFilter
  setChatFilter: (filter: ChatFilter) => void
  isChatSidebarOpen: boolean
  setIsChatSidebarOpen: (open: boolean) => void
  onUserSelect: (numero: string) => void
  onSendMessage: () => void
  onToggleIA: (numero: string, usar_ia: boolean) => void
  onArchivar: (numero: string) => void
  onDesarchivar: (numero: string) => void
  onStartManualSession: (numero: string, motivo?: string) => void
  onEndManualSession: (numero: string) => void
}

export function ChatTab({
  usuarios,
  conversaciones,
  sesiones,
  selectedUser,
  messageText,
  setMessageText,
  chatFilter,
  setChatFilter,
  isChatSidebarOpen,
  setIsChatSidebarOpen,
  onUserSelect,
  onSendMessage,
  onToggleIA,
  onArchivar,
  onDesarchivar,
  onStartManualSession,
  onEndManualSession,
}: ChatTabProps) {
  // Filter users
  const filteredUsuarios = usuarios
    .filter((usuario) => {
      const matchesSearch =
        !chatFilter.search ||
        usuario.numero.includes(chatFilter.search) ||
        usuario.nombre.toLowerCase().includes(chatFilter.search.toLowerCase())
      const matchesOnline = !chatFilter.onlineOnly || usuario.is_online
      const matchesArchived = chatFilter.showArchived || !usuario.has_archived

      return matchesSearch && matchesOnline && matchesArchived
    })
    .sort((a, b) => {
      const aUnread = a.unread_count || 0
      const bUnread = b.unread_count || 0

      if (aUnread !== bUnread) {
        return bUnread - aUnread
      }

      return new Date(b.ultima_actividad).getTime() - new Date(a.ultima_actividad).getTime()
    })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
        {/* Lista de usuarios - Mobile Sheet, Desktop Sidebar */}
        <div className="lg:col-span-1 lg:block">
          {/* Mobile: Sheet trigger */}
          <div className="lg:hidden mb-4">
            <Sheet open={isChatSidebarOpen} onOpenChange={setIsChatSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Menu className="h-4 w-4 mr-2" />
                  Chats ({filteredUsuarios.length})
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <ChatUserList
                  usuarios={filteredUsuarios}
                  selectedUser={selectedUser}
                  chatFilter={chatFilter}
                  setChatFilter={setChatFilter}
                  onUserSelect={onUserSelect}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop: Fixed sidebar */}
          <Card className="hidden lg:block h-full">
            <ChatUserList
              usuarios={filteredUsuarios}
              selectedUser={selectedUser}
              chatFilter={chatFilter}
              setChatFilter={setChatFilter}
              onUserSelect={onUserSelect}
            />
          </Card>
        </div>

        {/* Chat principal */}
        <Card className="lg:col-span-3 flex flex-col h-full">
          {selectedUser ? (
            <ChatWindow
              selectedUser={selectedUser}
              usuarios={usuarios}
              conversaciones={conversaciones}
              sesiones={sesiones}
              messageText={messageText}
              setMessageText={setMessageText}
              onSendMessage={onSendMessage}
              onToggleIA={onToggleIA}
              onArchivar={onArchivar}
              onDesarchivar={onDesarchivar}
              onStartManualSession={onStartManualSession}
              onEndManualSession={onEndManualSession}
              chatFilter={chatFilter}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
                <p className="text-sm">Elige un usuario de la lista para comenzar a chatear</p>
                <Button variant="outline" className="mt-4 lg:hidden" onClick={() => setIsChatSidebarOpen(true)}>
                  Ver chats
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
