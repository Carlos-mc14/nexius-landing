import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/dashboard/users/user-form"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getUserById } from "@/lib/users"
import { getRoles } from "@/lib/roles"
import { notFound, redirect } from "next/navigation"

interface UserEditPageProps {
  params: {
    id: string
  }
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const session = await getSession()
  const { id } = await params

  if (!session) {
    redirect("/login") // Redirect to login if session is null
  }

  // Check if user can edit users
  const isOwnProfile = session.user.id === id
  const canManageUsers = await checkPermission(session.user.id, "users:manage")

  if (!isOwnProfile && !canManageUsers) {
    redirect("/dashboard")
  }

  const user = await getUserById(id)

  if (!user) {
    notFound()
  }

  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Editar Usuario</h3>
        <p className="text-muted-foreground">Actualiza la información y permisos de {user.name}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>Edita los detalles y permisos del usuario.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm initialData={user} roles={roles} />
        </CardContent>
      </Card>
    </div>
  )
}
