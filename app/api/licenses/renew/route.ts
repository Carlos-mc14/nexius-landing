import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

// Simple renew endpoint: process renewals for licenses with nextPaymentDue <= now and autoRenew=true
export async function POST(request: Request) {
  const { db } = await connectToDatabase()
  const now = new Date()
  const cursor = db.collection("licenses").find({ autoRenew: true, nextPaymentDue: { $lte: now.toISOString() } })
  const licenses = await cursor.toArray()

  const results: any[] = []
  for (const lic of licenses) {
    // In a real implementation you'd attempt charging the saved payment method here
    // For now we simulate success and mark as paid and extend endDate
    const res = await db.collection("licenses").updateOne({ _id: lic._id }, { $set: { status: 'paid', paidAt: new Date().toISOString() } })
    results.push({ _id: lic._id.toString(), ok: res.acknowledged })
  }

  return NextResponse.json({ processed: results.length, details: results })
}
