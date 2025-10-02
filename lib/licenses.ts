import { connectToDatabase } from "./db"
import type { LicenseRecord } from "@/types/license"
import { ObjectId } from "mongodb"

const COLLECTION = "licenses"

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

  // Compute nextPaymentDue as endDate (renewal) if autoRenew enabled or simply endDate
  if (doc.endDate) {
    doc.nextPaymentDue = doc.endDate
  }
  const res = await db.collection(COLLECTION).insertOne(doc)
  return { ...doc, _id: res.insertedId.toString() }
}

export async function updateLicense(id: string, update: Partial<LicenseRecord>) {
  const { db } = await connectToDatabase()
  const _id = new ObjectId(id)
  const now = new Date().toISOString()
  // If update contains status -> paid, handle paidAt and extend endDate
  const patch: any = { ...update }
  if (update.status === "paid") {
    patch.paidAt = update.paidAt || now

    // Attempt to extend endDate by frequency
    const current = await db.collection(COLLECTION).findOne({ _id })
    let baseDate: Date | null = null
    if (current?.endDate) baseDate = new Date(current.endDate)
    else if (current?.startDate) baseDate = new Date(current.startDate)
    else baseDate = new Date()

    if (current?.frequency === "annual") {
      const end = new Date(baseDate)
      end.setFullYear(end.getFullYear() + 1)
      end.setDate(end.getDate() - 1)
      patch.endDate = end.toISOString()
    } else {
      const end = new Date(baseDate)
      end.setMonth(end.getMonth() + 1)
      end.setDate(end.getDate() - 1)
      patch.endDate = end.toISOString()
    }
    // If autoRenew is enabled, set nextPaymentDue to the new endDate
    if (current?.autoRenew) {
      patch.nextPaymentDue = patch.endDate
    } else {
      patch.nextPaymentDue = null
    }
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
