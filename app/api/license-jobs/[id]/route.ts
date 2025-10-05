import { NextResponse } from 'next/server'
import { getNotificationJob, updateNotificationJob } from '@/lib/licenseNotificationJobs'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const doc = await getNotificationJob(params.id)
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(doc)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const body = parsed.body
  const updated = await updateNotificationJob(params.id, body)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}
