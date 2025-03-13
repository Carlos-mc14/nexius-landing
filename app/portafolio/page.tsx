import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, Clock, ExternalLink, FileText, Layers, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getTrelloProjects } from "@/lib/trello"
import { getCloudflareAnalytics } from "@/lib/cloudflare"
import ProjectList from "@/components/project-list"
import AnalyticsDashboard from "@/components/analytics-dashboard"

export const revalidate = 3600 // Revalidate data every hour

export default async function PortfolioPage() {
  // Fetch data in parallel
  const projectsPromise = getTrelloProjects()
  const analyticsPromise = getCloudflareAnalytics()

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Nuestro Portafolio
              </h1>
              <p className="max-w-[700px] text-gray-300 md:text-xl">
                Explora nuestros proyectos actuales y el impacto que generamos a través de nuestras soluciones
                digitales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <Tabs defaultValue="projects" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter">Dashboard de Proyectos</h2>
                <p className="text-gray-500 mt-2">
                  Visualiza nuestros proyectos en curso y las estadísticas de rendimiento.
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Proyectos
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analíticas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="projects" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Proyectos Activos</CardTitle>
                    <CardDescription>Total de proyectos en desarrollo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<Skeleton className="h-12 w-full" />}>
                      <ProjectCounter promise={projectsPromise} />
                    </Suspense>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Tiempo Promedio</CardTitle>
                    <CardDescription>Duración promedio de proyectos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">4.5 semanas</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Equipo Asignado</CardTitle>
                    <CardDescription>Desarrolladores en proyectos activos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">8 personas</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Suspense fallback={<ProjectListSkeleton />}>
                <ProjectList projectsPromise={projectsPromise} />
              </Suspense>
            </TabsContent>

            <TabsContent value="analytics">
              <Suspense fallback={<AnalyticsSkeleton />}>
                <AnalyticsDashboard analyticsPromise={analyticsPromise} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Proyectos Destacados</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Algunos de nuestros proyectos más exitosos que han transformado negocios.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Sistema de Reservas para Hotel Miraflores",
                description:
                  "Plataforma completa de gestión hotelera con módulos de reservas, check-in/out y facturación.",
                image: "/placeholder.svg?height=300&width=400&text=Hotel+Miraflores",
                tags: ["Next.js", "PostgreSQL", "API REST"],
                link: "#",
              },
              {
                title: "App de Delivery para Restaurante El Sabor",
                description:
                  "Aplicación móvil para pedidos a domicilio con seguimiento en tiempo real e integración con pasarela de pagos.",
                image: "/placeholder.svg?height=300&width=400&text=El+Sabor+App",
                tags: ["React Native", "Firebase", "Stripe"],
                link: "#",
              },
              {
                title: "E-commerce para ModoFashion",
                description:
                  "Tienda online con catálogo de productos, carrito de compras y gestión de inventario automatizada.",
                image: "/placeholder.svg?height=300&width=400&text=ModoFashion",
                tags: ["Next.js", "MongoDB", "AWS"],
                link: "#",
              },
              {
                title: "Dashboard Administrativo para Clínica San Pablo",
                description:
                  "Sistema de gestión de pacientes, citas médicas y expedientes clínicos con reportes estadísticos.",
                image: "/placeholder.svg?height=300&width=400&text=Clínica+San+Pablo",
                tags: ["React", "Node.js", "MySQL"],
                link: "#",
              },
              {
                title: "Plataforma Educativa para Instituto Tecnológico",
                description: "LMS con aulas virtuales, evaluaciones en línea y seguimiento de progreso de estudiantes.",
                image: "/placeholder.svg?height=300&width=400&text=Instituto+Tecnológico",
                tags: ["Vue.js", "Laravel", "PostgreSQL"],
                link: "#",
              },
              {
                title: "Sistema de Inventario para Distribuidora Nacional",
                description:
                  "Gestión de inventario con múltiples almacenes, trazabilidad de productos y reportes avanzados.",
                image: "/placeholder.svg?height=300&width=400&text=Distribuidora+Nacional",
                tags: ["React", "Express", "MongoDB"],
                link: "#",
              },
            ].map((project, index) => (
              <Card key={index} className="overflow-hidden flex flex-col">
                <div className="aspect-video relative">
                  <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={project.link}>
                    <Button variant="outline" className="w-full" size="sm">
                      Ver proyecto <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">¿Listo para tu próximo proyecto?</h2>
              <p className="max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed">
                Contáctanos hoy mismo para discutir cómo podemos ayudarte a transformar tu negocio con soluciones
                digitales a medida.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="#contacto">
                <Button variant="secondary" size="lg">
                  Solicitar cotización <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Component to display project count
async function ProjectCounter({ promise }: { promise: Promise<any[]> }) {
  const projects = await promise
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-5 w-5 text-muted-foreground" />
      <span className="text-2xl font-bold">{projects.length}</span>
    </div>
  )
}

// Skeletons for loading states
function ProjectListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}

