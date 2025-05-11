import { NextResponse } from "next/server"
import { getBlogPostBySlug } from "@/lib/blog"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const post = await getBlogPostBySlug(slug)

    if (!post) {
      return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(post, { status: 200 })
  } catch (error) {
    console.error("Error fetching blog post by slug:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
