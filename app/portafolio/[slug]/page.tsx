import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getProjectBySlug } from "@/lib/projects"
import { getSeoConfig } from "@/lib/seo"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, ExternalLink, Github, Tag } from "lucide-react"
import type { Metadata } from "next"
import { GalleryWithModal } from "@/components/gallery-with-modal"

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: ProjectPageProps): Promise<Metadata> {
  const params = await props.params;
  const project = await getProjectBySlug(params.slug)
  const seoConfig = await getSeoConfig()

  if (!project) {
    return {
      title: "Proyecto no encontrado | " + seoConfig.title,
      description: "El proyecto que estás buscando no existe o ha sido eliminado.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  // Construir título SEO optimizado
  const title = `${project.name} | Proyecto de ${seoConfig.title}`
  
  // Construir descripción SEO optimizada
  const description = project.description || `Descubre ${project.name}, un proyecto desarrollado por ${seoConfig.title}. ${project.tags?.slice(0, 3).join(', ')}.`

  // Construir keywords dinámicas
  const projectKeywords = [
    project.name.toLowerCase(),
    ...(project.tags || []),
    project.category?.toLowerCase() || '',
    'proyecto', 'desarrollo', 'portfolio'
  ].filter(Boolean).join(', ')

  const combinedKeywords = `${projectKeywords}, ${seoConfig.keywords}`

  // URL canónica
  const canonicalUrl = `${seoConfig.siteUrl}/portafolio/${params.slug}`

  // Datos estructurados para el proyecto
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.name,
    "description": project.description,
    "image": project.image ? `${seoConfig.siteUrl}${project.image}` : `${seoConfig.siteUrl}${seoConfig.ogImage}`,
    "url": canonicalUrl,
    "creator": {
      "@type": "Organization",
      "name": seoConfig.title,
      "url": seoConfig.siteUrl
    },
    "dateCreated": project.completionDate,
    "genre": project.category,
    "keywords": project.tags?.join(', '),
    ...(project.demoUrl && { "workExample": project.demoUrl }),
    ...(project.repoUrl && { "codeRepository": project.repoUrl })
  }

  return {
    title,
    description,
    keywords: combinedKeywords,
    
    // URLs canónicas y alternativas
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph
    openGraph: {
      title: project.name,
      description,
      url: canonicalUrl,
      siteName: seoConfig.title,
      type: 'website',
      images: [
        {
          url: project.image ? `${seoConfig.siteUrl}${project.image}` : `${seoConfig.siteUrl}${seoConfig.ogImage}`,
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
      locale: 'es_ES',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: project.name,
      description,
      images: [project.image ? `${seoConfig.siteUrl}${project.image}` : `${seoConfig.siteUrl}${seoConfig.ogImage}`],
      ...(seoConfig.twitterHandle && { site: seoConfig.twitterHandle }),
      ...(seoConfig.twitterHandle && { creator: seoConfig.twitterHandle }),
    },

    // Metadatos adicionales
    other: {
      // Datos estructurados JSON-LD
      'script:ld+json': JSON.stringify(structuredData),
      
      // Metadatos personalizados de SEO config
      ...seoConfig.additionalMetaTags?.reduce((acc, tag) => {
        acc[tag.name] = tag.content
        return acc
      }, {} as Record<string, string>),

      // Metadatos específicos del proyecto
      'article:author': seoConfig.title,
      'article:section': project.category || 'Proyecto',
      'article:tag': project.tags?.join(', '),
      
      // Metadatos para redes sociales
      'og:image:alt': project.name,
      'og:image:type': 'image/jpeg',
      'og:locale': 'es_ES',
      
      // Metadatos técnicos
      'theme-color': seoConfig.themeColor,
      'color-scheme': 'light dark',
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Metadatos para móviles
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },

    // Verificación de propiedad si está configurada
    ...(seoConfig.googleAnalyticsId && {
      verification: {
        google: seoConfig.googleAnalyticsId,
      },
    }),

    // App links si hay demo URL
    ...(project.demoUrl && {
      appLinks: {
        web: {
          url: project.demoUrl,
        },
      },
    }),
  }
}

export default async function ProjectPage(props: ProjectPageProps) {
  const params = await props.params;
  const project = await getProjectBySlug(params.slug)
  const seoConfig = await getSeoConfig()

  if (!project) {
    notFound()
  }

  // Breadcrumb estructurado para SEO
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": seoConfig.siteUrl
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Portafolio",
        "item": `${seoConfig.siteUrl}/portafolio`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": project.name,
        "item": `${seoConfig.siteUrl}/portafolio/${params.slug}`
      }
    ]
  }

  return (
    <>
      {/* JSON-LD para breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />

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
                {/* Breadcrumb navigation */}
                <nav aria-label="Breadcrumb" className="text-sm">
                  <ol className="flex items-center space-x-2 text-muted-foreground">
                    <li>
                      <Link href="/" className="hover:text-primary">
                        Inicio
                      </Link>
                    </li>
                    <span>/</span>
                    <li>
                      <Link href="/portafolio" className="hover:text-primary">
                        Portafolio
                      </Link>
                    </li>
                    <span>/</span>
                    <li aria-current="page" className="text-foreground font-medium">
                      {project.name}
                    </li>
                  </ol>
                </nav>

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
                    alt={`Imagen principal del proyecto ${project.name}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
                  />
                </div>

                {/* Project Info */}
                <article className="space-y-6">
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
                        <time dateTime={typeof project.completionDate === "string" ? project.completionDate : project.completionDate?.toISOString()}>
                          Completado: {formatDate(project.completionDate)}
                        </time>
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
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold">Casos de uso</h2>
                      <div className="grid gap-4" role="list">
                        {project.useCases.map((useCase, index) => (
                          <Card key={index} role="listitem">
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                              <p>{useCase.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Technologies */}
                  {project.tags && project.tags.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold">Tecnologías utilizadas</h2>
                      <div className="flex flex-wrap gap-2" role="list" aria-label="Lista de tecnologías">
                        {project.tags.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-sm" role="listitem">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Gallery - Ahora usando el componente cliente */}
                  <GalleryWithModal project={project} />

                  {/* Project Links */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {project.demoUrl && (
                      <Link 
                        href={project.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={`Ver demo en vivo de ${project.name}`}
                      >
                        <Button className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Ver demo
                        </Button>
                      </Link>
                    )}

                    {project.repoUrl && (
                      <Link 
                        href={project.repoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={`Ver código fuente de ${project.name} en GitHub`}
                      >
                        <Button variant="outline" className="gap-2">
                          <Github className="h-4 w-4" />
                          Ver repositorio
                        </Button>
                      </Link>
                    )}
                  </div>
                </article>
              </div>

              {/* Sidebar */}
              <aside className="w-full md:w-1/3 space-y-6">
                {/* Project Details Card */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Detalles del proyecto</h3>

                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Estado:</dt>
                        <dd className="font-medium">{project.status}</dd>
                      </div>

                      {project.completionDate && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Fecha de finalización:</dt>
                          <dd className="font-medium">
                            <time dateTime={typeof project.completionDate === "string" ? project.completionDate : project.completionDate?.toISOString()}>
                              {formatDate(project.completionDate)}
                            </time>
                          </dd>
                        </div>
                      )}

                      {project.category && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Categoría:</dt>
                          <dd className="font-medium">{project.category}</dd>
                        </div>
                      )}
                    </dl>

                    <Separator />

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Etiquetas</span>
                        </div>
                        <div className="flex flex-wrap gap-2" role="list" aria-label="Etiquetas del proyecto">
                          {project.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs" role="listitem">
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
                    <Link href="/#contacto" aria-label="Ir a la sección de contacto">
                      <Button className="w-full">Contactar</Button>
                    </Link>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}