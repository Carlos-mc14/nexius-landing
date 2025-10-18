import { NextResponse } from "next/server"
import { getLicenseById } from "@/lib/licenses"
import type { LicenseRecord } from "@/types/license"

function formatCurrency(amount: number | undefined | null, currency: string) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) return "—"
  try {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount))
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

// POST /api/licenses/:id/send-email
// Envía un correo al email asociado a la licencia usando Brevo
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const missing: string[] = []
    if (!process.env.BREVO_API_KEY) missing.push("BREVO_API_KEY")
    if (missing.length > 0) {
      return NextResponse.json({ error: `Faltan variables de entorno: ${missing.join(", ")}` }, { status: 500 })
    }

    const licenseRaw = await getLicenseById(params.id)
    if (!licenseRaw) return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 })
    const license = licenseRaw as LicenseRecord & { _id: string }
    if (!license.email) {
      return NextResponse.json({ error: "La licencia no tiene un correo asociado" }, { status: 400 })
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@nexius.lat"
    const senderName = process.env.BREVO_SENDER_NAME || "Nexius Team"
    const brevoApiKey = process.env.BREVO_API_KEY!

    const currency = license.currency || "PEN"
    const start = formatDate(license.startDate)
    const end = formatDate(license.endDate)
    const nextPayment = formatDate(license.nextPaymentDue)
    const frequencyLabel = license.frequency === "monthly" ? "Mensual" : "Anual"

    const initialCharge = license.proratedAmountDue ?? license.outstandingBalance ?? license.amount
    const prorationLine = license.proratedAmountDue
      ? `${formatCurrency(license.proratedAmountDue, currency)} (${license.proratedDays ?? "-"} de ${license.billingCycleDays ?? "-"} días)`
      : formatCurrency(initialCharge, currency)
    const outstandingText = formatCurrency(license.outstandingBalance ?? initialCharge, currency)
    const graceDays = license.gracePeriodDays ?? 0

    const latePct = typeof license.lateFeePercentage === "number" ? license.lateFeePercentage : undefined
    const fallbackLate = typeof license.lateFeeAmount === "number" ? license.lateFeeAmount : undefined
    const lateAmount = latePct !== undefined
      ? fallbackLate ?? (license.amount ? (license.amount * latePct) / 100 : undefined)
      : fallbackLate
    const lateText = latePct !== undefined
      ? `${latePct}% (${formatCurrency(lateAmount, currency)})`
      : formatCurrency(lateAmount, currency)

    const subject = `Detalles de tu licencia ${license.licenseKey || ""}`.trim()

    const plain = `Hola ${license.companyName || ''},\n\nTe compartimos los detalles de tu licencia:\n\nLicencia: ${license.licenseKey}\nServicio: ${license.serviceType || '—'}\nDominio: ${license.domain || '—'}\nTarifa ${frequencyLabel}: ${formatCurrency(license.amount, currency)}\nCobro inicial: ${prorationLine}\nPróximo pago: ${nextPayment}\nDías de gracia: ${graceDays}\nMora: ${lateText}\nSaldo pendiente: ${outstandingText}\nVigencia: ${start} - ${end}\nEstado: ${license.status}\n\nGracias por confiar en Nexius.`

    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#222;">\n  <h2 style="color:#0056b3;margin:0 0 16px;">Detalles de tu Licencia</h2>\n  <p>Hola <strong>${license.companyName || ''}</strong>,</p>\n  <p>Te compartimos los detalles de tu licencia:</p>\n  <table style="border-collapse:collapse;font-size:14px;">\n    <tbody>\n      <tr><td style="padding:4px 8px;font-weight:600;">Licencia</td><td style="padding:4px 8px;">${license.licenseKey}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Servicio</td><td style="padding:4px 8px;">${license.serviceType || '—'}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Dominio</td><td style="padding:4px 8px;">${license.domain || '—'}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Tarifa ${frequencyLabel}</td><td style="padding:4px 8px;">${formatCurrency(license.amount, currency)}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Cobro inicial</td><td style="padding:4px 8px;">${prorationLine}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Próximo pago</td><td style="padding:4px 8px;">${nextPayment}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Días de gracia</td><td style="padding:4px 8px;">${graceDays}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Mora</td><td style="padding:4px 8px;">${lateText}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Saldo pendiente</td><td style="padding:4px 8px;">${outstandingText}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Vigencia</td><td style="padding:4px 8px;">${start} - ${end}</td></tr>\n      <tr><td style="padding:4px 8px;font-weight:600;">Estado</td><td style="padding:4px 8px;">${license.status}</td></tr>\n    </tbody>\n  </table>\n  <p style="margin-top:16px;">Si tienes dudas o necesitas soporte adicional, responde a este correo o escríbenos a <a href="mailto:contacto@nexius.lat">contacto@nexius.lat</a>.</p>\n  <p style="font-size:12px;color:#666;">— Equipo Nexius</p>\n</body></html>`

    const payload = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: license.email, name: license.companyName || undefined }],
      subject,
      textContent: plain,
      htmlContent: html,
    }

    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return NextResponse.json({ error: "Error al enviar el correo", details: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: "Error interno", details: e?.message }, { status: 500 })
  }
}
