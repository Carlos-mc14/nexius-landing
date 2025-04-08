import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUsers } from "@/lib/users"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/dashboard/data-table"
import { columns } from "@/components/dashboard/users/columns"

export default async function UsersManagementPage() {
  const session = await getSession()
  if (!session) {
    redirect("/dashboard")
  }

  const canManageUsers = await checkPermission(session.user.id, "users:manage")

  if (!canManageUsers) {
    redirect("/dashboard")
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h3>
          <p className="text-muted-foreground">Administra los usuarios y sus permisos en el sistema.</p>
        </div>
        <Link href="/dashboard/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Añadir Usuario
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Lista de todos los usuarios registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>
    </div>
  )
}

