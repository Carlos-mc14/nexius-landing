"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/lib/projects"

export default function CompletedProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Cambiar para obtener todos los proyectos destacados, no solo los completados
        const response = await fetch("/api/projects?featured=true")
        if (!response.ok) {
          throw new Error("Error al cargar los proyectos")
        }
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border bg-white shadow-sm animate-pulse">
            <div className="aspect-video w-full bg-gray-200"></div>
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-5xl mt-12 text-center">
        <p className="text-muted-foreground">No hay proyectos destacados para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden flex flex-col">
          <div className="aspect-video relative">
            <Image
              src={project.image || `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(project.name)}`}
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
              {project.tags &&
                project.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
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
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
