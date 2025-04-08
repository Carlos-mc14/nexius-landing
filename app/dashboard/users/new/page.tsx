import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/dashboard/users/user-form"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getRoles } from "@/lib/roles"

export default async function NewUserPage() {
  const session = await getSession()
  if (!session) {
    redirect("/dashboard/users")
  }

  const canManageUsers = await checkPermission(session.user.id, "users:manage")

  if (!canManageUsers) {
    redirect("/dashboard/users")
  }

  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Añadir Nuevo Usuario</h3>
        <p className="text-muted-foreground">Crea un nuevo usuario con acceso al panel de administración.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>Completa la información del nuevo usuario.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm roles={roles} />
        </CardContent>
      </Card>
    </div>
  )
}
