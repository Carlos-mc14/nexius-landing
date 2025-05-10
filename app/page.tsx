import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  CheckCircle,
  Code,
  Database,
  Globe,
  MessageSquare,
  Phone,
  Server,
  ArrowDown,
  Users,
  Shield,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ContactForm from "@/components/contact-form"
import { Suspense } from "react"
import CompletedProjects from "@/components/completed-projects"
import { getHomepageContent } from "@/lib/homepage"

// Disable caching for this page to always show the latest content
export const revalidate = 0

export default async function Home() {
  // Fetch homepage content
  const homepageContent = await getHomepageContent()

  // Destructure sections for easier access
  const { hero, services, testimonials, whyChooseUs } = homepageContent

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section - Modern Design */}
      <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 dark:from-primary/80 dark:via-primary/70 dark:to-primary/60 z-0"></div>
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] z-0 opacity-20"></div>
        <div className="container relative z-10 px-4 md:px-6 lg:pl-[170px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm dark:bg-white/5">
                  <span className="font-medium">Innovación Digital</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                  {hero.title || "Transformamos ideas en soluciones digitales"}
                </h1>
                <p className="max-w-[600px] text-white/80 md:text-xl">
                  {hero.subtitle ||
                    "Desarrollamos software a medida que impulsa el crecimiento de tu negocio con tecnologías de vanguardia."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={hero.primaryButtonUrl || "#contacto"}>
                  <Button
                    size="lg"
                    className="bg-slate-900 text-white hover:bg-slate-600 dark:bg-white dark:text-primary dark:hover:bg-white/90"
                  >
                    {hero.primaryButtonText || "Solicitar cotización"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {hero.secondaryButtonText && (
                  <Link href={hero.secondaryButtonUrl || "#servicios"}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-black hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10"
                    >
                      {hero.secondaryButtonText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div>
              <div>
                <Image
                  src={hero.image || "/placeholder.svg?height=600&width=600"}
                  width={400}
                  height={400}
                  alt="Dashboard de software"
                  className="cover"
                  priority
                />
              </div>
            </div>
          </div>
          <div
            className="absolute bottom-[-100px] right-[600px] transform -translate-x-1/2 hidden md:block"
          >
            <Link
              href="#servicios"
              className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
            >
              <span className="text-sm mb-2">Descubre más</span>
              <ArrowDown className="animate-bounce" />
            </Link>
          </div>


        </div>
      </section>

      {/* Services Section - Modern Design */}
      <section id="servicios" className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground">
              <span className="font-medium">Nuestros Servicios</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Soluciones digitales a medida
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Ofrecemos servicios tecnológicos completos adaptados a las necesidades específicas de tu negocio.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service: any) => (
              <Card
                key={service.id}
                className="group relative overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-primary/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                    {getIconComponent(service.icon, "h-6 w-6")}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section - Modern Design */}
      <section id="portafolio" className="w-full py-16 md:py-24 lg:py-32 bg-muted/30 dark:bg-muted/10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground">
              <span className="font-medium">Portafolio</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Proyectos destacados</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Conoce algunos de nuestros proyectos más destacados y cómo hemos ayudado a nuestros clientes a crecer.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border bg-card shadow-sm animate-pulse">
                    <div className="aspect-video w-full bg-muted"></div>
                    <div className="p-6 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <CompletedProjects />
          </Suspense>

          <div className="flex justify-center mt-10">
            <Link href="/portafolio">
              <Button variant="outline" size="lg" className="group">
                Ver más proyectos
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Modern Design */}
      <section id="nosotros" className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground mb-4">
                <span className="font-medium">¿Por qué elegirnos?</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                Comprometidos con la excelencia
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed mb-8">
                Nos destacamos por ofrecer soluciones tecnológicas de calidad con un enfoque centrado en resultados.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                {whyChooseUs.slice(0, 4).map((item: any) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {getWhyChooseUsIcon(item.title, "h-5 w-5 text-primary")}
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-10"></div>
                <Image
                  src="/placeholder.svg?height=800&width=800"
                  width={800}
                  height={800}
                  alt="Equipo de trabajo"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 dark:bg-primary/20 dark:border-primary/30 z-0"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 dark:bg-primary/20 dark:border-primary/30 z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Modern Design */}
      <section id="testimonios" className="w-full py-16 md:py-24 lg:py-32 bg-muted/30 dark:bg-muted/10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground">
              <span className="font-medium">Testimonios</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Lo que dicen nuestros clientes
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Empresas y personas que han confiado en nosotros y han transformado su negocio con nuestras soluciones.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial: any) => (
              <Card
                key={testimonial.id}
                className="text-left bg-card/50 backdrop-blur-sm border-primary/5 dark:border-primary/10"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <p className="text-base/relaxed">{testimonial.text}</p>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Modern Design */}
      <section id="contacto" className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[length:20px_20px] z-0"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground">
              <span className="font-medium">Contáctanos</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">¿Listo para comenzar?</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Estamos listos para ayudarte a transformar tu negocio con soluciones tecnológicas a medida.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="overflow-hidden border-primary/5 dark:border-primary/10">
              <CardContent className="p-0">
                <ContactForm />
              </CardContent>
            </Card>
            <div className="space-y-8">
              <Card className="border-primary/5 dark:border-primary/10">
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                  <CardDescription>Contáctanos directamente a través de:</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-muted-foreground">{homepageContent.contactInfo?.phone || "+123 456 7890"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">
                        {homepageContent.contactInfo?.email || "contacto@nexius.lat"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Dirección</p>
                      <p className="text-muted-foreground">
                        {homepageContent.contactInfo?.address || "Calle Principal 123, Ciudad, País"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/5 dark:border-primary/10">
                <CardHeader>
                  <CardTitle>Síguenos en redes sociales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Link
                      href={homepageContent.contactInfo?.socialLinks?.facebook || "#"}
                      className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span className="sr-only">Facebook</span>
                    </Link>
                    <Link
                      href={homepageContent.contactInfo?.socialLinks?.twitter || "#"}
                      className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="-0.5 0 17 17"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                      </svg>
                      <span className="sr-only">Twitter</span>
                    </Link>
                    <Link
                      href={homepageContent.contactInfo?.socialLinks?.instagram || "#"}
                      className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="-0.5 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                      </svg>
                      <span className="sr-only">Instagram</span>
                    </Link>
                    <Link
                      href={
                        homepageContent.contactInfo?.socialLinks?.linkedin ||
                        "https://www.linkedin.com/company/nexiuslat/"
                      }
                      className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Helper function to render the correct icon component based on icon name
function getIconComponent(iconName: string, className: string) {
  switch (iconName) {
    case "Globe":
      return <Globe className={className} />
    case "Server":
      return <Server className={className} />
    case "Database":
      return <Database className={className} />
    case "Code":
      return <Code className={className} />
    case "Phone":
      return <Phone className={className} />
    case "MessageSquare":
      return <MessageSquare className={className} />
    default:
      return <Globe className={className} />
  }
}

// Helper function to get icons for "Why Choose Us" section
function getWhyChooseUsIcon(title: string, className: string) {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes("calidad") || lowerTitle.includes("excelencia")) {
    return <Shield className={className} />
  } else if (lowerTitle.includes("equipo") || lowerTitle.includes("profesional")) {
    return <Users className={className} />
  } else if (lowerTitle.includes("rápido") || lowerTitle.includes("veloc") || lowerTitle.includes("ágil")) {
    return <Zap className={className} />
  } else if (lowerTitle.includes("innovación") || lowerTitle.includes("tecnología")) {
    return <Code className={className} />
  } else {
    return <CheckCircle className={className} />
  }
}
