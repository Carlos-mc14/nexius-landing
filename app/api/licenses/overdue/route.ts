import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { requireApiKeyFromHeaders } from '@/lib/apiAuth'

// GET /api/licenses/overdue?grace=true&limit=100
// Lists licenses whose endDate (or nextPaymentDue) is past now. If grace=true, still include those within grace period.
export async function GET(request: Request) {
  const auth = requireApiKeyFromHeaders(request.headers)
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status })
  const url = new URL(request.url)
  const includeGrace = url.searchParams.get('grace') === 'true'
  const limit = parseInt(url.searchParams.get('limit') || '100', 10)
  const now = new Date()
  const { db } = await connectToDatabase()

  // Build query: endDate < now OR (nextPaymentDue < now)
  const q: any = {
    $or: [
      { endDate: { $lt: now.toISOString() } },
      { nextPaymentDue: { $lt: now.toISOString() } }
    ],
    status: { $ne: 'cancelled' }
  }

  const cursor = db.collection('licenses').find(q).limit(limit)
  const raw = await cursor.toArray()

  interface LicDoc { _id: any; endDate?: string; gracePeriodDays?: number; nextPaymentDue?: string; status?: string }
  const list = raw.map(r => ({ ...(r as LicDoc), _id: (r as any)._id.toString() }))
    .filter((r: LicDoc) => {
      if (includeGrace) return true
      if (!r.endDate) return true
      const end = new Date(r.endDate)
      if (now <= end) return false
      const graceDays = r.gracePeriodDays || 0
      if (graceDays > 0) {
        const graceUntil = new Date(end.getTime() + graceDays * 86400000)
        return now > graceUntil
      }
      return true
    })

  return NextResponse.json({ count: list.length, items: list })
}
