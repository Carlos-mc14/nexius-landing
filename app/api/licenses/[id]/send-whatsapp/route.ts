import { NextResponse } from "next/server"
import { getLicenseById } from "@/lib/licenses"
import type { LicenseRecord } from "@/types/license"

function formatCurrency(amount: number | undefined | null, currency: string) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "—"
  try {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount))
  } catch {
    return `${Number(amount).toFixed(2)} ${currency}`
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("es-PE")
}

function pickPositive(...values: Array<number | null | undefined>) {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const numeric = Number(value)
    if (Number.isFinite(numeric) && numeric > 0) return numeric
  }
  return 0
}

// POST /api/licenses/:id/send-whatsapp
// Envía un mensaje de WhatsApp usando Chatwoot (inbox configurado) con los detalles de la licencia.
// Requiere variables de entorno:
// CHATWOOT_BASE_URL (ej: https://chatwoot.nexius.lat)
// CHATWOOT_API_TOKEN (Personal Access Token o Account API token)
// CHATWOOT_ACCOUNT_ID (ej: 1)
// CHATWOOT_INBOX_ID (ej: 5)
// CHATWOOT_DEFAULT_COUNTRY_CODE (ej: +51) opcional para normalizar números sin prefijo
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const missing: string[] = []
    const baseUrl = process.env.CHATWOOT_BASE_URL
    const apiToken = process.env.CHATWOOT_API_TOKEN
    const accountId = process.env.CHATWOOT_ACCOUNT_ID
    const inboxId = process.env.CHATWOOT_INBOX_ID

    if (!baseUrl) missing.push("CHATWOOT_BASE_URL")
    if (!apiToken) missing.push("CHATWOOT_API_TOKEN")
    if (!accountId) missing.push("CHATWOOT_ACCOUNT_ID")
    if (!inboxId) missing.push("CHATWOOT_INBOX_ID")
    if (missing.length) {
      return NextResponse.json({ error: `Faltan variables de entorno: ${missing.join(", ")}` }, { status: 500 })
    }

    const contentType = request.headers.get("content-type") || ""
    let overrides: any = {}
    if (contentType.includes("application/json")) {
      const { safeParseJson } = await import("@/lib/requestUtils")
      const parsed = await safeParseJson(request)
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
      overrides = parsed.body ?? {}
    }

    const licenseRaw = await getLicenseById(params.id)
    if (!licenseRaw) {
      return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 })
    }
    const license = licenseRaw as LicenseRecord & { _id: string }

    if (!license.phoneNumber) {
      return NextResponse.json({ error: "La licencia no tiene un número de teléfono" }, { status: 400 })
    }

    // Normalizar número a formato E.164 básico
    const raw = (license.phoneNumber || "").replace(/[^0-9+]/g, "")
    let e164 = raw
    const defaultCode = process.env.CHATWOOT_DEFAULT_COUNTRY_CODE || "+51"
    if (!e164.startsWith("+")) {
      // Asumir país por defecto
      const digits = e164.replace(/^0+/, "")
      e164 = `${defaultCode}${digits}`
    }

    const reminderStage = typeof overrides.stage === 'string' ? overrides.stage : undefined
    const reminderDate = typeof overrides.reminderDate === 'string' ? overrides.reminderDate : new Date().toISOString().slice(0, 10)
    const skipIfDuplicate = overrides.skipIfDuplicate !== false
    const customIntro = typeof overrides.customIntro === 'string' && overrides.customIntro.trim().length ? overrides.customIntro.trim() : undefined
    const customOutro = typeof overrides.customOutro === 'string' && overrides.customOutro.trim().length ? overrides.customOutro.trim() : undefined
    const manualMessage = typeof overrides.manualMessage === 'string' && overrides.manualMessage.trim().length ? overrides.manualMessage.trim() : undefined

    // Construir mensaje (mismo estilo que el link previo)
    const currency = license.currency || "PEN"
    const start = formatDate(license.startDate)
    const end = formatDate(license.endDate)
    const nextPayment = formatDate(license.nextPaymentDue)
    const prorationAmount = Number(license.proratedAmountDue)
    const hasProration = Number.isFinite(prorationAmount) && prorationAmount > 0
    const initialReference = pickPositive(license.proratedAmountDue, license.amount)
    const prorationLine = hasProration
      ? `📆 Cobro inicial (${license.proratedDays ?? '-'} de ${license.billingCycleDays ?? '-'} días): ${formatCurrency(prorationAmount, currency)}`
      : `📆 Cobro inicial: ${formatCurrency(initialReference || license.amount || 0, currency)}`
    const outstandingValue = pickPositive(license.outstandingBalance, license.proratedAmountDue, license.amount)
    const outstandingText = formatCurrency(outstandingValue || license.amount || 0, currency)
    const graceDays = license.gracePeriodDays ?? 0
    const latePct = typeof license.lateFeePercentage === 'number' ? license.lateFeePercentage : undefined
    const fallbackLate = typeof license.lateFeeAmount === 'number' ? license.lateFeeAmount : undefined
    const lateAmount = latePct !== undefined ? (fallbackLate ?? (license.amount ? (license.amount * latePct) / 100 : undefined)) : fallbackLate
    const lateText = latePct !== undefined
      ? `${latePct}% (${formatCurrency(lateAmount, currency)})`
      : formatCurrency(lateAmount, currency)
    const statusLabels: Record<string,string> = {
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Vencido',
      cancelled: 'Cancelado'
    }
    const frecuencia = license.frequency === 'monthly' ? 'Mensual' : 'Anual'
    const statusKey = (license.status || '') as keyof typeof statusLabels
    const stageIntros: Record<string, string> = {
      pre_due_3d: 'Recordatorio: faltan 3 días para la fecha de pago. 💡',
      pre_due_2d: 'Recordatorio: faltan 2 días para la fecha de pago. ⏳',
      pre_due_1d: '¡Último aviso! Mañana vence tu licencia. ⚠️',
      due_today: 'Hoy vence tu licencia, evita interrupciones realizando el pago. 🔔',
      grace_day_1: 'Tu licencia ya venció. Se aplicó mora y seguimos dentro del periodo de gracia. 🕒',
      grace_day_2: 'Seguimos dentro del periodo de gracia, la mora ya está activa. ⛔',
      grace_day_3: 'Últimos días de gracia, por favor regulariza el pago cuanto antes. 🚨'
    }
    let lines: string[]
    if (manualMessage) {
      lines = [manualMessage]
    } else {
      const intro = customIntro || (reminderStage ? stageIntros[reminderStage] : undefined)
      const payloadLines = [
        `Hola ${license.companyName || ''} 👋`,
        intro ? intro : 'Te compartimos los detalles de tu licencia:',
        '',
        `🔐 Licencia: ${license.licenseKey || '—'}`,
        `🛠 Servicio: ${license.serviceType || '—'}`,
        `💵 Tarifa ${frecuencia}: ${formatCurrency(license.amount, currency)}`,
        prorationLine,
        `📅 Vigencia: ${start} - ${end}`,
        `📅 Próximo pago: ${nextPayment}`,
        `⏳ Días de gracia: ${graceDays}`,
        `⚠️ Mora: ${lateText}`,
        `💼 Saldo pendiente: ${outstandingText}`,
        `⚙️ Estado: ${statusLabels[statusKey] || license.status || '—'}`,
        '',
        'Guía de pagos:',
        'https://www.nexius.lat/blog/como-pagar-licencias-nexius'
      ]
      if (customOutro) payloadLines.push('', customOutro)
      payloadLines.push('', 'Cuando completes el pago responde este chat con: pago <DNI/RUC> S/ <monto>.')
      payloadLines.push('Esto nos ayuda a identificar tu abono de inmediato.')
      payloadLines.push('', 'Gracias por confiar en Nexius 🚀')
      lines = payloadLines
    }
    const messageContent = lines.join('\n')

    // 1. Crear (o reutilizar) contacto. Chatwoot permite crear contacto por API.
    // Intentar búsqueda rápida (si la instancia soporta endpoint /contacts/search)
    let contactId: number | null = null
    try {
      const headers = new Headers()
      headers.set('api_access_token', apiToken as string)
      const searchResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/contacts/search?q=${encodeURIComponent(e164)}`, { headers })
      if (searchResp.ok) {
        const searchData: any = await searchResp.json()
        const hit = searchData?.payload?.find((c: any) => c.phone_number === e164)
        if (hit) contactId = hit.id
      }
    } catch { /* ignorar */ }

    if (!contactId) {
      const contactHeaders = new Headers()
      contactHeaders.set('Content-Type', 'application/json')
      contactHeaders.set('api_access_token', apiToken as string)
      const contactResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/contacts`, {
        method: 'POST',
        headers: contactHeaders,
        body: JSON.stringify({ name: license.companyName || license.licenseKey || 'Cliente', phone_number: e164 })
      })
      if (!contactResp.ok) {
        const txt = await contactResp.text()
        return NextResponse.json({ error: 'No se pudo crear el contacto en Chatwoot', details: txt }, { status: 500 })
      }
      const contactData: any = await contactResp.json()
      contactId = contactData.id
    }

    let conversationId: number | null = null
    let conversationAlreadyUsed = false
    try {
      const convoHeaders = new Headers()
      convoHeaders.set('api_access_token', apiToken as string)
      const convoResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/contacts/${contactId}/conversations`, {
        headers: convoHeaders,
      })
      if (convoResp.ok) {
        const convoPayload: any = await convoResp.json()
        const list: any[] = Array.isArray(convoPayload?.payload) ? convoPayload.payload : Array.isArray(convoPayload?.data) ? convoPayload.data : []
        const inboxNumeric = Number(inboxId)
        const preferred = list.find((c: any) => c?.additional_attributes?.licenseId === license._id && c?.status !== 'resolved' && c?.inbox_id === inboxNumeric)
        const fallback = list.find((c: any) => c?.status !== 'resolved' && c?.inbox_id === inboxNumeric)
        const active = preferred || fallback
        if (active) {
          const attrs = active.additional_attributes || active.custom_attributes || {}
          const lastStage = attrs.lastReminderStage || attrs.reminderStage
          const lastDate = attrs.lastReminderDate || attrs.reminderDate
          if (skipIfDuplicate && reminderStage && lastStage === reminderStage && lastDate === reminderDate) {
            return NextResponse.json({ success: false, skipped: true, reason: 'duplicate_stage', conversationId: active.id })
          }
          conversationId = active.id
          conversationAlreadyUsed = true
        }
      }
    } catch (err) {
      console.warn('[Chatwoot] No se pudo listar conversaciones existentes', err)
    }

    if (!conversationId) {
      const convoHeaders = new Headers()
      convoHeaders.set('Content-Type', 'application/json')
      convoHeaders.set('api_access_token', apiToken as string)
      const body = {
        inbox_id: Number(inboxId),
        contact_id: contactId,
        additional_attributes: {
          licenseId: license._id,
          licenseKey: license.licenseKey,
          reminderStage,
          reminderDate,
        },
      }
      const convoResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations`, {
        method: 'POST',
        headers: convoHeaders,
        body: JSON.stringify(body),
      })
      if (!convoResp.ok) {
        const txt = await convoResp.text()
        return NextResponse.json({ error: 'No se pudo crear la conversación en Chatwoot', details: txt }, { status: 500 })
      }
      const convoData: any = await convoResp.json()
      conversationId = convoData.id
    }
    if (!conversationId) {
      return NextResponse.json({ error: 'No se pudo determinar una conversación activa' }, { status: 500 })
    }

    // 3. Enviar mensaje
    const msgHeaders = new Headers()
    msgHeaders.set('Content-Type', 'application/json')
    msgHeaders.set('api_access_token', apiToken as string)
    const messageResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: msgHeaders,
      body: JSON.stringify({ content: messageContent })
    })
    if (!messageResp.ok) {
      const txt = await messageResp.text()
      return NextResponse.json({ error: 'No se pudo enviar el mensaje a Chatwoot', details: txt }, { status: 500 })
    }

    try {
      const patchHeaders = new Headers()
      patchHeaders.set('Content-Type', 'application/json')
      patchHeaders.set('api_access_token', apiToken as string)
      const payload = {
        additional_attributes: {
          licenseId: license._id,
          licenseKey: license.licenseKey,
          reminderStage,
          reminderDate,
          conversationReused: conversationAlreadyUsed,
        }
      }
      await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: patchHeaders,
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.warn('[Chatwoot] No se pudo actualizar atributos de la conversación', err)
    }

    return NextResponse.json({ success: true, conversationId })
  } catch (e: any) {
    return NextResponse.json({ error: 'Error interno', details: e?.message }, { status: 500 })
  }
}
