/**
 * Odoo integration helper.
 * Objetivo: registrar pagos (transacciones) en Odoo sólo con fines contables.
 * No gestiona lógica de licencias ni renovaciones aquí; eso sigue en Nexius.
 */
import type { TransactionProduct, TransactionRecord } from "@/types/transaction"
import type { LicenseRecord } from "@/types/license"
import { getLicenseById } from "./licenses"

// Configuración vía variables de entorno
const ODOO_ENABLED = process.env.ODOO_SYNC_ENABLED === "true"
const ODOO_BASE_URL = process.env.ODOO_BASE_URL || "" // e.g. https://odoo.tudominio.com
const ODOO_API_KEY = process.env.ODOO_API_KEY || "" // API Key de usuario técnico o shared secret para endpoint custom
// Si usas un endpoint custom tipo /nexius/payment en Odoo (controller HTTP), define su ruta:
const ODOO_PAYMENTS_ENDPOINT = process.env.ODOO_PAYMENTS_ENDPOINT || "/nexius/payment" // relativo al BASE_URL

// Timeout por defecto
const REQUEST_TIMEOUT_MS = Number(process.env.ODOO_TIMEOUT_MS || 8000)

export type OdooSyncResult = {
  ok: boolean
  status?: number
  data?: any
  error?: string
}

/**
 * Transforma una TransactionRecord a un payload neutro para Odoo.
 * Ajusta este mapeo según el endpoint que implementes en el módulo Odoo.
 */
type LicenseWithId = LicenseRecord & { _id?: string }

async function mapTransactionToOdooPayload(tx: TransactionRecord) {
  let license: LicenseWithId | null = null
  if (tx.licenseId) {
    try {
      const fetched = (await getLicenseById(tx.licenseId)) as LicenseWithId | null
      license = fetched
    } catch (err) {
      console.warn("[OdooSync] Failed to fetch license for transaction", {
        txId: tx._id,
        licenseId: tx.licenseId,
        error: (err as Error)?.message,
      })
    }
  }

  const baseAmount = Number(tx.amount || 0)
  const contactName = tx.contactName || license?.companyName || tx.payerNormalizedName || null
  const contactPhone = tx.contactPhone || license?.phoneNumber || null
  const contactEmail = tx.contactEmail || license?.email || null
  const contactDocument = tx.contactDocument || license?.rucOrDni || null

  const derivedProductName =
    tx.productName ||
    license?.serviceType ||
    (license?.domain ? `Servicio ${license.domain}` : null) ||
    (license?.licenseKey ? `Licencia ${license.licenseKey}` : null) ||
    "Pago Nexius"

  const rawProducts: TransactionProduct[] = Array.isArray(tx.products) && tx.products.length > 0
    ? tx.products
    : [
        {
          name: derivedProductName,
          quantity: 1,
          unitPrice: baseAmount,
          code: license?.licenseKey,
          description: license?.serviceType || undefined,
        },
      ]

  const products = rawProducts.map((item) => {
    const quantity = Number(item.quantity ?? 1) || 1
    const unitPrice = Number((item.unit_price ?? item.unitPrice) ?? baseAmount) || 0
    return {
      name: item.name || derivedProductName,
      quantity,
      unit_price: unitPrice,
      code: item.code ?? license?.licenseKey ?? null,
      description: item.description ?? license?.serviceType ?? null,
    }
  })

  const computedTotal = products.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const amount = baseAmount > 0 ? baseAmount : computedTotal

  return {
    external_transaction_id: tx._id,
    timestamp: tx.timestamp,
    date: tx.date || new Date(tx.timestamp).toISOString(),
    amount,
    currency: tx.currency || "PEN",
    type: tx.transactionType || "payment",
    contact_name: contactName,
    contact_phone: contactPhone,
    contact_email: contactEmail,
    contact_document: contactDocument,
    license_id: tx.licenseId || null,
    license_key: tx.licenseKey || license?.licenseKey || null,
    license_company_name: license?.companyName || null,
    license_service_type: license?.serviceType || null,
    license_domain: license?.domain || null,
    product_name: derivedProductName,
    products,
    message: tx.message || tx.notificationText || null,
    meta: {
      yape_code: tx.yapeCode || null,
      app_version: tx.appVersion || null,
      device_id: tx.deviceId || null,
      notification_title: tx.notificationTitle || null,
      notification_text: tx.notificationText || null,
      notification_big_text: tx.notificationBigText || null,
      license_id: tx.licenseId || null,
      license_key: license?.licenseKey || tx.licenseKey || null,
      license_company_name: license?.companyName || null,
      license_document: contactDocument,
      contact_email: contactEmail,
    },
  }
}

/**
 * Realiza fetch con timeout.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

/**
 * Envía una transacción a Odoo. Idempotencia basada en external_transaction_id que debe manejar el endpoint.
 * No lanza excepción; retorna objeto resultado para logging.
 */
export async function pushPaymentToOdoo(tx: TransactionRecord): Promise<OdooSyncResult> {
  if (!ODOO_ENABLED) {
    return { ok: false, error: "Odoo sync disabled (set ODOO_SYNC_ENABLED=true)", status: 503 }
  }
  if (!ODOO_BASE_URL) {
    return { ok: false, error: "ODOO_BASE_URL not configured" }
  }
  const url = `${ODOO_BASE_URL.replace(/\/$/, "")}${ODOO_PAYMENTS_ENDPOINT}`
  const payload = await mapTransactionToOdooPayload(tx)
  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Header de auth; adapta según tu implementación en Odoo
          Authorization: `Bearer ${ODOO_API_KEY}`,
          "X-External-Source": "nexius",
        },
        body: JSON.stringify(payload),
      },
      REQUEST_TIMEOUT_MS,
    )
    const status = res.status
    let data: any = null
    try {
      data = await res.json()
    } catch (_) {
      /* ignore parse error */
    }
    if (!res.ok) {
      return { ok: false, status, data, error: data?.error || `HTTP ${status}` }
    }
    return { ok: true, status, data }
  } catch (err: any) {
    return { ok: false, error: err?.message || "unknown error" }
  }
}

/**
 * Dispara la sincronización de forma no bloqueante.
 * Se usa después de insertar/upsert transacción. Si falla, sólo log.
 */
export function fireAndForgetOdooSync(tx: TransactionRecord) {
  // No await para no bloquear solicitud principal
  pushPaymentToOdoo(tx).then((res) => {
    if (!res.ok) {
      console.warn("[OdooSync] Failed", { txId: tx._id, error: res.error, status: res.status })
    } else {
      console.log("[OdooSync] OK", { txId: tx._id, status: res.status, odoo: res.data })
    }
  })
}
