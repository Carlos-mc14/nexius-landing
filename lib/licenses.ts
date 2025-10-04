import { connectToDatabase } from "./db"
import type { LicenseRecord, LicensePaymentRecord, ScheduleMode } from "@/types/license"
import { ObjectId } from "mongodb"

const COLLECTION = "licenses"

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
  const now = new Date().toISOString()
  // Ensure we don't pass a string _id to MongoDB insert
  const { _id, ...rest } = payload as any
  const doc: any = {
    ...rest,
    status: rest.status || "pending",
    paymentMethod: rest.paymentMethod || "transfer",
    createdAt: now,
    updatedAt: now,
  }

  // Generate licenseKey when missing
  if (!doc.licenseKey) doc.licenseKey = `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

  // Handle schedule modes
  if (doc.scheduleMode && doc.scheduleMode !== 'manual') {
    // override endDate/nextPaymentDue using schedule mode
    const period = extendPeriod(doc)
    doc.endDate = period.endDate
    doc.nextPaymentDue = period.nextPaymentDue
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

  if (!doc.paymentHistory) doc.paymentHistory = []
  const res = await db.collection(COLLECTION).insertOne(doc)
  return { ...doc, _id: res.insertedId.toString() }
}

export async function updateLicense(id: string, update: Partial<LicenseRecord>) {
  const { db } = await connectToDatabase()
  const _id = new ObjectId(id)
  const now = new Date().toISOString()
  // Load current document once
  const current = await db.collection(COLLECTION).findOne({ _id })
  if (!current) return null

  const patch: any = { ...update }

  // Status transition to paid => add payment history + extend period
  if (update.status === "paid") {
    patch.paidAt = update.paidAt || now
    const payment: LicensePaymentRecord = {
      amount: current.amount,
      currency: current.currency,
      paidAt: patch.paidAt,
      method: current.paymentMethod,
      periodStart: current.startDate || current.endDate,
      periodEnd: current.endDate,
      createdAt: now
    }
    if (!Array.isArray(current.paymentHistory)) {
      await db.collection(COLLECTION).updateOne({ _id }, { $set: { paymentHistory: [] } })
    }
    await db.collection(COLLECTION).updateOne({ _id }, { $push: { paymentHistory: { $each: [payment] } } as any })

    const extended = extendPeriod(current)
    patch.endDate = extended.endDate
    patch.nextPaymentDue = extended.nextPaymentDue
  }

  // Schedule mode handling
  const incomingSchedule: ScheduleMode | undefined = patch.scheduleMode ?? current.scheduleMode
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
  const doc = await db.collection(COLLECTION).findOne({ _id })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function getLicenseById(id: string) {
  const { db } = await connectToDatabase()
  const doc = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function findLicenses(query: Record<string, any> = {}) {
  const { db } = await connectToDatabase()
  const cursor = db.collection(COLLECTION).find(query).sort({ createdAt: -1 })
  const docs = await cursor.toArray()
  return docs.map((d) => ({ ...d, _id: d._id.toString() }))
}

export async function findLicenseByDomain(domain: string) {
  const { db } = await connectToDatabase()
  const doc = await db.collection(COLLECTION).findOne({ domain })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}
