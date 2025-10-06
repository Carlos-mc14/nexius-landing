import { NextResponse } from "next/server"
import { getLicenseById } from "@/lib/licenses"
import type { LicenseRecord } from "@/types/license"

// POST /api/licenses/:id/send-whatsapp
// Envía un mensaje de WhatsApp usando Chatwoot (inbox configurado) con los detalles de la licencia.
// Requiere variables de entorno:
// CHATWOOT_BASE_URL (ej: https://chatwoot.nexius.lat)
// CHATWOOT_API_TOKEN (Personal Access Token o Account API token)
// CHATWOOT_ACCOUNT_ID (ej: 1)
// CHATWOOT_INBOX_ID (ej: 5)
// CHATWOOT_DEFAULT_COUNTRY_CODE (ej: +51) opcional para normalizar números sin prefijo
export async function POST(_req: Request, { params }: { params: { id: string } }) {
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

    // Construir mensaje (mismo estilo que el link previo)
    const start = license.startDate ? new Date(license.startDate).toLocaleDateString('es-PE') : '—'
    const end = license.endDate ? new Date(license.endDate).toLocaleDateString('es-PE') : '—'
    const statusLabels: Record<string,string> = {
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Vencido',
      cancelled: 'Cancelado'
    }
    const frecuencia = license.frequency === 'monthly' ? 'Mensual' : 'Anual'
    const statusKey = (license.status || '') as keyof typeof statusLabels
    const lines = [
      `Hola ${license.companyName || ''} 👋`,
      'Te compartimos los detalles de tu licencia:',
      '',
      `🔐 Licencia: ${license.licenseKey || '—'}`,
      `🛠 Servicio: ${license.serviceType || '—'}`,
      `💵 Monto: ${license.amount} ${license.currency || ''} (${frecuencia})`,
      `📅 Vigencia: ${start} - ${end}`,
      `⚙️ Estado: ${statusLabels[statusKey] || license.status || '—'}`,
      '',
      'Guía de pagos:',
      'https://www.nexius.lat/blog/como-pagar-licencias-nexius',
      '',
      'Gracias por confiar en Nexius 🚀'
    ].join('\n')

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

    // 2. Crear conversación (simple: siempre nueva). Para evitar duplicados habría que listar existentes.
    const convoHeaders = new Headers()
    convoHeaders.set('Content-Type', 'application/json')
    convoHeaders.set('api_access_token', apiToken as string)
    const convoResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations`, {
      method: 'POST',
      headers: convoHeaders,
      body: JSON.stringify({
        inbox_id: Number(inboxId),
        contact_id: contactId,
        additional_attributes: { licenseId: license._id }
      })
    })
    if (!convoResp.ok) {
      const txt = await convoResp.text()
      return NextResponse.json({ error: 'No se pudo crear la conversación en Chatwoot', details: txt }, { status: 500 })
    }
    const convoData: any = await convoResp.json()
    const conversationId = convoData.id

    // 3. Enviar mensaje
    const msgHeaders = new Headers()
    msgHeaders.set('Content-Type', 'application/json')
    msgHeaders.set('api_access_token', apiToken as string)
    const messageResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: msgHeaders,
      body: JSON.stringify({ content: lines })
    })
    if (!messageResp.ok) {
      const txt = await messageResp.text()
      return NextResponse.json({ error: 'No se pudo enviar el mensaje a Chatwoot', details: txt }, { status: 500 })
    }

    return NextResponse.json({ success: true, conversationId })
  } catch (e: any) {
    return NextResponse.json({ error: 'Error interno', details: e?.message }, { status: 500 })
  }
}
