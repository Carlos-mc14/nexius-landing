import Image from "next/image"
import Link from "next/link"
import { Github, Globe, Linkedin, Twitter, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Datos de ejemplo del equipo - puedes reemplazarlos con información real
const teamMembers = [
  {
    id: "carlos", // Changed from numeric ID to string ID to match the dynamic route
    name: "Carlos Mori",
    position: "CEO / Fundador",
    bio: "Especialista en desarrollo de soluciones multiplataforma.",
    image: "/placeholder.svg?height=400&width=400&text=AR",
    links: {
      linkedin: "https://www.linkedin.com/in/carlos-mori-carahuanco-85676a260/",
      github: "https://github.com/Carlos-mc14",
      instagram: "https://www.instagram.com/randiu.14/",
    },
  },
  {
    id: "melanie", // Changed from numeric ID to string ID to match the dynamic route
    name: "Melanie Távara",
    position: "Desarrolladora Grafica",
    bio: "Especialista en diseño de interfaces y experiencia de usuario. Ha trabajado en proyectos para empresas de tecnología y startups.",
    image: "/placeholder.svg?height=400&width=400&text=CM",
    links: {
      portfolio: "https://nexius.lat/equipo/melanie-tavara",
      linkedin: "https://www.linkedin.com/in/melanie-t%C3%A1vara-ccapali-1469b6318/",
    },
  },
  {
    id: "join-us", // Changed from numeric ID to string ID
    name: "Tu puedes ser el siguiente",
    position: "",
    bio: "Se parte de nuestro equipo y ayuda a transformar la tecnología en soluciones innovadoras.",
    image: "/placeholder.svg?height=400&width=400&text=LS",
    links: {
      portfolio: "",
      linkedin: "",
      twitter: "",
    },
  },
]

export default function TeamPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Nuestro Equipo
              </h1>
              <p className="max-w-[700px] text-gray-300 md:text-xl">
                Conoce a los profesionales detrás de nuestras soluciones tecnológicas. Un equipo apasionado y con amplia
                experiencia en el sector.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden flex flex-col">
                <div className="aspect-square relative">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex flex-col flex-grow">
                    <div>
                      <h3 className="text-2xl font-bold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                    </div>
                    <p className="text-sm text-muted-foreground flex-grow">{member.bio}</p>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    {member.links.portfolio && (
                      <Link href={member.links.portfolio} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Globe className="h-4 w-4" />
                          <span className="sr-only">Portafolio</span>
                        </Button>
                      </Link>
                    )}
                    {member.links.linkedin && (
                      <Link href={member.links.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Linkedin className="h-4 w-4" />
                          <span className="sr-only">LinkedIn</span>
                        </Button>
                      </Link>
                    )}
                    {member.links.twitter && (
                      <Link href={member.links.twitter} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Twitter className="h-4 w-4" />
                          <span className="sr-only">Twitter</span>
                        </Button>
                      </Link>
                    )}
                    {member.links.instagram && (
                      <Link href={member.links.instagram} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Instagram className="h-4 w-4" />
                          <span className="sr-only">Instagram</span>
                        </Button>
                      </Link>
                    )}
                    {member.links.github && (
                      <Link href={member.links.github} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Github className="h-4 w-4" />
                          <span className="sr-only">GitHub</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="flex justify-center mt-8">
                    {/* Only show the profile button for actual team members, not for the "join us" card */}
                    {member.id !== "join-us" ? (
                      <Link href={`/equipo/miembro/${member.id}`}>
                        <Button className="w-full">Ver perfil</Button>
                      </Link>
                    ) : (
                      <Link href="/#contacto">
                        <Button className="w-full">Únete al equipo</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                ¿Quieres unirte a nuestro equipo?
              </h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Estamos siempre en búsqueda de talento apasionado por la tecnología y la innovación.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/#contacto">
                <Button className="bg-primary hover:bg-primary/90">Trabaja con nosotros</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

