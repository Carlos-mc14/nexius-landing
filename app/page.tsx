import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Code, Database, Globe, MessageSquare, Phone, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ContactForm from "@/components/contact-form"
import { Suspense } from "react"
import CompletedProjects from "@/components/completed-projects"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Soluciones digitales que transforman tu negocio
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl">
                  Desarrollamos software a medida, sitios web y sistemas especializados para restaurantes, hoteles y
                  más.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="#contacto">
                  <Button className="bg-primary hover:bg-primary/90">
                    Solicitar cotización <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#servicios">
                  <Button variant="outline" className="border-white text-black">
                    Nuestros servicios
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <Image
                src="/nexius-logo.svg?height=500&width=500"
                width={500}
                height={500}
                alt="Dashboard de software"
                className="rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestros Servicios</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Ofrecemos soluciones tecnológicas completas adaptadas a las necesidades específicas de tu negocio.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Globe className="h-8 w-8 text-primary" />
                <CardTitle>Diseño Web</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Sitios web modernos, responsivos y optimizados para SEO que convierten visitantes en clientes.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Server className="h-8 w-8 text-primary" />
                <CardTitle>Sistemas para Restaurantes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Software de gestión completo: pedidos, inventario, reservas y fidelización de clientes.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Database className="h-8 w-8 text-primary" />
                <CardTitle>Sistemas para Hoteles</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Gestión de reservas, check-in/out, facturación y experiencia del huésped optimizada.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Code className="h-8 w-8 text-primary" />
                <CardTitle>Desarrollo a Medida</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Soluciones personalizadas que se adaptan perfectamente a los procesos únicos de tu empresa.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Phone className="h-8 w-8 text-primary" />
                <CardTitle>Apps Móviles</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Aplicaciones nativas e híbridas para iOS y Android que conectan con tus clientes donde estén.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                <CardTitle>Soporte Técnico</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Asistencia continua, mantenimiento y actualizaciones para mantener tus sistemas funcionando
                  perfectamente.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portafolio" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestro Portafolio</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Conoce algunos de nuestros proyectos más destacados y cómo hemos ayudado a nuestros clientes a crecer.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
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
            }
          >
            <CompletedProjects />
          </Suspense>

          <div className="flex justify-center mt-8">
            <Link href="/portafolio">
              <Button className="w-full">Ver más proyectos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Lo que dicen nuestros clientes
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Empresas y personas que han confiado en nosotros y han transformado su negocio con nuestras soluciones.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {[
              {
                name: "María Rodríguez",
                company: "Restaurante El Sabor",
                text: "El sistema de gestión que implementaron revolucionó nuestro restaurante. Ahora procesamos pedidos más rápido y tenemos un control total del inventario.",
              },
              {
                name: "Carlos Méndez",
                company: "Hotel Vista Mar",
                text: "Gracias a su sistema de reservas, hemos aumentado nuestra ocupación en un 30%. La interfaz es intuitiva tanto para nuestro personal como para los clientes.",
              },
              {
                name: "Laura Sánchez",
                company: "Tienda Online ModoFashion",
                text: "Nuestra tienda online ha multiplicado las ventas desde que renovamos el sitio web. La experiencia de compra es excelente y la gestión de inventario es automática.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="text-left">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gray-100 p-2">
                      <svg
                        className="h-5 w-5 text-gray-600"
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
                    <div className="space-y-2">
                      <p className="text-gray-700">{testimonial.text}</p>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="nosotros" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">¿Por qué elegirnos?</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Nos destacamos por ofrecer soluciones tecnológicas de calidad con un enfoque centrado en resultados.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {[
              {
                title: "Experiencia Comprobada",
                description:
                  "Más de 10 clientes satisfechos con proyectos exitosos en diversos sectores de la industria.",
              },
              {
                title: "Soluciones a Medida",
                description: "Cada proyecto se adapta perfectamente a las necesidades específicas de tu negocio.",
              },
              {
                title: "Tecnología de Vanguardia",
                description:
                  "Utilizamos las últimas tecnologías para garantizar sistemas rápidos, seguros y escalables.",
              },
              {
                title: "Soporte Continuo",
                description:
                  "Ofrecemos asistencia técnica permanente para asegurar el funcionamiento óptimo de tus sistemas.",
              },
              {
                title: "Enfoque en Resultados",
                description:
                  "Nos comprometemos con el éxito de tu negocio, midiendo el impacto real de nuestras soluciones.",
              },
              {
                title: "Equipo Especializado",
                description: "Contamos con profesionales certificados en diversas áreas del desarrollo de software.",
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                </div>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contáctanos</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Estamos listos para ayudarte a transformar tu negocio con soluciones tecnológicas a medida.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 mt-12">
            <ContactForm />
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Información de contacto</h3>
                <p className="text-gray-500 mt-2">Completa el formulario o contáctanos directamente a través de:</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-gray-500">+123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-500">contacto@nexius.lat</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <svg
                      className="h-5 w-5 text-primary"
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
                    <p className="text-gray-500">Calle Principal 123, Ciudad, País</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Síguenos en redes sociales</h4>
                <div className="flex gap-4">
                  <Link href="#" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </Link>
                  <Link href="#" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="-0.5 0 17 17"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>                    </svg>
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link href="#" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="-0.5 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link href="https://www.linkedin.com/company/nexiuslat/" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
