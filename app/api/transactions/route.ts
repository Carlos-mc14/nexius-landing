import { NextResponse } from "next/server"
import { insertTransaction, insertManyTransactions, upsertTransaction } from "@/lib/transactions"
import type { TransactionRecord } from "@/types/transaction"
import { requireApiKeyFromHeaders } from "@/lib/apiAuth"

const MAX_BATCH = 50

function validateTx(tx: any) {
  // minimal required fields: _id (or allow missing), timestamp, amount
  if (tx == null) return { ok: false, reason: "empty" }
  if (typeof tx.amount === "undefined") return { ok: false, reason: "amount required" }
  if (typeof tx.timestamp === "undefined") return { ok: false, reason: "timestamp required" }
  if (tx._id && !/^[a-f0-9]{24}$/.test(tx._id)) return { ok: false, reason: "invalid _id" }
  return { ok: true }
}

export async function POST(request: Request) {
  const check = requireApiKeyFromHeaders(request.headers)
  if (!check.ok) return NextResponse.json(check.body, { status: check.status })

  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const body = parsed.body

  // handle batch
  if (Array.isArray(body)) {
    if (body.length === 0) return NextResponse.json({ error: "Empty array" }, { status: 400 })
    if (body.length > MAX_BATCH) return NextResponse.json({ error: "Batch too large" }, { status: 413 })

    const insertedIds: string[] = []
    let insertedCount = 0
    for (const tx of body) {
      const v = validateTx(tx)
      if (!v.ok) return NextResponse.json({ error: "Invalid payload", details: v.reason }, { status: 400 })
      try {
        // prefer upsert for idempotency
        if (tx._id) {
          const res = await upsertTransaction(tx as TransactionRecord)
          if (res) {
            insertedIds.push(res._id)
            insertedCount++
          }
        } else {
          const res = await insertTransaction(tx as TransactionRecord)
          insertedIds.push(res._id)
          insertedCount++
        }
      } catch (err: any) {
        // continue on errors for other docs
        // if duplicate detected earlier, skip
        if (err?.code === 11000) continue
      }
    }

    return NextResponse.json({ status: "ok", insertedCount, insertedIds })
  }

  // single object
  const v = validateTx(body)
  if (!v.ok) return NextResponse.json({ error: "Invalid payload", details: v.reason }, { status: 400 })

  try {
    if (body._id) {
      const res = await upsertTransaction(body as TransactionRecord)
      if (!res) return NextResponse.json({ error: "Failed to upsert" }, { status: 500 })
      // if the document already existed, upsert returns the existing doc; we can detect by checking createdAt
      return NextResponse.json({ status: "ok", insertedId: res._id }, { status: 201 })
    } else {
      const res = await insertTransaction(body as TransactionRecord)
      if ((res as any)?.duplicate) return NextResponse.json({ error: "Duplicate", existingId: (res as any).existingId }, { status: 409 })
      return NextResponse.json({ status: "ok", insertedId: res._id }, { status: 201 })
    }
  } catch (err: any) {
    if (err?.code === 11000) return NextResponse.json({ error: "Duplicate" }, { status: 409 })
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // simple listing for debugging in the browser; protect with api key as well
  const check = requireApiKeyFromHeaders(request.headers)
  if (!check.ok) return NextResponse.json(check.body, { status: check.status })

  const limit = Number(new URL(request.url).searchParams.get("limit") || "100")
  const { findTransactions } = await import("@/lib/transactions")
  const list = await findTransactions(limit)
  return NextResponse.json(list)
}
