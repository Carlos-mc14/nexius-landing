// Enhanced types based on Python backend structure
export interface Lead {
  _id: string
  numero: string
  usuario_info: {
    nombre: string
    email: string
    empresa: string
  }
  servicio: string
  mensaje: string
  prioridad: "normal" | "alta" | "urgente"
  estado: "nuevo" | "en_proceso" | "completado" | "cancelado"
  timestamp: string
  asignado_a?: string
  notas_agente?: Array<{
    nota: string
    timestamp: string
    agente: string
  }>
  origen?: string
}

export interface Usuario {
  _id: string
  numero: string
  nombre: string
  email: string
  empresa: string
  estado_conversacion: string
  fecha_registro: string
  ultima_actividad: string
  total_interacciones: number
  preferencias?: {
    usa_ia: boolean
    idioma?: string
  }
  conversaciones_archivadas?: boolean
}

export interface Conversacion {
  _id: string
  numero: string
  mensaje: string
  tipo: "recibido" | "enviado_automatico" | "enviado_manual" | "enviado_ia"
  timestamp: string
  generado_por_ia?: boolean
  en_modo_manual?: boolean
  archivado?: boolean
  respuesta_bot?: string
}

export interface SesionManual {
  _id: string
  numero: string
  agente_id: string
  motivo: string
  inicio: string
  fin?: string
  activa: boolean
  mensajes_intercambiados: number
  notas?: Array<{
    nota: string
    timestamp: string
  }>
}

export interface Estadisticas {
  resumen: {
    total_usuarios: number
    total_leads: number
    leads_nuevos: number
    leads_en_proceso: number
    sesiones_activas: number
    conversaciones_ia: number
    conversaciones_ia_hoy: number
    ia_disponible: boolean
    ia_tiempo_verificacion: number
  }
  servicios_populares: Array<{ _id: string; count: number }>
  actividad_diaria: Array<{ _id: string; conversaciones: number }>
  ia_status: {
    servidor: string
    modelo: string
    ultima_verificacion: string | null
    metodo: string
  }
  timestamp: string
}

export interface ChatUser extends Usuario {
  unread_count?: number
  last_message?: string
  is_online?: boolean
  has_archived?: boolean
}

export interface WhatsAppDashboardState {
  stats: Estadisticas | null
  leads: Lead[]
  usuarios: ChatUser[]
  conversaciones: Conversacion[]
  sesiones: SesionManual[]
  loading: boolean
  isConnected: boolean
  lastUpdate: Date
}

export interface ChatFilter {
  showArchived: boolean
  search: string
  onlineOnly: boolean
}

export interface LeadFilter {
  estado: string
  servicio: string
  prioridad: string
  search: string
}
