import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getBlogPostById, updateBlogPost, deleteBlogPost } from "@/lib/blog"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const post = await getBlogPostById(id)

    if (!post) {
      return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(post, { status: 200 })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const canEditBlogPost = await checkPermission(session.user.id, "blog:edit")

    if (!canEditBlogPost) {
      return NextResponse.json({ error: "No tienes permisos para editar artículos" }, { status: 403 })
    }

    const data = await request.json()
    const post = await updateBlogPost(id, data)

    return NextResponse.json(post, { status: 200 })
  } catch (error) {
    console.error("Error updating blog post:", error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const canDeleteBlogPost = await checkPermission(session.user.id, "blog:edit")

    if (!canDeleteBlogPost) {
      return NextResponse.json({ error: "No tienes permisos para eliminar artículos" }, { status: 403 })
    }

    await deleteBlogPost(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
