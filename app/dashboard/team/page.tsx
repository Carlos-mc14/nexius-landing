import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTeamMembers } from "@/lib/team"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/dashboard/data-table"
import { columns } from "@/components/dashboard/team/columns"

export default async function TeamManagementPage() {
  const session = await getSession()
  const canManageTeam = session ? await checkPermission(session.user.id, "team:manage") : false
  const canAddTeamMember = session ? await checkPermission(session.user.id, "team:add") : false
  const teamMembers = await getTeamMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Gestión del Equipo</h3>
          <p className="text-muted-foreground">
            Administra los perfiles de los miembros del equipo que se muestran en el sitio.
          </p>
        </div>
        {canAddTeamMember && (
          <Link href="/dashboard/team/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Añadir Miembro
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Miembros del Equipo</CardTitle>
          <CardDescription>Lista de todos los miembros del equipo registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={teamMembers} />
        </CardContent>
      </Card>
    </div>
  )
}
