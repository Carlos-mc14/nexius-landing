export interface Stats {
  resumen: {
    total_usuarios: number
    total_leads: number
    leads_nuevos: number
    leads_en_proceso: number
    sesiones_activas: number
  }
  servicios_populares: Array<{ _id: string; count: number }>
  actividad_diaria: Array<{ _id: string; conversaciones: number }>
  timestamp: string
}

export interface Lead {
  _id: string
  numero: string
  servicio: string
  mensaje: string
  prioridad: 'normal' | 'alta' | 'urgente'
  estado: 'nuevo' | 'en_proceso' | 'completado'
  timestamp: string
  usuario_info: {
    nombre: string
    email: string
    empresa: string
  }
  asignado_a?: string
  notas_agente?: Array<{
    nota: string
    timestamp: string
    agente_id: string
  }>
}

export interface Usuario {
  _id: string
  numero: string
  nombre: string
  email: string
  empresa: string
  estado_conversacion: string
  total_interacciones: number
  fecha_registro: string
  ultima_actividad: string
}

export interface Conversacion {
  _id: string
  numero: string
  mensaje: string
  tipo: 'recibido' | 'enviado_automatico' | 'enviado_manual'
  respuesta_bot?: string
  timestamp: string
  en_modo_manual: boolean
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
  notas: Array<{
    nota: string
    timestamp: string
  }>
}

export interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export interface LeadsResponse {
  leads: Lead[]
  total: number
  limit: number
  skip: number
}

export interface UsuariosResponse {
  usuarios: Usuario[]
  total: number
  limit: number
  skip: number
}

export interface ConversacionesResponse {
  numero: string
  conversaciones: Conversacion[]
  total: number
}

export interface SesionesResponse {
  sesiones: SesionManual[]
  total: number
}