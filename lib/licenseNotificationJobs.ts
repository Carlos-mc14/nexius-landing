import { connectToDatabase } from './db'
import type { LicenseNotificationJob, LicenseNotificationLog } from '@/types/licenseNotificationJob'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'

const JOBS_COLLECTION = 'licenseNotificationJobs'
const LOGS_COLLECTION = 'licenseNotificationLogs'

function jobHash(job: Omit<LicenseNotificationJob,'hash'|'_id'|'status'|'attempts'|'createdAt'|'updatedAt'>) {
  const base = JSON.stringify({
    rucOrDni: job.rucOrDni,
    licenseIds: [...job.licenseIds].sort(),
    totalDue: job.totalDue.toFixed(2),
    severity: job.severity,
    message: job.message.trim().slice(0,512) // limit
  })
  return crypto.createHash('sha1').update(base).digest('hex')
}

export async function upsertNotificationJob(payload: Omit<LicenseNotificationJob,'_id'|'status'|'attempts'|'hash'|'createdAt'|'updatedAt'>) {
  const { db } = await connectToDatabase()
  const now = new Date().toISOString()
  const hash = jobHash(payload)
  const existing = await db.collection(JOBS_COLLECTION).findOne({ hash })
  if (existing) {
    return { ...existing, _id: existing._id.toString(), duplicate: true }
  }
  const doc: any = {
    ...payload,
    licenseIds: payload.licenseIds,
    channel: payload.channel,
    origin: payload.origin,
    status: 'pending',
    attempts: 0,
    hash,
    createdAt: now,
    updatedAt: now,
    scheduledAt: payload.scheduledAt || now
  }
  const res = await db.collection(JOBS_COLLECTION).insertOne(doc)
  return { ...doc, _id: res.insertedId.toString(), duplicate: false }
}

export async function findNotificationJobs(filter: { status?: string, limit?: number } = {}) {
  const { db } = await connectToDatabase()
  const q: any = {}
  if (filter.status) q.status = filter.status
  const limit = filter.limit || 25
  const cursor = db.collection(JOBS_COLLECTION).find(q).sort({ severityScore: -1, createdAt: 1 }).limit(limit)
  const docs = await cursor.toArray()
  return docs.map(d => ({ ...d, _id: d._id.toString() }))
}

export async function getNotificationJob(id: string) {
  const { db } = await connectToDatabase()
  const doc = await db.collection(JOBS_COLLECTION).findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function updateNotificationJob(id: string, patch: Partial<LicenseNotificationJob>) {
  const { db } = await connectToDatabase()
  const _id = new ObjectId(id)
  const now = new Date().toISOString()
  delete (patch as any)._id
  await db.collection(JOBS_COLLECTION).updateOne({ _id }, { $set: { ...patch, updatedAt: now } })
  const doc = await db.collection(JOBS_COLLECTION).findOne({ _id })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function logNotification(entry: Omit<LicenseNotificationLog,'_id'|'createdAt'>) {
  const { db } = await connectToDatabase()
  const now = new Date().toISOString()
  const doc = { ...entry, createdAt: now }
  const res = await db.collection(LOGS_COLLECTION).insertOne(doc)
  return { ...doc, _id: res.insertedId.toString() }
}
