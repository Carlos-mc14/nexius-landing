import type { Technology } from "@/components/tech-stack"
import { after } from "node:test"
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

export interface TeamMember {
  id: string
  name: string
  position: string
  bio: string
  longBio?: string
  image: string
  technologies?: Technology[]
  links: {
    portfolio?: string
    linkedin?: string
    twitter?: string
    instagram?: string
    github?: string
    [key: string]: string | undefined
  }
  // New profile customization options
  profileOptions: {
    showSpotify: boolean
    spotifyUserId?: string // Only needed if showSpotify is true
    showTechnologies: boolean
    showGallery?: boolean
    galleryImages?: string[]
  }
}

// Technology icons using react-icons (Simple Icons collection)
const technologies = {
  react: SiReact,
  nextjs: SiNextdotjs,
  typescript: SiTypescript,
  javascript: SiJavascript,
  nodejs: SiNodedotjs,
  tailwind: SiTailwindcss,
  python: SiPython,
  django: SiDjango,
  figma: SiFigma,
  photoshop: SiAdobephotoshop,
  illustrator: SiAdobeillustrator,
  mongodb: SiMongodb,
  postgres: SiPostgresql,
  docker: SiDocker,
  redis: SiRedis,
  ubuntu: SiUbuntu,
  mysql: SiMysql,
  premierepro: SiAdobepremierepro,
  indesign: SiAdobeindesign,
  aftereffects: SiAdobeaftereffects,
  cinema4d: SiCinema4D,
}

export const teamMembers: TeamMember[] = [
  {
    id: "carlos",
    name: "Carlos Mori",
    position: "CEO / Fundador",
    bio: "Especialista en desarrollo de soluciones multiplataforma.",
    longBio: `Desarrollador Full Stack con más de 5 años de experiencia en el desarrollo de aplicaciones web y móviles. 
    Apasionado por las nuevas tecnologías y la innovación, siempre buscando soluciones creativas a problemas complejos.
    
    Mi enfoque se centra en crear productos digitales que no solo sean funcionales sino también intuitivos y agradables para el usuario final.
    Creo firmemente en el poder de la tecnología para transformar negocios y mejorar la vida de las personas.`,
    image: "/placeholder.svg?height=400&width=400&text=AR",
    technologies: [
      { name: "React", icon: technologies.react },
      { name: "Next.js", icon: technologies.nextjs },
      { name: "TypeScript", icon: technologies.typescript },
      { name: "Node.js", icon: technologies.nodejs },
      { name: "MongoDB", icon: technologies.mongodb },
      { name: "Redis", icon: technologies.redis },
      { name: "Python", icon: technologies.python },
      { name: "Ubuntu", icon: technologies.ubuntu },
      { name: "MySQL", icon: technologies.mysql },
    ],
    links: {
      linkedin: "https://www.linkedin.com/in/carlos-mori-carahuanco-85676a260/",
      github: "https://github.com/Carlos-mc14",
      instagram: "https://www.instagram.com/randiu.14/",
    },
    profileOptions: {
      showSpotify: true,
      spotifyUserId: "carlos", // This would be the actual Spotify user ID
      showTechnologies: true,
      showGallery: false,
    },
  },
  {
    id: "melanie",
    name: "Melanie Távara",
    position: "Desarrolladora Grafica",
    bio: "Especialista en diseño de interfaces y experiencia de usuario. Ha trabajado en proyectos para empresas de tecnología y startups.",
    longBio: `Diseñadora UX/UI con más de 3 años de experiencia creando interfaces intuitivas y atractivas.
    Mi pasión es transformar ideas complejas en diseños simples y funcionales que mejoren la experiencia del usuario.
    
    Me especializo en diseño de interfaces, investigación de usuarios y prototipado. Trabajo en estrecha colaboración con los equipos de desarrollo
    para asegurar que la visión de diseño se implemente correctamente.`,
    image: "/placeholder.svg?height=400&width=400&text=CM",
    technologies: [
      { name: "Figma", icon: technologies.figma },
      { name: "Photoshop", icon: technologies.photoshop },
      { name: "Illustrator", icon: technologies.illustrator },
      { name: "HTML/CSS", icon: technologies.tailwind },
      { name: "Adobe Premiere Pro", icon: technologies.premierepro },
      { name: "Adobe Indesign", icon: technologies.indesign },
      { name: "Adobe After Effects", icon: technologies.aftereffects },
      { name: "Cinema4D", icon: technologies.cinema4d },
    ],
    links: {
      portfolio: "https://nexius.lat/equipo/melanie-tavara",
      linkedin: "https://www.linkedin.com/in/melanie-t%C3%A1vara-ccapali-1469b6318/",
    },
    profileOptions: {
      showSpotify: false,
      showTechnologies: true,
      showGallery: true,
      galleryImages: [
        "/placeholder.svg?height=300&width=400&text=Design+1",
        "/placeholder.svg?height=300&width=400&text=Design+2",
        "/placeholder.svg?height=300&width=400&text=Design+3",
      ],
    },
  },
]

// Function to get a team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  return teamMembers.find((member) => member.id === id)
}

