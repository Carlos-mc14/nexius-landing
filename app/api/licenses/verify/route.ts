import { NextResponse } from "next/server"
import { findLicenseByDomain } from "@/lib/licenses"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const providedKey = request.headers.get("x-api-key") || url.searchParams.get("apiKey")
  const serverKey = process.env.NEXIUS_API_KEY || ""

  if (!serverKey) {
    return NextResponse.json({ error: "Server API key not configured" }, { status: 500 })
  }

  if (!providedKey || providedKey !== serverKey) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }
  const domain = url.searchParams.get("domain")
  const licenseKey = url.searchParams.get("licenseKey")

  if (!domain && !licenseKey) {
    return NextResponse.json({ error: "domain or licenseKey required" }, { status: 400 })
  }

  let doc = null
  if (domain) {
    doc = await findLicenseByDomain(domain)
  }

  // fallback by licenseKey
  if (!doc && licenseKey) {
    // brute force search
    const all = await (await fetch(`${url.origin}/api/licenses`).then((r) => r.json()))
    doc = all.find((d: any) => d.licenseKey === licenseKey)
  }

  if (!doc) return NextResponse.json({ valid: false }, { status: 404 })

  // basic validation: check dates and grace period
  const now = new Date()
  const end = doc.endDate ? new Date(doc.endDate) : null
  let valid = true
  if (end) {
    if (now > end) {
      // check grace period
      const grace = doc.gracePeriodDays || 0
      const graceUntil = new Date(end.getTime() + grace * 24 * 3600 * 1000)
      if (now > graceUntil) valid = false
    }
  }

  return NextResponse.json({ valid, license: doc })
}
