import type {
  Lead,
  Usuario,
  Conversacion,
  SesionManual,
  WhatsAppStats,
  ApiResponse,
  LeadFilters,
} from "@/types/whatsapp"

const BASE_URL = "https://api.nexius.lat"
const VERIFY_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_VERIFY_TOKEN || "TOKEN"

class WhatsAppAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, BASE_URL)
    url.searchParams.set("verify_token", VERIFY_TOKEN)

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Leads
  async getLeads(filters: LeadFilters = {}): Promise<ApiResponse<Lead[]>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, value.toString())
      }
    })

    return this.request<Lead[]>(`/api/leads?${params.toString()}`)
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/api/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async addLeadNote(id: string, nota: string, agente: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/api/leads/${id}/notas`, {
      method: "POST",
      body: JSON.stringify({ nota, agente }),
    })
  }

  // Usuarios
  async getUsuarios(search?: string): Promise<ApiResponse<Usuario[]>> {
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    return this.request<Usuario[]>(`/api/usuarios${params}`)
  }

  // Conversaciones
  async getConversacion(numero: string): Promise<ApiResponse<Conversacion>> {
    return this.request<Conversacion>(`/api/conversaciones/${numero}`)
  }

  // Sesiones manuales
  async getSesionesActivas(): Promise<ApiResponse<SesionManual[]>> {
    return this.request<SesionManual[]>("/api/sesiones-manuales?estado=activa")
  }

  async getSesionesHistorial(): Promise<ApiResponse<SesionManual[]>> {
    return this.request<SesionManual[]>("/api/sesiones-manuales?estado=finalizada")
  }

  async iniciarSesionManual(numero: string, agente: string): Promise<ApiResponse<SesionManual>> {
    return this.request<SesionManual>("/api/sesiones-manuales", {
      method: "POST",
      body: JSON.stringify({ numero, agente }),
    })
  }

  async finalizarSesionManual(id: string): Promise<ApiResponse<SesionManual>> {
    return this.request<SesionManual>(`/api/sesiones-manuales/${id}`, {
      method: "DELETE",
    })
  }

  // Mensajes
  async enviarMensaje(numero: string, mensaje: string, agente: string): Promise<ApiResponse<any>> {
    return this.request<any>("/api/mensajes/enviar", {
      method: "POST",
      body: JSON.stringify({ numero, mensaje, agente }),
    })
  }

  // Estadísticas
  async getStats(): Promise<ApiResponse<WhatsAppStats>> {
    return this.request<WhatsAppStats>("/api/stats")
  }
}

export const whatsappAPI = new WhatsAppAPI()
