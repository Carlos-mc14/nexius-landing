import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectForm } from "@/components/dashboard/projects/project-form"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function NewProjectPage() {
  const session = await getSession()
  if (!session) {
    redirect("/dashboard/projects")
    return null
  }

  const canAddProject = await checkPermission(session.user.id, "homepage:edit")

  if (!canAddProject) {
    redirect("/dashboard/projects")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Añadir Nuevo Proyecto</h3>
        <p className="text-muted-foreground">Crea un nuevo proyecto para mostrar en el portafolio.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>Completa la información del nuevo proyecto.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  )
}
