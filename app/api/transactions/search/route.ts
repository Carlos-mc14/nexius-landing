import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

// /api/transactions/search?code=ABC123&amount=100&name=Carlos&licenseId=...&sinceHours=24
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')?.trim()
  const amount = url.searchParams.get('amount')
  const name = url.searchParams.get('name')?.trim()
  const licenseId = url.searchParams.get('licenseId')?.trim()
  const sinceHours = parseInt(url.searchParams.get('sinceHours') || '48', 10)

  const { db } = await connectToDatabase()

  const since = new Date(Date.now() - sinceHours * 3600 * 1000)
  const query: any = { timestamp: { $gte: since.getTime() } }

  if (code) query.yapeCode = code.toUpperCase()
  if (amount) query.amount = Number(amount)
  if (licenseId) query.licenseId = licenseId
  if (name) {
    // Try to match normalized name inside message or payerNormalizedName
    const norm = name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase()
    query.$or = [
      { payerNormalizedName: norm },
      { notificationText: { $regex: norm, $options: 'i' } },
      { notificationBigText: { $regex: norm, $options: 'i' } },
      { message: { $regex: norm, $options: 'i' } }
    ]
  }

  const docs = await db.collection('transactions').find(query).sort({ timestamp: -1 }).limit(20).toArray()
  const results = docs.map(d => ({ ...d, _id: d._id.toString() }))
  return NextResponse.json({ matches: results, count: results.length })
}
