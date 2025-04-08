import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { getDashboardStats } from "@/lib/dashboard"
import { Activity, Users, FileText, CheckCircle, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await getSession()
  const stats = await getDashboardStats()

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros del Equipo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeTeamMembers} miembros activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground">{stats.completedProjects} completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonios</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testimonials}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingTestimonials} pendientes de revisión</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivities}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 días</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Contenido de la Página Principal</CardTitle>
              <CardDescription>Gestiona el contenido que se muestra en la página principal</CardDescription>
            </div>
            <Link href="/dashboard/homepage">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border p-3">
                  <h3 className="text-sm font-medium">Hero Section</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Título, subtítulo y botones de acción</p>
                </div>
                <div className="rounded-md border p-3">
                  <h3 className="text-sm font-medium">Servicios</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{stats.services} servicios configurados</p>
                </div>
                <div className="rounded-md border p-3">
                  <h3 className="text-sm font-medium">Testimonios</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{stats.testimonials} testimonios activos</p>
                </div>
                <div className="rounded-md border p-3">
                  <h3 className="text-sm font-medium">Por qué elegirnos</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{stats.whyChooseUs} razones configuradas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Equipo</CardTitle>
              <CardDescription>Gestiona los perfiles del equipo</CardDescription>
            </div>
            <Link href="/dashboard/team">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Gestionar
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTeamUpdates.map((update, i) => (
                <div key={i} className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-primary"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{update.title}</p>
                    <p className="text-xs text-muted-foreground">{update.date}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/dashboard/team/new">
                  <Button size="sm" className="w-full">
                    Añadir nuevo miembro
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
