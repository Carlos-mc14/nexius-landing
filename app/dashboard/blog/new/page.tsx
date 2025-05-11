import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BlogPostForm } from "@/components/dashboard/blog/blog-post-form"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function NewBlogPostPage() {
  const session = await getSession()
  if (!session) {
    redirect("/dashboard/blog")
    return null
  }

  const canAddBlogPost = await checkPermission(session.user.id, "homepage:edit")

  if (!canAddBlogPost) {
    redirect("/dashboard/blog")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Crear Nuevo Artículo</h3>
        <p className="text-muted-foreground">Crea un nuevo artículo para el blog.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Artículo</CardTitle>
          <CardDescription>Completa la información del nuevo artículo.</CardDescription>
        </CardHeader>
        <CardContent>
          <BlogPostForm />
        </CardContent>
      </Card>
    </div>
  )
}
