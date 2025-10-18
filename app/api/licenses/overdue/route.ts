import { NextResponse } from 'next/server'
import { requireApiKeyFromHeaders } from '@/lib/apiAuth'
import { findLicenses } from '@/lib/licenses'

// GET /api/licenses/overdue?grace=true&limit=100
// Lists licenses whose endDate (or nextPaymentDue) is past now. If grace=true, still include those within grace period.
export async function GET(request: Request) {
  const auth = requireApiKeyFromHeaders(request.headers)
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status })
  const url = new URL(request.url)
  const includeGrace = url.searchParams.get('grace') === 'true'
  const limit = parseInt(url.searchParams.get('limit') || '100', 10)
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 100
  const now = new Date()
  const nowIso = now.toISOString()

  const candidates = await findLicenses({
    $or: [
      { endDate: { $lt: nowIso } },
      { nextPaymentDue: { $lt: nowIso } }
    ],
    status: { $ne: 'cancelled' }
  }, { limit: safeLimit })

  const items = candidates.filter((license) => {
    if (includeGrace) return true
    if (!license.endDate) return true
    const end = new Date(license.endDate)
    if (now <= end) return false
    const graceDays = license.gracePeriodDays || 0
    if (graceDays > 0) {
      const graceUntil = new Date(end.getTime() + graceDays * 86400000)
      return now > graceUntil
    }
    return true
  })

  return NextResponse.json({ count: items.length, items })
}
