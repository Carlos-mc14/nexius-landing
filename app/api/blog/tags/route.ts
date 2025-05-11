import { NextResponse } from "next/server"
import { getBlogTags } from "@/lib/blog"

export async function GET() {
  try {
    const tags = await getBlogTags()
    return NextResponse.json(tags, { status: 200 })
  } catch (error) {
    console.error("Error fetching blog tags:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
