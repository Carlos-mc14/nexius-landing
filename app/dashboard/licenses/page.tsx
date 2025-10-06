"use client"

import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Search, Plus, RefreshCw, Copy, Edit, CheckCircle2, AlertCircle, Clock, XCircle, DollarSign, Calendar, Building2, CreditCard, Filter } from "lucide-react"

type License = any

const STATUS_OPTIONS = ["paid", "pending", "overdue", "cancelled"]
const PAYMENT_METHODS = ["transfer", "yape", "plin", "card", "cash", "other"]

const STATUS_CONFIG = {
  paid: { label: "Pagado", variant: "default", icon: CheckCircle2 },
  pending: { label: "Pendiente", variant: "secondary", icon: Clock },
  overdue: { label: "Vencido", variant: "destructive", icon: AlertCircle },
  cancelled: { label: "Cancelado", variant: "outline", icon: XCircle },
}

const PAYMENT_METHOD_LABELS = {
  transfer: "Transferencia",
  yape: "Yape",
  plin: "Plin",
  card: "Tarjeta",
  cash: "Efectivo",
  other: "Otro"
}

export default function LicensesPage() {
  const [list, setList] = useState<License[]>([])
  const [filteredList, setFilteredList] = useState<License[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<License | null>(null)
  const [createdLicense, setCreatedLicense] = useState<License | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false)
  const [whatsappSent, setWhatsappSent] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [form, setForm] = useState<any>({ 
    companyName: "", rucOrDni: "", phoneNumber: "", email: "", amount: 0, currency: "PEN", 
    frequency: "monthly", scheduleMode: "manual", domain: "", serviceType: "", status: "pending", 
    paymentMethod: "transfer", startDate: "", endDate: "", nextPaymentDue: "", 
    gracePeriodDays: 7, notes: "" 
  })

  useEffect(() => {
    fetchList()
  }, [])

  useEffect(() => {
    filterLicenses()
  }, [list, searchTerm, statusFilter])

  async function fetchList() {
    setLoading(true)
    const res = await fetch("/api/licenses")
    const data = await res.json()
    setList(data)
    setLoading(false)
  }

  function filterLicenses() {
    let filtered = [...list]
    
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.rucOrDni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.domain?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(l => l.status === statusFilter)
    }
    
    setFilteredList(filtered)
  }

  function openCreate() {
    setEditing(null)
    setForm({ 
      companyName: "", rucOrDni: "", phoneNumber: "", email: "", amount: 0, currency: "PEN", 
      frequency: "monthly", scheduleMode: "manual", domain: "", serviceType: "", status: "pending", 
      paymentMethod: "transfer", startDate: "", endDate: "", nextPaymentDue: "", 
      gracePeriodDays: 7, notes: "" 
    })
    setOpen(true)
  }

  function openEdit(item: License) {
    setEditing(item)
  setForm({ ...item })
    setOpen(true)
  }

  async function save() {
    const url = editing ? `/api/licenses/${editing._id}` : "/api/licenses"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { 
      method, 
      body: JSON.stringify(form), 
      headers: { "Content-Type": "application/json" } 
    })
    if (res.ok) {
      if (editing) {
        setOpen(false)
        fetchList()
      } else {
        // Nueva licencia creada: mantener modal abierto y mostrar opciones de envío
        const data = await res.json()
        setCreatedLicense(data)
        setForm(data) // Para mostrar posibles campos generados (licenseKey, etc.)
        fetchList()
      }
    } else {
      const err = await res.json()
      alert(err.error || "Error al guardar")
    }
  }

  async function quickUpdate(id: string, patch: any) {
    const res = await fetch(`/api/licenses/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(patch), 
      headers: { "Content-Type": "application/json" } 
    })
    if (res.ok) fetchList()
    else alert("Error al actualizar")
  }

  function copyLicenseKey(key: string) {
    navigator.clipboard?.writeText(key)
  }

  function buildWhatsappUrl(lic: any) {
    if (!lic) return "#"
    const start = lic.startDate ? new Date(lic.startDate).toLocaleDateString('es-PE') : '—'
    const end = lic.endDate ? new Date(lic.endDate).toLocaleDateString('es-PE') : '—'
    const statusLabels: Record<string,string> = {
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Vencido',
      cancelled: 'Cancelado'
    }
    const frecuencia = lic.frequency === 'monthly' ? 'Mensual' : 'Anual'
    const lines = [
      `Hola ${lic.companyName || ''} 👋`,
      'Te compartimos los detalles de tu licencia:',
      '',
      `🛠 Servicio: ${lic.serviceType || '—'}`,
      `💵 Monto: ${lic.amount} ${lic.currency || ''} (${frecuencia})`,
      `📅 Vigencia: ${start} - ${end}`,
      `⚙️ Estado: ${statusLabels[lic.status] || lic.status || '—'}`,
      '',
      'Guía de pagos:',
      'https://www.nexius.lat/blog/como-pagar-licencias-nexius',
      '',
      'Gracias por confiar en Nexius 🚀'
    ].join('\n')
    const encoded = encodeURIComponent(lines)
    const cleanedPhone = (lic.phoneNumber || '').replace(/[^0-9]/g,'')
    return cleanedPhone
      ? `https://wa.me/${cleanedPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`
  }

  async function sendLicenseEmail() {
    if (!createdLicense) return
    setSendingEmail(true)
    setEmailSent(false)
    try {
      const resp = await fetch(`/api/licenses/${createdLicense._id}/send-email`, { method: 'POST' })
      if (resp.ok) setEmailSent(true)
      else {
        const err = await resp.json().catch(() => ({}))
        alert(err.error || 'Error al enviar correo')
      }
    } finally {
      setSendingEmail(false)
    }
  }

  async function sendWhatsappViaChatwoot() {
    if (!createdLicense) return
    setSendingWhatsapp(true)
    setWhatsappSent(false)
    try {
      const resp = await fetch(`/api/licenses/${createdLicense._id}/send-whatsapp`, { method: 'POST' })
      if (resp.ok) {
        setWhatsappSent(true)
      } else {
        const err = await resp.json().catch(() => ({}))
        alert(err.error || 'Error al enviar WhatsApp')
      }
    } finally {
      setSendingWhatsapp(false)
    }
  }

  const stats = {
    total: list.length,
    paid: list.filter(l => l.status === 'paid').length,
    pending: list.filter(l => l.status === 'pending').length,
    overdue: list.filter(l => l.status === 'overdue').length,
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestión de Licencias</h1>
        <p className="text-muted-foreground">Administra y monitorea todas tus licencias de software</p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagadas</p>
                <p className="text-3xl font-bold">{stats.paid}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <p className="text-3xl font-bold">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla principal */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Licencias Activas</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 flex-1 md:flex-initial md:max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa, RUC o dominio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => fetchList()} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Licencia
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Cargando licencias...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No se encontraron licencias</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all" 
                  ? "Intenta ajustar los filtros de búsqueda" 
                  : "Crea tu primera licencia para comenzar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Empresa</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Identificación</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Dominio</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Vigencia</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Monto</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Estado</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((l: any) => {
                    const StatusIcon = STATUS_CONFIG[l.status as keyof typeof STATUS_CONFIG]?.icon || Clock
                    return (
                      <tr key={l._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold text-sm">
                              {l.companyName?.substring(0, 2).toUpperCase() || "??"}
                            </div>
                            <div>
                              <p className="font-medium">{l.companyName}</p>
                              {l.serviceType && (
                                <p className="text-xs text-muted-foreground">{l.serviceType}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{l.rucOrDni || "—"}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {l.domain || "—"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {l.startDate ? new Date(l.startDate).toLocaleDateString('es-PE') : "—"}
                              </span>
                            </div>
                            <div className="text-muted-foreground text-xs mt-0.5">
                              hasta {l.endDate ? new Date(l.endDate).toLocaleDateString('es-PE') : "—"}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{l.amount}</span>
                            <span className="text-xs text-muted-foreground">{l.currency || "PEN"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground capitalize mt-0.5">
                            {l.frequency === "monthly" ? "Mensual" : "Anual"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={STATUS_CONFIG[l.status as keyof typeof STATUS_CONFIG]?.variant as any || "outline"}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {STATUS_CONFIG[l.status as keyof typeof STATUS_CONFIG]?.label || l.status}
                          </Badge>
                          {l.paymentMethod && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {PAYMENT_METHOD_LABELS[l.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || l.paymentMethod}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openEdit(l)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyLicenseKey(l.licenseKey)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {l.status !== 'paid' && (
                              <Button 
                                size="sm" 
                                onClick={() => quickUpdate(l._id, { status: 'paid' })}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Marcar pagado
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal mejorado */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editing ? "Editar Licencia" : "Nueva Licencia"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Información de la empresa */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Información de la Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre de la Empresa *</label>
                  <Input 
                    placeholder="Ej: Empresa ABC S.A.C." 
                    value={form.companyName} 
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">RUC / DNI</label>
                  <Input 
                    placeholder="20123456789" 
                    value={form.rucOrDni} 
                    onChange={(e) => setForm({ ...form, rucOrDni: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Teléfono</label>
                  <Input 
                    placeholder="+51 999 999 999" 
                    value={form.phoneNumber} 
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Correo</label>
                  <Input 
                    placeholder="contacto@empresa.com" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Dominio</label>
                  <Input 
                    placeholder="example.com" 
                    value={form.domain} 
                    onChange={(e) => setForm({ ...form, domain: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de Servicio</label>
                  <Input 
                    placeholder="Ej: ERP, CRM, etc." 
                    value={form.serviceType} 
                    onChange={(e) => setForm({ ...form, serviceType: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* Información de pago */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Información de Pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Monto *</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={form.amount} 
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Moneda</label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="PEN">PEN</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Frecuencia</label>
                  <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Modo de Programación</label>
                  <Select value={form.scheduleMode} onValueChange={(v) => setForm({ ...form, scheduleMode: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="monthly_first">Cada 1 de cada mes</SelectItem>
                      <SelectItem value="annual_jan5">Cada 5 de Enero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Método de Pago</label>
                  <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {PAYMENT_METHOD_LABELS[m as keyof typeof PAYMENT_METHOD_LABELS] || m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período de Vigencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha de Inicio</label>
                  <Input 
                    type="date" 
                    value={form.startDate} 
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha de Fin</label>
                  <Input 
                    type="date" 
                    value={form.endDate} 
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Días de Gracia</label>
                  <Input 
                    type="number" 
                    value={form.gracePeriodDays} 
                    onChange={(e) => setForm({ ...form, gracePeriodDays: Number(e.target.value) })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Próximo Pago (solo lectura)</label>
                  <Input 
                    disabled 
                    value={form.nextPaymentDue ? new Date(form.nextPaymentDue).toLocaleDateString('es-PE') : ''} 
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notas Adicionales</label>
              <Input 
                placeholder="Información adicional sobre la licencia..." 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
              />
            </div>
          </div>

          {editing && form.paymentHistory?.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">Historial de Pagos ({form.paymentHistory.length})</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Historial de Pagos</SheetTitle>
                    <SheetDescription>Registros registrados para esta licencia.</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 space-y-3">
                    {form.paymentHistory.map((p: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-md bg-muted/40 text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{p.amount} {p.currency || form.currency}</span>
                          <span className="text-xs text-muted-foreground">{p.paidAt ? new Date(p.paidAt).toLocaleDateString('es-PE') : ''}</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {p.method && <div>Método: {p.method}</div>}
                          {p.periodEnd && <div>Cobertura hasta: {new Date(p.periodEnd).toLocaleDateString('es-PE')}</div>}
                          {p.transactionId && <div>Tx: <span className="font-mono">{p.transactionId}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          <DialogFooter className="mt-6 gap-2">
            {createdLicense && !editing ? (
              <div className="flex flex-col w-full gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => { setCreatedLicense(null); setOpen(false) }}>Cerrar</Button>
                  <Button 
                    type="button" 
                    variant={whatsappSent ? 'secondary' : 'default'}
                    disabled={sendingWhatsapp || whatsappSent || !createdLicense.phoneNumber}
                    onClick={sendWhatsappViaChatwoot}
                  >
                    {sendingWhatsapp ? 'Enviando...' : whatsappSent ? 'WhatsApp Enviado' : 'Enviar WhatsApp'}
                  </Button>
                  <Button 
                    type="button" 
                    variant={emailSent ? 'secondary' : 'default'}
                    disabled={!createdLicense.email || sendingEmail || emailSent}
                    onClick={sendLicenseEmail}
                  >
                    {sendingEmail ? 'Enviando...' : emailSent ? 'Correo Enviado' : 'Enviar por Correo'}
                  </Button>
                </div>
                {!createdLicense.email && (
                  <p className="text-xs text-muted-foreground">Agrega un correo para habilitar el envío por email.</p>
                )}
                {!createdLicense.phoneNumber && (
                  <p className="text-xs text-muted-foreground">Agrega un teléfono para habilitar el envío por WhatsApp.</p>
                )}
              </div>
            ) : (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => save()}>
                  {editing ? "Guardar Cambios" : "Crear Licencia"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}