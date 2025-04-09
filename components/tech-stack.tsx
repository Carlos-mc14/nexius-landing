import type React from "react"
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiTailwindcss,
  SiPython,
  SiDjango,
  SiFigma,
  SiAdobephotoshop,
  SiAdobeillustrator,
  SiMongodb,
  SiPostgresql,
  SiDocker,
  SiRedis,
  SiUbuntu,
  SiMysql,
  SiAdobepremierepro,
  SiAdobeindesign,
  SiAdobeaftereffects,
  SiCinema4D,
} from "react-icons/si"
import { Card, CardContent } from "@/components/ui/card"

export interface Technology {
  name: string
  icon: string // Changed from IconType to string
}

interface TechStackProps {
  technologies: Technology[]
}

// Map of icon names to their components
const iconMap: Record<string, React.ReactNode> = {
  SiReact: <SiReact className="h-8 w-8" />,
  SiNextdotjs: <SiNextdotjs className="h-8 w-8" />,
  SiTypescript: <SiTypescript className="h-8 w-8" />,
  SiJavascript: <SiJavascript className="h-8 w-8" />,
  SiNodedotjs: <SiNodedotjs className="h-8 w-8" />,
  SiTailwindcss: <SiTailwindcss className="h-8 w-8" />,
  SiPython: <SiPython className="h-8 w-8" />,
  SiDjango: <SiDjango className="h-8 w-8" />,
  SiFigma: <SiFigma className="h-8 w-8" />,
  SiAdobephotoshop: <SiAdobephotoshop className="h-8 w-8" />,
  SiAdobeillustrator: <SiAdobeillustrator className="h-8 w-8" />,
  SiMongodb: <SiMongodb className="h-8 w-8" />,
  SiPostgresql: <SiPostgresql className="h-8 w-8" />,
  SiDocker: <SiDocker className="h-8 w-8" />,
  SiRedis: <SiRedis className="h-8 w-8" />,
  SiUbuntu: <SiUbuntu className="h-8 w-8" />,
  SiMysql: <SiMysql className="h-8 w-8" />,
  SiAdobepremierepro: <SiAdobepremierepro className="h-8 w-8" />,
  SiAdobeindesign: <SiAdobeindesign className="h-8 w-8" />,
  SiAdobeaftereffects: <SiAdobeaftereffects className="h-8 w-8" />,
  SiCinema4D: <SiCinema4D className="h-8 w-8" />,
}

export default function TechStack({ technologies }: TechStackProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tecnologías</h3>
        <div className="flex flex-wrap gap-4">
          {technologies.map((tech) => {
            return (
              <div key={tech.name} className="flex flex-col items-center">
                <div className="h-12 w-12 mb-2 flex items-center justify-center">
                  {iconMap[tech.icon] || <div className="h-8 w-8 bg-muted rounded-full" />}
                </div>
                <span className="text-xs text-muted-foreground">{tech.name}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
