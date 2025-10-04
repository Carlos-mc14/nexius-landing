import { NextResponse } from "next/server"
import { createLicense, findLicenses } from "@/lib/licenses"

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams
  const domain = q.get("domain")

  if (domain) {
    // Redirect to verify endpoint handler
    return NextResponse.redirect(`/api/licenses/verify?domain=${encodeURIComponent(domain)}`)
  }

  const list = await findLicenses()
  return NextResponse.json(list)
}

export async function POST(request: Request) {
  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const body = parsed.body
  // Minimal validation
  if (!body.companyName || !body.amount || !body.frequency) {
    return NextResponse.json({ error: "companyName, amount and frequency are required" }, { status: 400 })
  }

  // Generate a simple license key if not provided
  if (!body.licenseKey) {
    body.licenseKey = `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  }

  // Set defaults for new license
  body.status = body.status || "pending"
  body.paymentMethod = body.paymentMethod || "transfer"

  const created = await createLicense(body)
  return NextResponse.json(created, { status: 201 })
}
