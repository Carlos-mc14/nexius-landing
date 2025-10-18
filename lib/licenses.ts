import { connectToDatabase } from "./db"
import type { LicenseRecord, LicensePaymentRecord, ScheduleMode, LicenseChargeRecord } from "@/types/license"
import type { TransactionRecord } from "@/types/transaction"
import { ObjectId } from "mongodb"
import { fireAndForgetOdooSyncForLicense } from "./odoo"
import { getTransactionById } from "./transactions"

const COLLECTION = "licenses"
const MS_PER_DAY = 24 * 60 * 60 * 1000

function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function coerceNumber(value: any, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function coerceOptionalNumber(value: any): number | undefined {
  if (value === undefined || value === null) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function calculateMonthlyFirstProration(startDate: Date | null, baseAmount: number) {
  if (!startDate || !Number.isFinite(startDate.getTime())) return null
  const day = startDate.getDate()
  if (day <= 1) return null
  const totalDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
  if (totalDays <= 0) return null
  const remainingDays = totalDays - day + 1
  if (remainingDays <= 0) return null
  const ratio = remainingDays / totalDays
  const amount = roundMoney(baseAmount * ratio)
  if (amount <= 0) return null
  return {
    amount,
    daysCharged: remainingDays,
    daysInCycle: totalDays,
  }
}

async function ensureLicenseIntegrity(db: any, doc: any) {
  if (!doc) return doc
  const updates: Record<string, any> = {}

  if (!Array.isArray(doc.paymentHistory)) updates.paymentHistory = []
  if (!Array.isArray(doc.chargesHistory)) updates.chargesHistory = []
  const lateFeePct = coerceOptionalNumber(doc.lateFeePercentage)
  if (lateFeePct !== undefined) {
    const normalizedPct = roundMoney(lateFeePct)
    if (doc.lateFeePercentage !== normalizedPct) {
      updates.lateFeePercentage = normalizedPct
    }
  }
  const outstandingNumeric = coerceOptionalNumber(doc.outstandingBalance)
  if (outstandingNumeric === undefined) {
    updates.outstandingBalance = 0
  } else {
    const normalizedOutstanding = roundMoney(outstandingNumeric)
    if (doc.outstandingBalance !== normalizedOutstanding) {
      updates.outstandingBalance = normalizedOutstanding
    }
  }

  if (doc.scheduleMode === "monthly_first") {
    const currentGrace = coerceOptionalNumber(doc.gracePeriodDays)
    if (currentGrace === undefined || currentGrace < 1) {
      updates.gracePeriodDays = 1
    } else if (doc.gracePeriodDays !== currentGrace) {
      updates.gracePeriodDays = Math.max(1, Math.floor(currentGrace))
    }
  }

  if (!Object.keys(updates).length) return doc

  updates.updatedAt = new Date().toISOString()
  await db.collection(COLLECTION).updateOne({ _id: doc._id }, { $set: updates })
  const refreshed = await db.collection(COLLECTION).findOne({ _id: doc._id })
  return refreshed || { ...doc, ...updates }
}

async function applyLateFeeIfNeeded(db: any, doc: any) {
  if (!doc) return null
  const baseAmount = coerceNumber(doc.amount, 0)
  const configuredLateFeeAmount = coerceNumber(doc.lateFeeAmount, 0)
  const lateFeePct = coerceOptionalNumber(doc.lateFeePercentage)
  const derivedLateFee = lateFeePct !== undefined ? roundMoney(baseAmount * (lateFeePct / 100)) : 0
  const lateFeeAmount = configuredLateFeeAmount > 0 ? configuredLateFeeAmount : derivedLateFee
  if (lateFeeAmount <= 0) return null
  if (!doc.nextPaymentDue) return null
  if (doc.status === "cancelled") return null

  const dueDate = new Date(doc.nextPaymentDue)
  if (!Number.isFinite(dueDate.getTime())) return null

  const defaultGrace = doc.scheduleMode === "monthly_first" ? 1 : 0
  const graceCandidate = coerceOptionalNumber(doc.gracePeriodDays)
  const effectiveGrace = graceCandidate === undefined ? defaultGrace : Math.max(0, Math.floor(graceCandidate))
  const nowInstant = new Date()
  const nowDay = startOfDay(nowInstant)
  const dueAnchor = startOfDay(dueDate)
  const threshold = new Date(dueAnchor.getTime() + Math.max(1, effectiveGrace) * MS_PER_DAY)

  if (nowDay < threshold) {
    return null
  }

  const charges: LicenseChargeRecord[] = Array.isArray(doc.chargesHistory) ? doc.chargesHistory : []
  const periodKey = `late_fee:${doc.nextPaymentDue}`
  const alreadyApplied = charges.some((entry) => entry.type === "late_fee" && entry.periodKey === periodKey)
  const nowIso = nowInstant.toISOString()

  if (alreadyApplied) {
    if (doc.status !== "overdue") {
      await db.collection(COLLECTION).updateOne({ _id: doc._id }, { $set: { status: "overdue", updatedAt: nowIso } })
      const refreshed = await db.collection(COLLECTION).findOne({ _id: doc._id })
      return refreshed || doc
    }
    return null
  }

  const charge: LicenseChargeRecord = {
    type: "late_fee",
    periodKey,
    amount: roundMoney(lateFeeAmount),
    appliedAt: nowIso,
    description: `Late fee applied after grace period ending on ${threshold.toISOString()}`,
    periodStart: doc.endDate,
    periodEnd: doc.nextPaymentDue,
    metadata: {
      graceDays: effectiveGrace,
      percentage: lateFeePct,
    },
  }

  await db.collection(COLLECTION).updateOne(
    { _id: doc._id },
    {
      $push: { chargesHistory: charge },
      $inc: { outstandingBalance: charge.amount },
      $set: { status: "overdue", updatedAt: nowIso },
    },
  )

  const refreshed = await db.collection(COLLECTION).findOne({ _id: doc._id })
  return refreshed || { ...doc, chargesHistory: [...charges, charge], outstandingBalance: roundMoney(coerceNumber(doc.outstandingBalance, 0) + charge.amount), status: "overdue", updatedAt: nowIso }
}

async function normalizeLicenseDocument(db: any, doc: any) {
  if (!doc) return doc
  let hydrated = await ensureLicenseIntegrity(db, doc)
  const lateFeeApplied = await applyLateFeeIfNeeded(db, hydrated)
  if (lateFeeApplied) {
    hydrated = lateFeeApplied
  }
  return hydrated
}

function mapLicense(doc: any) {
  const normalized: any = { ...doc }
  if (normalized._id && typeof normalized._id !== "string") {
    normalized._id = normalized._id.toString()
  }
  return normalized as LicenseRecord & { _id: string }
}

function computeNextPaymentFromSchedule(mode: ScheduleMode | undefined, referenceDate?: Date): string | null {
  const now = referenceDate ? new Date(referenceDate) : new Date()
  if (!mode || mode === "manual") return null
  if (mode === "monthly_first") {
    // If today is before 1st of next month, set to next month 1st
    const d = new Date(now)
    d.setMonth(d.getMonth() + 1)
    d.setDate(1)
    d.setHours(0,0,0,0)
    return d.toISOString()
  }
  if (mode === "annual_jan5") {
    const year = now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() >= 5) ? now.getFullYear() + 1 : now.getFullYear()
    const d = new Date(year, 0, 5, 0, 0, 0, 0) // Jan is 0
    return d.toISOString()
  }
  return null
}

function extendPeriod(current: any): { endDate?: string, nextPaymentDue?: string } {
  const out: any = {}
  const mode: ScheduleMode | undefined = current?.scheduleMode
  if (mode && mode !== 'manual') {
    out.nextPaymentDue = computeNextPaymentFromSchedule(mode)
    if (mode === 'monthly_first') {
      // coverage until day before next 1st
      if (out.nextPaymentDue) {
        const end = new Date(out.nextPaymentDue)
        end.setDate(end.getDate() - 1)
        out.endDate = end.toISOString()
      }
    } else if (mode === 'annual_jan5') {
      if (out.nextPaymentDue) {
        const end = new Date(out.nextPaymentDue)
        end.setDate(end.getDate() - 1)
        out.endDate = end.toISOString()
      }
    }
    return out
  }
  // Fallback manual frequency-based extension
  let baseDate: Date = new Date()
  if (current?.endDate) baseDate = new Date(current.endDate)
  else if (current?.startDate) baseDate = new Date(current.startDate)
  if (current?.frequency === 'annual') {
    const end = new Date(baseDate)
    end.setFullYear(end.getFullYear() + 1)
    end.setDate(end.getDate() - 1)
    out.endDate = end.toISOString()
  } else {
    const end = new Date(baseDate)
    end.setMonth(end.getMonth() + 1)
    end.setDate(end.getDate() - 1)
    out.endDate = end.toISOString()
  }
  out.nextPaymentDue = out.endDate
  return out
}

export async function createLicense(payload: LicenseRecord) {
  const { db } = await connectToDatabase()
  const nowDate = new Date()
  const nowIso = nowDate.toISOString()
  // Ensure we don't pass a string _id to MongoDB insert
  const { _id, ...rest } = payload as any
  const doc: any = {
    ...rest,
    status: rest.status || "pending",
    paymentMethod: rest.paymentMethod || "transfer",
    createdAt: nowIso,
    updatedAt: nowIso,
  }

  // Generate licenseKey when missing
  if (!doc.licenseKey) doc.licenseKey = `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

  // Normalize monetary and tracking fields
  doc.amount = roundMoney(coerceNumber(doc.amount, 0))
  doc.lateFeeAmount = roundMoney(coerceNumber(doc.lateFeeAmount, doc.lateFeeAmount ?? 0))
  const lateFeePct = coerceOptionalNumber(doc.lateFeePercentage)
  doc.lateFeePercentage = lateFeePct !== undefined ? roundMoney(lateFeePct) : undefined
  doc.outstandingBalance = roundMoney(coerceNumber(doc.outstandingBalance, 0))
  doc.paymentHistory = Array.isArray(doc.paymentHistory) ? doc.paymentHistory : []
  doc.chargesHistory = Array.isArray(doc.chargesHistory) ? doc.chargesHistory : []

  if (!doc.startDate) {
    doc.startDate = nowIso
  }

  // Handle schedule modes
  if (doc.scheduleMode && doc.scheduleMode !== 'manual') {
    // override endDate/nextPaymentDue using schedule mode
    const period = extendPeriod(doc)
    doc.endDate = period.endDate
    doc.nextPaymentDue = period.nextPaymentDue
    if (doc.scheduleMode === 'monthly_first') {
      const providedGrace = typeof doc.gracePeriodDays === 'number' && Number.isFinite(doc.gracePeriodDays) ? doc.gracePeriodDays : undefined
      doc.gracePeriodDays = providedGrace && providedGrace >= 1 ? providedGrace : 1
    }
  } else {
    // If startDate provided but no endDate, compute endDate from frequency
    if (doc.startDate && !doc.endDate) {
      const start = new Date(doc.startDate)
      if (doc.frequency === "annual") {
        const end = new Date(start)
        end.setFullYear(end.getFullYear() + 1)
        end.setDate(end.getDate() - 1)
        doc.endDate = end.toISOString()
      } else {
        // monthly
        const end = new Date(start)
        end.setMonth(end.getMonth() + 1)
        end.setDate(end.getDate() - 1)
        doc.endDate = end.toISOString()
      }
    }
    if (doc.endDate) {
      doc.nextPaymentDue = doc.endDate
    }
  }

  if (doc.scheduleMode === 'monthly_first') {
    const proration = calculateMonthlyFirstProration(doc.startDate ? new Date(doc.startDate) : null, doc.amount)
    if (proration) {
      const periodKey = `proration:${doc.startDate}:${doc.nextPaymentDue || doc.endDate || ''}`
      const charge: LicenseChargeRecord = {
        type: 'proration',
        periodKey,
        amount: proration.amount,
        appliedAt: nowIso,
        description: 'Initial proration for partial month coverage',
        periodStart: doc.startDate,
        periodEnd: doc.endDate,
        metadata: {
          daysCharged: proration.daysCharged,
          daysInCycle: proration.daysInCycle,
        },
      }
      doc.proratedAmountDue = proration.amount
      doc.proratedDays = proration.daysCharged
      doc.billingCycleDays = proration.daysInCycle
      doc.chargesHistory.push(charge)
      doc.outstandingBalance = roundMoney(coerceNumber(doc.outstandingBalance, 0) + proration.amount)
    } else {
      delete doc.proratedAmountDue
      delete doc.proratedDays
      delete doc.billingCycleDays
    }
  }

  const res = await db.collection(COLLECTION).insertOne(doc)
  return mapLicense({ ...doc, _id: res.insertedId })
}

export async function updateLicense(id: string, update: Partial<LicenseRecord>) {
  const { db } = await connectToDatabase()
  const _id = new ObjectId(id)
  const now = new Date().toISOString()
  // Load current document once
  const current = await db.collection(COLLECTION).findOne({ _id })
  if (!current) return null

  const patch: any = { ...update }
  const paymentDetails = (update as any)?.payment && typeof (update as any).payment === 'object'
    ? (update as any).payment
    : null
  if (paymentDetails) {
    delete patch.payment
  }

  const explicitPaymentAmountRaw = (update as any)?.paymentAmount ?? paymentDetails?.amount
  if (Object.prototype.hasOwnProperty.call(patch, 'paymentAmount')) delete patch.paymentAmount
  const explicitPaymentAmount = coerceOptionalNumber(explicitPaymentAmountRaw)

  const explicitPaymentNotesRaw = paymentDetails?.notes ?? (update as any)?.paymentNotes
  const explicitPaymentNotes = typeof explicitPaymentNotesRaw === 'string' ? explicitPaymentNotesRaw : undefined
  if (Object.prototype.hasOwnProperty.call(patch, 'paymentNotes')) delete patch.paymentNotes

  const explicitLateFeePortion = coerceOptionalNumber(paymentDetails?.lateFeePortion)
  const paymentMethodOverride = paymentDetails?.method
  const paymentCurrencyOverride = paymentDetails?.currency

  if (patch.lateFeeAmount !== undefined) {
    patch.lateFeeAmount = roundMoney(coerceNumber(patch.lateFeeAmount, 0))
  }
  if (patch.lateFeePercentage !== undefined) {
    const pct = coerceOptionalNumber(patch.lateFeePercentage)
    patch.lateFeePercentage = pct !== undefined ? roundMoney(pct) : undefined
  }
  if (patch.outstandingBalance !== undefined) {
    patch.outstandingBalance = roundMoney(coerceNumber(patch.outstandingBalance, 0))
  }

  const prospectiveSchedule: ScheduleMode | undefined = patch.scheduleMode ?? current.scheduleMode
  if (prospectiveSchedule === 'monthly_first') {
    if (patch.gracePeriodDays !== undefined) {
      patch.gracePeriodDays = Math.max(1, coerceNumber(patch.gracePeriodDays, 1))
    } else if (typeof current.gracePeriodDays !== 'number' || current.gracePeriodDays < 1) {
      patch.gracePeriodDays = 1
    }
  }
  let triggerOdooSync = false
  let odooTransactionId: string | null = null

  let paymentFullySettled = false
  let paymentAlreadyLogged = false

  // Status transition to paid => add payment history + extend period
  if (update.status === "paid") {
    patch.paidAt = update.paidAt || now
    const paymentAmount = roundMoney(explicitPaymentAmount ?? coerceNumber(current.amount, 0))
    const payment: LicensePaymentRecord = {
      amount: paymentAmount,
      currency: paymentCurrencyOverride ?? current.currency,
      paidAt: patch.paidAt,
      method: paymentMethodOverride ?? current.paymentMethod,
      periodStart: current.startDate || current.endDate,
      periodEnd: current.endDate,
      createdAt: now
    }
    if (explicitPaymentNotes) payment.notes = explicitPaymentNotes
    if (explicitLateFeePortion !== undefined) {
      const sanitizedLateFeePortion = roundMoney(Math.max(0, Math.min(paymentAmount, explicitLateFeePortion)))
      payment.lateFeePortion = sanitizedLateFeePortion
    }
    const incomingTransactionId = typeof patch.transactionId === "string" ? patch.transactionId : undefined
    const existingHistory: LicensePaymentRecord[] = Array.isArray(current.paymentHistory) ? current.paymentHistory : []
    const alreadyLogged = incomingTransactionId
      ? existingHistory.some((entry) => entry.transactionId === incomingTransactionId)
      : false
    paymentAlreadyLogged = alreadyLogged

    if (incomingTransactionId) {
      payment.transactionId = incomingTransactionId
      patch.lastTransactionId = incomingTransactionId
      odooTransactionId = incomingTransactionId
      triggerOdooSync = !alreadyLogged
    }
    if (!Array.isArray(current.paymentHistory)) {
      await db.collection(COLLECTION).updateOne({ _id }, { $set: { paymentHistory: [] } })
    }
    if (!alreadyLogged) {
      await db.collection(COLLECTION).updateOne({ _id }, { $push: { paymentHistory: { $each: [payment] } } as any })
    }

    if (!alreadyLogged) {
      const currentOutstanding = coerceNumber(current.outstandingBalance, 0)
      const newOutstanding = Math.max(0, roundMoney(currentOutstanding - paymentAmount))
      patch.outstandingBalance = newOutstanding
          paymentFullySettled = newOutstanding <= 0.01
      if (current.proratedAmountDue !== undefined) {
        const remainingProration = Math.max(0, roundMoney(coerceNumber(current.proratedAmountDue, 0) - paymentAmount))
        patch.proratedAmountDue = remainingProration > 0 ? remainingProration : null
      } else if (newOutstanding === 0 && patch.proratedAmountDue === undefined) {
        patch.proratedAmountDue = null
      }
          if (paymentFullySettled) {
            const extended = extendPeriod({ ...current, ...patch })
            patch.endDate = extended.endDate
            patch.nextPaymentDue = extended.nextPaymentDue
          } else {
            patch.status = 'pending'
          }
    }
    // Clear any pending payment intent
    patch.currentPaymentCode = null
    patch.currentPaymentCodeExpiresAt = null
    if (!paymentAlreadyLogged) {
      patch.paymentVerificationState = paymentFullySettled ? 'verified' : (current.paymentVerificationState || 'awaiting')
    } else if (!Object.prototype.hasOwnProperty.call(patch, 'paymentVerificationState') && current.paymentVerificationState) {
      patch.paymentVerificationState = current.paymentVerificationState
    }
  }

  // Schedule mode handling
  const incomingSchedule: ScheduleMode | undefined = prospectiveSchedule
  const scheduleChanged = patch.scheduleMode && patch.scheduleMode !== current.scheduleMode

  if (scheduleChanged) {
    if (incomingSchedule && incomingSchedule !== 'manual') {
      const synthetic = { ...current, ...patch, scheduleMode: incomingSchedule }
      const period = extendPeriod(synthetic)
      patch.endDate = period.endDate
      patch.nextPaymentDue = period.nextPaymentDue
    } else if (incomingSchedule === 'manual') {
      const effectiveEnd = patch.endDate || current.endDate
      if (effectiveEnd) patch.nextPaymentDue = effectiveEnd
    }
  } else {
    // Enforce consistency if manual
    if (incomingSchedule === 'manual') {
      const effectiveEnd = patch.endDate || current.endDate
      if (effectiveEnd && (current.nextPaymentDue !== effectiveEnd) && !patch.nextPaymentDue) {
        patch.nextPaymentDue = effectiveEnd
      }
    }
  }

  // If schedule is automatic and user attempted manual date tweak, override with computed
  if ((incomingSchedule === 'monthly_first' || incomingSchedule === 'annual_jan5') && (patch.endDate || patch.nextPaymentDue)) {
    const synthetic = { ...current, ...patch, scheduleMode: incomingSchedule }
    const period = extendPeriod(synthetic)
    patch.endDate = period.endDate
    patch.nextPaymentDue = period.nextPaymentDue
  }

  // Remove immutable fields if present
  delete patch._id
  delete patch.id

  await db.collection(COLLECTION).updateOne({ _id }, { $set: { ...patch, updatedAt: now } })
  let doc = await db.collection(COLLECTION).findOne({ _id })
  if (!doc) return null

  const normalizedDoc = await normalizeLicenseDocument(db, doc)
  if (!normalizedDoc) return null
  const normalized = mapLicense(normalizedDoc)

  if (triggerOdooSync && odooTransactionId) {
    try {
      const tx = await getTransactionById(odooTransactionId)
      if (!tx) {
        console.warn("[OdooSync] Transaction not found for license", { licenseId: id, transactionId: odooTransactionId })
      } else {
        const enrichedTx = {
          ...tx,
          licenseId: tx.licenseId ?? normalized._id,
          licenseKey: tx.licenseKey ?? normalized.licenseKey,
          contactName: tx.contactName ?? normalized.companyName,
          contactPhone: tx.contactPhone ?? normalized.phoneNumber,
          contactEmail: tx.contactEmail ?? normalized.email,
          contactDocument: tx.contactDocument ?? normalized.rucOrDni,
        } as TransactionRecord
        fireAndForgetOdooSyncForLicense(normalized as LicenseRecord, enrichedTx)
      }
    } catch (err) {
      console.warn("[OdooSync] Failed to schedule license sync", {
        licenseId: id,
        transactionId: odooTransactionId,
        error: (err as Error)?.message,
      })
    }
  }

  return normalized
}

export async function getLicenseById(id: string) {
  const { db } = await connectToDatabase()
  const doc = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  const normalized = await normalizeLicenseDocument(db, doc)
  if (!normalized) return null
  return mapLicense(normalized)
}

export async function findLicenses(query: Record<string, any> = {}, options: { limit?: number } = {}) {
  const { db } = await connectToDatabase()
  const cursor = db.collection(COLLECTION).find(query).sort({ createdAt: -1 })
  if (options.limit && options.limit > 0) {
    cursor.limit(options.limit)
  }
  const docs = await cursor.toArray()
  const normalized = [] as Array<LicenseRecord & { _id: string }>
  for (const doc of docs) {
    const hydrated = await normalizeLicenseDocument(db, doc)
    if (hydrated) normalized.push(mapLicense(hydrated))
  }
  return normalized
}

export async function findLicenseByDomain(domain: string) {
  const { db } = await connectToDatabase()
  const doc = await db.collection(COLLECTION).findOne({ domain })
  if (!doc) return null
  const normalized = await normalizeLicenseDocument(db, doc)
  if (!normalized) return null
  return mapLicense(normalized)
}

export async function createPaymentIntentForLicense(id: string, ttlMinutes = 60) {
  const { db } = await connectToDatabase()
  const _id = new ObjectId(id)
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const expires = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
  await db.collection(COLLECTION).updateOne({ _id }, { $set: { currentPaymentCode: code, currentPaymentCodeExpiresAt: expires, paymentVerificationState: 'awaiting' } })
  const doc = await db.collection(COLLECTION).findOne({ _id })
  if (!doc) return null
  const normalized = await normalizeLicenseDocument(db, doc)
  if (!normalized) return null
  const mapped = mapLicense(normalized)
  return { ...mapped, currentPaymentCode: code, currentPaymentCodeExpiresAt: expires }
}
