import { NextResponse } from "next/server"
import { getBlogCategories } from "@/lib/blog"

export async function GET() {
  try {
    const categories = await getBlogCategories()
    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error("Error fetching blog categories:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
