import { NextResponse } from 'next/server'
import { upsertNotificationJob, findNotificationJobs } from '@/lib/licenseNotificationJobs'
import type { LicenseNotificationJob } from '@/types/licenseNotificationJob'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status') || undefined
  const limit = parseInt(url.searchParams.get('limit') || '25', 10)
  const jobs = await findNotificationJobs({ status, limit })
  return NextResponse.json(jobs)
}

export async function POST(request: Request) {
  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const body = parsed.body
  const inputs = Array.isArray(body) ? body : [body]
  const created: any[] = []
  for (const raw of inputs) {
    // minimal validation
    if (!raw.rucOrDni || !raw.licenseIds || !raw.message) {
      return NextResponse.json({ error: 'rucOrDni, licenseIds, message required' }, { status: 400 })
    }
    const payload: Omit<LicenseNotificationJob,'_id'|'status'|'attempts'|'hash'|'createdAt'|'updatedAt'> = {
      rucOrDni: raw.rucOrDni,
      companyName: raw.companyName || raw.rucOrDni,
      phoneNumber: raw.phoneNumber,
      email: raw.email,
      licenseIds: raw.licenseIds,
      licenses: raw.licenses || [],
      severity: raw.severity || 'info',
      severityScore: raw.severityScore || 0,
      totalBase: raw.totalBase || 0,
      totalLate: raw.totalLate || 0,
      totalDue: raw.totalDue || 0,
      message: raw.message,
      scheduledAt: raw.scheduledAt || null,
    }
    const res = await upsertNotificationJob(payload)
    created.push(res)
  }
  return NextResponse.json({ created })
}
