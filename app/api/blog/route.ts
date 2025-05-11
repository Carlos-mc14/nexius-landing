import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { createBlogPost, getBlogPosts } from "@/lib/blog"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status") as "draft" | "published" | "all" | null
    const limit = url.searchParams.get("limit") ? Number.parseInt(url.searchParams.get("limit")!) : undefined
    const featured =
      url.searchParams.get("featured") === "true"
        ? true
        : url.searchParams.get("featured") === "false"
          ? false
          : undefined

    // Blog posts are public data, no authentication required for published posts
    const posts = await getBlogPosts({
      status: status || "published",
      limit,
      featured,
    })

    return NextResponse.json(posts, { status: 200 })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canAddBlogPost = await checkPermission(session.user.id, "blog:edit")

    if (!canAddBlogPost) {
      return NextResponse.json({ error: "No tienes permisos para añadir artículos" }, { status: 403 })
    }

    const data = await request.json()

    // Add author information from session
    data.author = {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image,
    }

    const post = await createBlogPost(data)

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating blog post:", error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
