import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Code, Database, Globe, MessageSquare, Phone, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ContactForm from "@/components/contact-form"

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
                src="/placeholder.svg?height=500&width=500"
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
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <Image
                  src={`/placeholder.svg?height=300&width=400&text=Proyecto ${item}`}
                  width={400}
                  height={300}
                  alt={`Proyecto ${item}`}
                  className="aspect-video object-cover w-full"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">Proyecto {item}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {item % 2 === 0
                      ? "Sistema de gestión para restaurante con módulos de pedidos, inventario y fidelización."
                      : "Sitio web corporativo con integración de CRM y sistema de reservas online."}
                  </p>
                </div>
              </div>
            ))}
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
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm5.23 15.23c-.399.3-.877.447-1.354.447-.195 0-.39-.031-.578-.094-1.878-.63-3.752-.63-5.63 0-.188.063-.383.094-.578.094-.477 0-.955-.147-1.354-.447-.399-.3-.7-.718-.866-1.197-.166-.479-.166-.995 0-1.474.166-.479.467-.897.866-1.197.399-.3.877-.447 1.354-.447.195 0 .39.031.578.094 1.878.63 3.752.63 5.63 0 .188-.063.383-.094.578-.094.477 0 .955.147 1.354.447.399.3.7.718.866 1.197.166.479.166.995 0 1.474-.166.479-.467.897-.866 1.197z" />
                    </svg>
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link href="#" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm-1.24 14.24c-2.34 0-4.24-1.9-4.24-4.24s1.9-4.24 4.24-4.24 4.24 1.9 4.24 4.24-1.9 4.24-4.24 4.24zm8.846-7.772c-.413-.413-.963-.638-1.546-.638-.583 0-1.133.225-1.546.638-.413.413-.638.963-.638 1.546 0 .583.225 1.133.638 1.546.413.413.963.638 1.546.638.583 0 1.133-.225 1.546-.638.413-.413.638-.963.638-1.546 0-.583-.225-1.133-.638-1.546z" />
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link href="#" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
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
