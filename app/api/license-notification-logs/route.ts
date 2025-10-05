import { NextResponse } from 'next/server'
import { logNotification } from '@/lib/licenseNotificationJobs'

export async function POST(request: Request) {
  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const body = parsed.body
  if (!body.rucOrDni || !body.licenseIds || !body.severity || !body.totalDue || !body.sentAt) {
    return NextResponse.json({ error: 'rucOrDni, licenseIds, severity, totalDue, sentAt required' }, { status: 400 })
  }
  const res = await logNotification({
    jobId: body.jobId,
    rucOrDni: body.rucOrDni,
    licenseIds: body.licenseIds,
    severity: body.severity,
    totalDue: body.totalDue,
    messageLength: (body.message || '').length,
    conversationId: body.conversationId,
    sentAt: body.sentAt,
  })
  return NextResponse.json(res, { status: 201 })
}
