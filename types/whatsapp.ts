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
  estado: "nuevo" | "en_proceso" | "completado" | "cerrado"
  timestamp: string
  asignado_a?: string
  notas_agente: Array<{
    nota: string
    timestamp: string
    agente: string
  }>
}

export interface Usuario {
  _id: string
  numero: string
  nombre: string
  email: string
  empresa: string
  fecha_registro: string
  ultima_actividad: string
  total_interacciones: number
}

export interface Conversacion {
  _id: string
  numero: string
  mensajes: Array<{
    _id: string
    contenido: string
    timestamp: string
    tipo: "automatico" | "manual"
    enviado_por?: string
  }>
}

export interface SesionManual {
  _id: string
  numero: string
  usuario_nombre: string
  inicio: string
  fin?: string
  agente: string
  mensajes_enviados: number
  estado: "activa" | "finalizada"
}

export interface WhatsAppStats {
  total_leads: number
  usuarios_activos: number
  sesiones_activas: number
  tasa_conversion: number
  leads_por_servicio: Array<{
    servicio: string
    cantidad: number
  }>
  actividad_diaria: Array<{
    fecha: string
    leads: number
    mensajes: number
  }>
  leads_por_estado: Array<{
    estado: string
    cantidad: number
  }>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  total?: number
  page?: number
  limit?: number
}

export interface LeadFilters {
  estado?: string
  servicio?: string
  prioridad?: string
  fecha_inicio?: string
  fecha_fin?: string
  asignado_a?: string
  page?: number
  limit?: number
}
