import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamMemberForm } from "@/components/dashboard/team/team-member-form"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getTeamMemberById } from "@/lib/team"
import { notFound, redirect } from "next/navigation"

interface TeamMemberEditPageProps {
  params: {
    id: string
  }
}

export default async function TeamMemberEditPage({ params }: TeamMemberEditPageProps) {
  const session = await getSession()
  const { id } = await params

  // Check if user can edit this team member
  const isOwnProfile = session?.user?.teamMemberId === id
  const canManageTeam = session ? await checkPermission(session.user.id, "team:manage") : false

  if (!isOwnProfile && !canManageTeam) {
    redirect("/dashboard/team")
  }

  const teamMember = await getTeamMemberById(id)

  if (!teamMember) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Editar Miembro del Equipo</h3>
        <p className="text-muted-foreground">Actualiza la información del perfil de {teamMember.name}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Miembro</CardTitle>
          <CardDescription>Edita los detalles del perfil del miembro del equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberForm initialData={teamMember} />
        </CardContent>
      </Card>
    </div>
  )
}
