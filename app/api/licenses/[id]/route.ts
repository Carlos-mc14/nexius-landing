import { NextResponse } from "next/server"
import { getLicenseById, updateLicense } from "@/lib/licenses"

export async function GET(request: Request, { params }: { params: any }) {
  const { id } = params
  const doc = await getLicenseById(id)
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(doc)
}

export async function PUT(request: Request, { params }: { params: any }) {
  const { id } = params
  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const body = parsed.body
  const updated = await updateLicense(id, body)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}
