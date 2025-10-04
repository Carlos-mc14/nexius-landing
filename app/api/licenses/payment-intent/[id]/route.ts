import { NextResponse } from 'next/server'
import { createPaymentIntentForLicense } from '@/lib/licenses'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const lic = await createPaymentIntentForLicense(params.id)
    if (!lic) return NextResponse.json({ error: 'License not found' }, { status: 404 })
    return NextResponse.json({ licenseId: lic._id, code: lic.currentPaymentCode, expiresAt: lic.currentPaymentCodeExpiresAt })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
