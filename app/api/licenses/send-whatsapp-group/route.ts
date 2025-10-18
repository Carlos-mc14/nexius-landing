import { NextResponse } from "next/server"
import { getLicenseById } from "@/lib/licenses"
import type { LicenseRecord } from "@/types/license"

function formatCurrency(amount: number | undefined | null, currency: string) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) return "—"
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

const STAGE_INTROS: Record<string, string> = {
  pre_due_3d: "Faltan 3 días para la fecha de pago. 💡",
  pre_due_2d: "Faltan 2 días para la fecha de pago. ⏳",
  pre_due_1d: "¡Último aviso! Mañana vence tu licencia. ⚠️",
  due_today: "Hoy vence tu licencia, evita interrupciones realizando el pago. 🔔",
  grace_day_1: "Tu licencia venció, se aplicó mora y seguimos dentro del periodo de gracia. 🕒",
  grace_day_2: "Seguimos dentro del periodo de gracia, la mora ya está activa. ⛔",
  grace_day_3: "Últimos días de gracia, regulariza cuanto antes. 🚨",
}

interface RequestPayload {
  licenseIds: string[]
  stage?: string
  reminderDate?: string
  skipIfDuplicate?: boolean
  customIntro?: string
  customOutro?: string
  manualMessage?: string
  clientIdentifier?: string
  clientLabel?: string
}

function pickClientIdentifier(licenses: Array<LicenseRecord & { _id: string }>, explicit?: string) {
  if (explicit) return explicit
  for (const lic of licenses) {
    if (lic.rucOrDni) return lic.rucOrDni
  }
  const name = licenses.find((lic) => lic.companyName)?.companyName
  if (name) return name
  return licenses[0]?.licenseKey || "cliente"
}

function pickClientLabel(licenses: Array<LicenseRecord & { _id: string }>, explicit?: string) {
  if (explicit) return explicit
  const name = licenses.find((lic) => lic.companyName)?.companyName
  if (name) return name
  const domain = licenses.find((lic) => lic.domain)?.domain
  if (domain) return domain
  return licenses[0]?.licenseKey || "Cliente"
}

function summarizeLicense(license: LicenseRecord & { _id: string }, currencyFallback: string) {
  const currency = license.currency || currencyFallback
  const amount = formatCurrency(license.amount, currency)
  const outstandingValue = pickPositive(license.outstandingBalance, license.proratedAmountDue, license.amount)
  const outstanding = formatCurrency(outstandingValue || license.amount || 0, currency)
  const nextPayment = formatDate(license.nextPaymentDue)
  const graceDays = license.gracePeriodDays ?? 0
  const latePct = typeof license.lateFeePercentage === "number" ? license.lateFeePercentage : undefined
  const fallbackLate = typeof license.lateFeeAmount === "number" ? license.lateFeeAmount : undefined
  const lateAmount = latePct !== undefined
    ? (fallbackLate ?? (license.amount ? (license.amount * latePct) / 100 : undefined))
    : fallbackLate
  const lateText = latePct !== undefined
    ? `${latePct}% (${formatCurrency(lateAmount, currency)})`
    : formatCurrency(lateAmount, currency)
  return {
    amount,
    outstandingValue: Number(outstandingValue) || 0,
    outstanding,
    nextPayment,
    graceDays,
    lateText,
    currency,
  }
}

export async function POST(request: Request) {
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

    const { safeParseJson } = await import("@/lib/requestUtils")
    const parsed = await safeParseJson(request)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const body = parsed.body as RequestPayload
    if (!body || !Array.isArray(body.licenseIds) || body.licenseIds.length === 0) {
      return NextResponse.json({ error: "licenseIds es obligatorio" }, { status: 400 })
    }

    const licenses: Array<LicenseRecord & { _id: string }> = []
    for (const id of body.licenseIds) {
      if (typeof id !== "string" || !id.trim()) continue
      const lic = await getLicenseById(id.trim())
      if (lic) licenses.push(lic as LicenseRecord & { _id: string })
    }

    if (!licenses.length) {
      return NextResponse.json({ error: "No se encontraron licencias válidas" }, { status: 404 })
    }

    const primaryWithPhone = licenses.find((lic) => lic.phoneNumber && lic.phoneNumber.trim())
    if (!primaryWithPhone) {
      return NextResponse.json({ error: "Ninguna licencia del grupo tiene número de teléfono" }, { status: 400 })
    }

    const clientIdentifier = pickClientIdentifier(licenses, body.clientIdentifier)
    const clientLabel = pickClientLabel(licenses, body.clientLabel)
    const reminderStage = typeof body.stage === "string" ? body.stage : undefined
    const reminderDate = typeof body.reminderDate === "string" ? body.reminderDate : new Date().toISOString().slice(0, 10)
    const skipIfDuplicate = body.skipIfDuplicate !== false
    const customIntro = typeof body.customIntro === "string" && body.customIntro.trim().length ? body.customIntro.trim() : undefined
    const customOutro = typeof body.customOutro === "string" && body.customOutro.trim().length ? body.customOutro.trim() : undefined
    const manualMessage = typeof body.manualMessage === "string" && body.manualMessage.trim().length ? body.manualMessage.trim() : undefined

    // Normalizar número a formato E.164 básico
    const raw = (primaryWithPhone.phoneNumber || "").replace(/[^0-9+]/g, "")
    let e164 = raw
    const defaultCode = process.env.CHATWOOT_DEFAULT_COUNTRY_CODE || "+51"
    if (!e164.startsWith("+")) {
      const digits = e164.replace(/^0+/, "")
      e164 = `${defaultCode}${digits}`
    }

    const currencyFallback = primaryWithPhone.currency || "PEN"

    const docHint = !clientIdentifier || clientIdentifier.toLowerCase() === "cliente" ? "DNI/RUC" : clientIdentifier

    let lines: string[]
    if (manualMessage) {
      lines = [
        manualMessage,
        "",
        `Cuando completes el pago responde este chat con: pago ${docHint} S/ <monto>.`,
        "Esto nos ayuda a identificar tu abono de inmediato.",
        "",
        "Gracias por confiar en Nexius 🚀",
      ]
    } else {
      const intro = customIntro || (reminderStage ? STAGE_INTROS[reminderStage] : undefined)
      lines = [
        `Hola ${clientLabel} 👋`,
        intro ? intro : "Te compartimos el resumen de tus licencias activas:",
        "",
        "Resumen de tus servicios:",
      ]

      let totalOutstanding = 0
      licenses.forEach((license, index) => {
        const summary = summarizeLicense(license, currencyFallback)
        totalOutstanding += summary.outstandingValue
        const labelPieces = [license.serviceType || "Servicio", license.domain || license.licenseKey || "—"]
        const header = `${index + 1}. ${labelPieces.filter(Boolean).join(" • ")}`
        lines.push(header)
        lines.push(`   Saldo pendiente: ${summary.outstanding}`)
        lines.push(`   Tarifa: ${summary.amount}`)
        lines.push(`   Próximo pago: ${summary.nextPayment}`)
        lines.push(`   Días de gracia: ${summary.graceDays}`)
        lines.push(`   Mora: ${summary.lateText}`)
        lines.push("")
      })

      lines.push(`Total estimado pendiente: ${formatCurrency(totalOutstanding, currencyFallback)}`)
      lines.push("")
      lines.push("Guía de pagos:")
      lines.push("https://www.nexius.lat/blog/como-pagar-licencias-nexius")
      if (customOutro) {
        lines.push("")
        lines.push(customOutro)
      }
      lines.push("")
      lines.push(`Cuando completes el pago responde este chat con: pago ${docHint} S/ <monto>.`)
      lines.push("Esto nos ayuda a identificar tu abono de inmediato.")
      lines.push("")
      lines.push("Gracias por confiar en Nexius 🚀")
    }

    const messageContent = lines.join("\n")

    // 1. Crear o reutilizar contacto en Chatwoot
    let contactId: number | null = null
    try {
      const headers = new Headers()
      headers.set("api_access_token", apiToken as string)
      const searchResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/contacts/search?q=${encodeURIComponent(e164)}`, { headers })
      if (searchResp.ok) {
        const searchData: any = await searchResp.json()
        const hit = searchData?.payload?.find((c: any) => c.phone_number === e164)
        if (hit) contactId = hit.id
      }
    } catch {
      /* ignorar */
    }

    if (!contactId) {
      const contactHeaders = new Headers()
      contactHeaders.set("Content-Type", "application/json")
      contactHeaders.set("api_access_token", apiToken as string)
      const contactResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/contacts`, {
        method: "POST",
        headers: contactHeaders,
        body: JSON.stringify({ name: clientLabel, phone_number: e164 }),
      })
      if (!contactResp.ok) {
        const txt = await contactResp.text()
        return NextResponse.json({ error: "No se pudo crear el contacto en Chatwoot", details: txt }, { status: 500 })
      }
      const contactData: any = await contactResp.json()
      contactId = contactData.id
    }

    if (!contactId) {
      return NextResponse.json({ error: "No se pudo determinar el contacto en Chatwoot" }, { status: 500 })
    }

    const inboxNumeric = Number(inboxId)
    let conversationId: number | null = null
    let conversationAlreadyUsed = false

    try {
      const convoHeaders = new Headers()
      convoHeaders.set("api_access_token", apiToken as string)
      const convoResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/contacts/${contactId}/conversations`, { headers: convoHeaders })
      if (convoResp.ok) {
        const convoPayload: any = await convoResp.json()
        const list: any[] = Array.isArray(convoPayload?.payload) ? convoPayload.payload : Array.isArray(convoPayload?.data) ? convoPayload.data : []
        const found = list.find((c: any) => {
          if (!c || c.status === "resolved" || c.inbox_id !== inboxNumeric) return false
          const attrs = c.additional_attributes || c.custom_attributes || {}
          if (clientIdentifier && attrs.clientIdentifier && attrs.clientIdentifier === clientIdentifier) return true
          if (Array.isArray(attrs.licenseIds)) {
            return attrs.licenseIds.some((id: string) => body.licenseIds.includes(id))
          }
          if (attrs.licenseId && body.licenseIds.includes(attrs.licenseId)) {
            return true
          }
          return false
        })
        if (found) {
          const attrs = found.additional_attributes || found.custom_attributes || {}
          const lastStage = attrs.lastReminderStage || attrs.reminderStage
          const lastDate = attrs.lastReminderDate || attrs.reminderDate
          if (skipIfDuplicate && reminderStage && lastStage === reminderStage && lastDate === reminderDate) {
            return NextResponse.json({ success: false, skipped: true, reason: "duplicate_stage", conversationId: found.id })
          }
          conversationId = found.id
          conversationAlreadyUsed = true
        }
      }
    } catch {
      /* ignorar */
    }

    if (!conversationId) {
      const convoHeaders = new Headers()
      convoHeaders.set("Content-Type", "application/json")
      convoHeaders.set("api_access_token", apiToken as string)
      const bodyPayload = {
        inbox_id: inboxNumeric,
        contact_id: contactId,
        additional_attributes: {
          aggregated: true,
          clientIdentifier,
          clientLabel,
          licenseIds: body.licenseIds,
          reminderStage,
          reminderDate,
        },
      }
      const convoResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations`, {
        method: "POST",
        headers: convoHeaders,
        body: JSON.stringify(bodyPayload),
      })
      if (!convoResp.ok) {
        const txt = await convoResp.text()
        return NextResponse.json({ error: "No se pudo crear la conversación en Chatwoot", details: txt }, { status: 500 })
      }
      const convoData: any = await convoResp.json()
      conversationId = convoData.id
    }

    if (!conversationId) {
      return NextResponse.json({ error: "No se pudo determinar una conversación activa" }, { status: 500 })
    }

    const msgHeaders = new Headers()
    msgHeaders.set("Content-Type", "application/json")
    msgHeaders.set("api_access_token", apiToken as string)
    const messageResp = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: msgHeaders,
      body: JSON.stringify({ content: messageContent }),
    })
    if (!messageResp.ok) {
      const txt = await messageResp.text()
      return NextResponse.json({ error: "No se pudo enviar el mensaje a Chatwoot", details: txt }, { status: 500 })
    }

    try {
      const patchHeaders = new Headers()
      patchHeaders.set("Content-Type", "application/json")
      patchHeaders.set("api_access_token", apiToken as string)
      const payload = {
        additional_attributes: {
          aggregated: true,
          clientIdentifier,
          clientLabel,
          licenseIds: body.licenseIds,
          reminderStage,
          reminderDate,
          conversationReused: conversationAlreadyUsed,
        },
      }
      await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}`, {
        method: "PATCH",
        headers: patchHeaders,
        body: JSON.stringify(payload),
      })
    } catch {
      /* ignorar */
    }

    return NextResponse.json({ success: true, conversationId, licenseIds: body.licenseIds })
  } catch (e: any) {
    return NextResponse.json({ error: "Error interno", details: e?.message }, { status: 500 })
  }
}
