import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, Clock, FileText, Layers, Users, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getProjects } from "@/lib/projects"

export const revalidate = 0 // Disable caching for this page

export default async function PortfolioPage() {
  // Fetch projects
  const projects = await getProjects()

  // Calculate stats
  const totalProjects = projects.length
  const completedProjects = projects.filter((project) => project.status === "Completado").length
  const inProgressProjects = projects.filter((project) => project.status === "En Progreso").length

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
                <p className="text-muted-foreground mt-2">
                  Visualiza nuestros proyectos en curso y las estadísticas de rendimiento.
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Proyectos
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estadísticas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="projects" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Proyectos Totales</CardTitle>
                    <CardDescription>Total de proyectos en nuestra cartera</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{totalProjects}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Proyectos Completados</CardTitle>
                    <CardDescription>Proyectos entregados con éxito</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{completedProjects}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>En Desarrollo</CardTitle>
                    <CardDescription>Proyectos actualmente en progreso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{inProgressProjects}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Todos los Proyectos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden flex flex-col">
                      <div className="aspect-video relative">
                        <Image
                          src={
                            project.image ||
                            `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(project.name) || "/placeholder.svg"}`
                          }
                          alt={project.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{project.name}</CardTitle>
                          <Badge
                            variant={
                              project.status === "Completado"
                                ? "secondary"
                                : project.status === "En Progreso"
                                  ? "default"
                                  : project.status === "Retrasado"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {project.completionDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Completado: {new Date(project.completionDate).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        {project.demoUrl && (
                          <Link href={project.demoUrl} className="flex-1">
                            <Button variant="default" className="w-full" size="sm">
                              Ver demo <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {project.repoUrl && (
                          <Link href={project.repoUrl} className="flex-1">
                            <Button variant="outline" className="w-full" size="sm">
                              Repositorio
                            </Button>
                          </Link>
                        )}
                        <Link href={`/portafolio/${project.slug}`} className="flex-1">
                          <Button variant="secondary" className="w-full" size="sm">
                            Leer más <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Categorías</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Gráfico de distribución por categorías</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Proyectos por Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center">
                        <p className="text-muted-foreground">Gráfico de estados de proyectos</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Tecnologías Utilizadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center">
                        <p className="text-muted-foreground">Gráfico de tecnologías</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 dark:text-white">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">¿Listo para tu próximo proyecto?</h2>
              <p className="max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed dark:text-white">
                Contáctanos hoy mismo para discutir cómo podemos ayudarte a transformar tu negocio con soluciones
                digitales a medida.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/#contacto">
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
