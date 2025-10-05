import { NextResponse } from 'next/server'
import { getNotificationJob, updateNotificationJob } from '@/lib/licenseNotificationJobs'
import { requireApiKeyFromHeaders } from '@/lib/apiAuth'

// GET /api/license-notification-jobs/:id
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const job = await getNotificationJob(params.id)
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(job)
}

// PATCH /api/license-notification-jobs/:id   Body: { status?, attempts?, sentAt?, scheduledAt? }
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = requireApiKeyFromHeaders(request.headers)
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status })
  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const body = parsed.body || {}

  // only allow limited fields
  const patch: any = {}
  for (const k of ['status','attempts','sentAt','scheduledAt','message','channel','severity','severityScore']) {
    if (k in body) patch[k] = body[k]
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }
  try {
    const updated = await updateNotificationJob(params.id, patch)
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
