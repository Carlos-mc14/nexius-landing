import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getProjectBySlug } from "@/lib/projects"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, ExternalLink, Github, Tag } from "lucide-react"
import type { Metadata } from "next"

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)

  if (!project) {
    return {
      title: "Proyecto no encontrado",
      description: "El proyecto que estás buscando no existe o ha sido eliminado.",
    }
  }

  return {
    title: project.name,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      images: [
        {
          url: project.image,
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug(params.slug)

  if (!project) {
    notFound()
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                {project.name}
              </h1>
              <p className="max-w-[700px] text-gray-300 md:text-xl">{project.description}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {project.tags &&
                  project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Back to Portfolio */}
              <Link
                href="/portafolio"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al portafolio
              </Link>

              {/* Main Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image
                  src={project.image || "/placeholder.svg?height=720&width=1280"}
                  alt={project.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Project Info */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {project.status && (
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={
                          project.status === "Completado"
                            ? "secondary"
                            : project.status === "En Progreso"
                              ? "default"
                              : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                  )}

                  {project.completionDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Completado: {formatDate(project.completionDate)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Project Description */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Sobre el proyecto</h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p>{project.description}</p>

                    {/* Si hay contenido detallado, mostrarlo aquí */}
                    {project.fullDescription && (
                      <div className="mt-4" dangerouslySetInnerHTML={{ __html: project.fullDescription }} />
                    )}
                  </div>
                </div>

                {/* Casos de uso */}
                {project.useCases && project.useCases.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Casos de uso</h2>
                    <div className="grid gap-4">
                      {project.useCases.map((useCase, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                            <p>{useCase.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {project.tags && project.tags.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Tecnologías utilizadas</h2>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {project.gallery && project.gallery.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Galería</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.gallery.map((image, index) => (
                        <div key={index} className="relative aspect-video overflow-hidden rounded-lg border">
                          <Image
                            src={image || "/placeholder.svg?height=720&width=1280"}
                            alt={`${project.name} - Imagen ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Links */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {project.demoUrl && (
                    <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Ver demo
                      </Button>
                    </Link>
                  )}

                  {project.repoUrl && (
                    <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="gap-2">
                        <Github className="h-4 w-4" />
                        Ver repositorio
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-1/3 space-y-6">
              {/* Project Details Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Detalles del proyecto</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className="font-medium">{project.status}</span>
                    </div>

                    {project.completionDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha de finalización:</span>
                        <span className="font-medium">{formatDate(project.completionDate)}</span>
                      </div>
                    )}

                    {project.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categoría:</span>
                        <span className="font-medium">{project.category}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Etiquetas</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">¿Interesado en un proyecto similar?</h3>
                  <p className="text-sm text-muted-foreground">
                    Contáctanos para discutir cómo podemos ayudarte a crear un proyecto a medida para tu negocio.
                  </p>
                  <Link href="/#contacto">
                    <Button className="w-full">Contactar</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
