import { connectToDatabase } from "./db"
import type { TransactionRecord } from "@/types/transaction"
import { ObjectId } from "mongodb"
import { fireAndForgetOdooSync } from "./odoo"

const COLLECTION = "transactions"

export async function insertTransaction(payload: TransactionRecord) {
  const { db } = await connectToDatabase()
  const now = new Date().toISOString()
  const { _id, ...rest } = payload as any
  const doc: any = {
    ...rest,
    amount: Number(rest.amount) || 0,
    currency: rest.currency || "PEN",
    transactionType: rest.transactionType || "",
    createdAt: now,
    updatedAt: now,
  }

  if (_id) {
    try {
      // Convert _id to ObjectId when inserting
      const oid = new ObjectId(_id)
      await db.collection(COLLECTION).insertOne({ _id: oid, ...doc })
      const stored = { ...doc, _id }
      try {
        fireAndForgetOdooSync(stored as TransactionRecord)
      } catch (e) {
        console.warn("[OdooSync] Unexpected error scheduling sync", e)
      }
      return stored
    } catch (err: any) {
      // Duplicate key or invalid id
      if (err?.code === 11000) {
        return { duplicate: true, existingId: _id }
      }
      throw err
    }
  }

  const res = await db.collection(COLLECTION).insertOne(doc)
  const stored = { ...doc, _id: res.insertedId.toString() }
  // Sincronizar con Odoo en segundo plano (no crítico para la respuesta al cliente)
  try {
    fireAndForgetOdooSync(stored as TransactionRecord)
  } catch (e) {
    console.warn("[OdooSync] Unexpected error scheduling sync", e)
  }
  return stored
}

export async function upsertTransaction(payload: TransactionRecord) {
  const { db } = await connectToDatabase()
  const now = new Date().toISOString()
  const { _id, ...rest } = payload as any
  if (!_id) throw new Error("_id required for upsert")
  const oid = new ObjectId(_id)
  const doc: any = {
    ...rest,
    amount: Number(rest.amount) || 0,
    currency: rest.currency || "PEN",
  }
  await db
    .collection(COLLECTION)
    .updateOne({ _id: oid }, { $setOnInsert: { ...doc, createdAt: now }, $set: { updatedAt: now } }, { upsert: true })
  const found = await db.collection(COLLECTION).findOne({ _id: oid })
  if (!found) return null
  const stored = { ...found, _id: found._id.toString() }
  try {
    fireAndForgetOdooSync(stored as TransactionRecord)
  } catch (e) {
    console.warn("[OdooSync] Unexpected error scheduling sync", e)
  }
  return stored
}

export async function insertManyTransactions(docs: TransactionRecord[]) {
  const { db } = await connectToDatabase()
  const now = new Date().toISOString()
  if (!Array.isArray(docs)) throw new Error("docs must be array")
  if (docs.length === 0) return { insertedCount: 0, insertedIds: [] }

  // limit check should be done before calling this function
  const ops = docs.map((d) => {
    const { _id, ...rest } = d as any
    const doc: any = {
      ...rest,
      amount: Number(rest.amount) || 0,
      currency: rest.currency || "PEN",
      createdAt: now,
      updatedAt: now,
    }
    if (_id) {
      try {
        doc._id = new ObjectId(_id)
      } catch (_) {
        // skip invalid id, let Mongo generate one
      }
    }
    return { insertOne: { document: doc } }
  })

  const res = await db.collection(COLLECTION).bulkWrite(ops, { ordered: false })
  // Collect inserted ids: bulkWrite doesn't return insertedIds consistently; re-query recent
  const insertedCount = res.insertedCount || 0
  return { insertedCount, result: res }
}

export async function findTransactions(limit = 100) {
  const { db } = await connectToDatabase()
  const cursor = db.collection(COLLECTION).find({}).sort({ timestamp: -1 }).limit(limit)
  const docs = await cursor.toArray()
  return docs.map((d) => ({ ...d, _id: d._id.toString() }))
}

export async function getTransactionById(id: string) {
  const { db } = await connectToDatabase()
  const doc = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function updateTransaction(id: string, patch: Partial<TransactionRecord>) {
  const { db } = await connectToDatabase()
  const now = new Date().toISOString()
  const _id = new ObjectId(id)
  delete (patch as any)._id
  await db.collection(COLLECTION).updateOne({ _id }, { $set: { ...patch, updatedAt: now } })
  const doc = await db.collection(COLLECTION).findOne({ _id })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}
