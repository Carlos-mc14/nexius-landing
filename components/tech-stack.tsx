import type { IconType } from "react-icons"
import { Card, CardContent } from "@/components/ui/card"

export interface Technology {
  name: string
  icon: IconType
}

interface TechStackProps {
  technologies: Technology[]
}

export default function TechStack({ technologies }: TechStackProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tecnologías</h3>
        <div className="flex flex-wrap gap-4">
          {technologies.map((tech) => {
            const IconComponent = tech.icon
            return (
              <div key={tech.name} className="flex flex-col items-center">
                <div className="h-12 w-12 mb-2 flex items-center justify-center">
                  <IconComponent className="h-8 w-8" />
                </div>
                <span className="text-xs text-gray-600">{tech.name}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

