import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamMemberForm } from "@/components/dashboard/team/team-member-form"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function NewTeamMemberPage() {
  const session = await getSession()
  if (!session) {
    redirect("/dashboard/team")
    return
  }
  const canAddTeamMember = await checkPermission(session.user.id, "team:add")

  if (!canAddTeamMember) {
    redirect("/dashboard/team")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Añadir Nuevo Miembro</h3>
        <p className="text-muted-foreground">Crea un nuevo perfil para un miembro del equipo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Miembro</CardTitle>
          <CardDescription>Completa la información del nuevo miembro del equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberForm />
        </CardContent>
      </Card>
    </div>
  )
}
