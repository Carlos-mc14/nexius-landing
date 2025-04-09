import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProjects } from "@/lib/projects"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/dashboard/data-table"
import { columns } from "@/components/dashboard/projects/columns"

export default async function ProjectsManagementPage() {
  const session = await getSession()
  const canManageProjects = session 
    ? await checkPermission(session.user.id, "homepage:edit") 
    : false;
  const projects = await getProjects()

  // Convertir explícitamente las fechas a string para evitar problemas de tipo
  const formattedProjects = projects.map((project) => ({
    ...project,
    // Asegurarse de que completionDate sea siempre string o undefined
    completionDate:
      typeof project.completionDate === "string"
        ? project.completionDate
        : project.completionDate instanceof Date
          ? project.completionDate.toISOString()
          : undefined,
    // Convertir otras fechas a string si es necesario
    createdAt: project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
    updatedAt: project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Gestión de Proyectos</h3>
          <p className="text-muted-foreground">
            Administra los proyectos que se muestran en el portafolio y la página principal.
          </p>
        </div>
        {canManageProjects && (
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Añadir Proyecto
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos</CardTitle>
          <CardDescription>Lista de todos los proyectos registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={formattedProjects}
            searchColumn="name"
            searchPlaceholder="Buscar por nombre..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
