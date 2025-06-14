"use client"

import { CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatUser, ChatFilter } from "../types"

interface ChatUserListProps {
  usuarios: ChatUser[]
  selectedUser: string
  chatFilter: ChatFilter
  setChatFilter: (filter: ChatFilter) => void
  onUserSelect: (numero: string) => void
}

export function ChatUserList({ usuarios, selectedUser, chatFilter, setChatFilter, onUserSelect }: ChatUserListProps) {
  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chats</CardTitle>
          <Badge variant="outline" className="text-xs">
            {usuarios.length}
          </Badge>
        </div>

        {/* Filtros de chat */}
        <div className="space-y-2">
          <Input
            placeholder="Buscar usuario..."
            value={chatFilter.search}
            onChange={(e) => setChatFilter({ ...chatFilter, search: e.target.value })}
            className="h-8"
          />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-archived"
                checked={chatFilter.showArchived}
                onCheckedChange={(checked) => setChatFilter({ ...chatFilter, showArchived: checked })}
              />
              <Label htmlFor="show-archived" className="text-xs">
                Archivados
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="online-only"
                checked={chatFilter.onlineOnly}
                onCheckedChange={(checked) => setChatFilter({ ...chatFilter, onlineOnly: checked })}
              />
              <Label htmlFor="online-only" className="text-xs">
                Solo en línea
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-450px)]">
          <div className="space-y-1 p-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario._id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                  selectedUser === usuario.numero ? "bg-primary/10 border-primary/20 border" : "hover:bg-muted/50",
                  usuario.has_archived && "opacity-60",
                )}
                onClick={() => onUserSelect(usuario.numero)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                        {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : usuario.numero.slice(-2)}
                      </div>
                      {usuario.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{usuario.nombre || usuario.numero}</div>
                      <div className="text-xs text-muted-foreground truncate">{usuario.numero}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(usuario.ultima_actividad).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {usuario.unread_count && usuario.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 w-5 p-0 flex items-center justify-center">
                        {usuario.unread_count}
                      </Badge>
                    )}
                    <div className="flex items-center space-x-1">
                      {usuario.preferencias?.usa_ia && <Bot className="h-3 w-3 text-purple-500" />}
                      {usuario.has_archived && <Archive className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  )
}
