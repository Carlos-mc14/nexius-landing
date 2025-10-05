import { NextResponse } from 'next/server'
import { upsertNotificationJob, findNotificationJobs } from '@/lib/licenseNotificationJobs'
import { requireApiKeyFromHeaders } from '@/lib/apiAuth'

// GET /api/license-notification-jobs?status=pending&limit=50
export async function GET(request: Request) {
  const url = new URL(request.url)
  const auth = requireApiKeyFromHeaders(request.headers)
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status })

  const status = url.searchParams.get('status') || undefined
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') || '25', 10) : undefined
  const jobs = await findNotificationJobs({ status, limit })
  return NextResponse.json(jobs)
}

// POST /api/license-notification-jobs  (upsert by hash, returns duplicate flag)
// Body: { rucOrDni, companyName, phoneNumber?, email?, licenseIds[], licenses[], severity, severityScore, totalBase, totalLate, totalDue, message, channel?, origin?, scheduledAt? }
export async function POST(request: Request) {
  const auth = requireApiKeyFromHeaders(request.headers)
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status })
  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const body = parsed.body

  const required = ['rucOrDni','companyName','licenseIds','licenses','severity','severityScore','totalBase','totalLate','totalDue','message']
  const missing = required.filter(k => body[k] == null)
  if (missing.length) {
    return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 })
  }

  try {
    const job = await upsertNotificationJob({
      rucOrDni: body.rucOrDni,
      companyName: body.companyName,
      phoneNumber: body.phoneNumber,
      email: body.email,
      licenseIds: body.licenseIds,
      licenses: body.licenses,
      severity: body.severity,
      severityScore: body.severityScore,
      totalBase: body.totalBase,
      totalLate: body.totalLate,
      totalDue: body.totalDue,
      message: body.message,
      channel: body.channel,
      origin: body.origin,
      scheduledAt: body.scheduledAt
    })
    return NextResponse.json(job, { status: job.duplicate ? 200 : 201 })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
