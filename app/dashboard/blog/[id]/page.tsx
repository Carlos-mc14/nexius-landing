import { getBlogPostById } from "@/lib/blog"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { notFound } from "next/navigation"
import { BlogPostForm } from "@/components/dashboard/blog/blog-post-form"

interface BlogPostPageProps {
  params: {
    id: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const session = await getSession()
  const { id } = params

  if (!session) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold tracking-tight">Acceso Denegado</h3>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  const canManageBlog = await checkPermission(session.user.id, "homepage:edit")

  if (!canManageBlog) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold tracking-tight">Acceso Denegado</h3>
        <p className="text-muted-foreground">No tienes permisos para editar artículos del blog.</p>
      </div>
    )
  }

  const post = await getBlogPostById(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Editar Artículo</h3>
        <p className="text-muted-foreground">Actualiza la información del artículo.</p>
      </div>

      <BlogPostForm initialData={post} />
    </div>
  )
}
