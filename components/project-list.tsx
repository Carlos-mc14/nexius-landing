import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, Github } from "lucide-react"

export default async function ProjectList({ projectsPromise }: { projectsPromise: Promise<any[]> }) {
  const projects = await projectsPromise

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Proyectos en Desarrollo</h3>
        <Link href="https://trello.com/b/yourboard" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            Ver en Trello <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description || "Sin descripción"}</CardDescription>
                </div>
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {project.labels && project.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.labels.map((label: any) => (
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

                {project.members && project.members.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Equipo asignado:</p>
                    <div className="flex -space-x-2">
                      {project.members.map((member: any) => (
                        <div
                          key={member.id}
                          className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                          title={member.fullName}
                        >
                          {member.initials || member.fullName.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                {project.repoUrl && (
                  <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Github className="mr-2 h-4 w-4" /> Repositorio
                    </Button>
                  </Link>
                )}
                {project.demoUrl && (
                  <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" /> Demo
                    </Button>
                  </Link>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No hay proyectos activos en este momento</p>
              <Link href="#contacto">
                <Button>Contáctanos para iniciar tu proyecto</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "en progreso":
      return "default"
    case "completado":
      return "secondary"
    case "retrasado":
      return "destructive"
    default:
      return "outline"
  }
}

// Función para convertir los colores de Trello a colores hexadecimales
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

// Función para determinar el color del texto basado en el color de fondo
function getLabelTextColor(color: string): string {
  const darkColors = ["blue", "purple", "black"]
  return darkColors.includes(color) ? "#ffffff" : "#333333"
}

