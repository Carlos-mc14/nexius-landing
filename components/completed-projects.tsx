import Link from "next/link"
import Image from "next/image"
import { getTrelloProjects } from "@/lib/trello"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

export default async function CompletedProjects() {
  // Fetch all projects from Trello
  const projects = await getTrelloProjects()

  // Filter only completed projects
  const completedProjects = projects.filter((project: { status: string }) => project.status.toLowerCase() === "completado")

  // Limit to 6 projects for display on homepage
  const displayProjects = completedProjects.slice(0, 6)

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
      {displayProjects.length > 0
        ? displayProjects.map((project: { id: string; name: string; description: string; labels?: { id: string; name: string; color: string }[]; repoUrl?: string; demoUrl?: string }) => (
            <div key={project.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <Image
                src={`/placeholder.svg?height=300&width=400&text=${encodeURIComponent(project.name)}`}
                width={400}
                height={300}
                alt={project.name}
                className="aspect-video object-cover w-full"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <Badge variant="secondary">Completado</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{project.description}</p>

                {project.labels && project.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.labels.slice(0, 3).map((label: any) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getColorForLabel(label.color),
                          color: getLabelTextColor(label.color),
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}

                {(project.repoUrl || project.demoUrl) && (
                  <div className="flex gap-2 mt-4">
                    {project.repoUrl && (
                      <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Github className="mr-2 h-4 w-4" /> Repo
                        </Button>
                      </Link>
                    )}
                    {project.demoUrl && (
                      <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button size="sm" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" /> Demo
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        : // Fallback for when there are no completed projects
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <Image
                src={`/placeholder.svg?height=300&width=400&text=Proyecto ${index + 1}`}
                width={400}
                height={300}
                alt={`Proyecto ${index + 1}`}
                className="aspect-video object-cover w-full"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">Proyecto {index + 1}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {index % 2 === 0
                    ? "Sistema de gestión para restaurante con módulos de pedidos, inventario y fidelización."
                    : "Sitio web corporativo con integración de CRM y sistema de reservas online."}
                </p>
              </div>
            </div>
          ))}
    </div>
  )
}

// Helper functions from your project-list.tsx
function getColorForLabel(color: string): string {
  const colorMap: Record<string, string> = {
    green: "#61bd4f",
    yellow: "#f2d600",
    orange: "#ff9f1a",
    red: "#eb5a46",
    purple: "#c377e0",
    blue: "#0079bf",
    sky: "#00c2e0",
    lime: "#51e898",
    pink: "#ff78cb",
    black: "#344563",
  }

  return colorMap[color] ? `${colorMap[color]}20` : "#f3f4f6"
}

function getLabelTextColor(color: string): string {
  const darkColors = ["black"]
  return darkColors.includes(color) ? "#ffffff" : "#333333"
}

