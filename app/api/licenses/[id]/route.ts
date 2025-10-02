import { NextResponse } from "next/server"
import { getLicenseById, updateLicense } from "@/lib/licenses"

export async function GET(request: Request, { params }: { params: any }) {
  const { id } = await params
  const doc = await getLicenseById(id)
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(doc)
}

export async function PUT(request: Request, { params }: { params: any }) {
  const { id } = await params
  const body = await request.json()
  const updated = await updateLicense(id, body)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}
