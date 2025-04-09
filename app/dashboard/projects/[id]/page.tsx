import { getProjectById } from "@/lib/projects"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { notFound } from "next/navigation"
import { ProjectForm } from "@/components/dashboard/projects/project-form"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getSession()
  const { id } = await params
  if (!session) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold tracking-tight">Acceso Denegado</h3>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  const canManageProjects = await checkPermission(session.user.id, "homepage:edit")

  if (!canManageProjects) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold tracking-tight">Acceso Denegado</h3>
        <p className="text-muted-foreground">No tienes permisos para editar proyectos.</p>
      </div>
    )
  }

  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  // Convertir explícitamente las fechas a string para evitar problemas de tipo
  const formattedProject = {
    ...project,
    // Asegurarse de que completionDate sea siempre string o undefined
    completionDate:
      typeof project.completionDate === "string"
        ? project.completionDate
        : project.completionDate instanceof Date
          ? project.completionDate.toISOString()
          : undefined,
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Editar Proyecto</h3>
        <p className="text-muted-foreground">Actualiza la información del proyecto.</p>
      </div>

      <ProjectForm initialData={formattedProject} />
    </div>
  )
}
