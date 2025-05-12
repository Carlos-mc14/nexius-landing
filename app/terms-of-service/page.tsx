import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function TermsOfService() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden bg-muted/30 dark:bg-muted/10">
        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20 dark:text-slate-200 mb-4">
              <span className="font-medium">Términos Legales</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-6">
              Términos de Servicio
            </h1>
            <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed mb-8">
              Condiciones que regulan el uso de los servicios y sitio web de Nexius
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">1. Objeto y Aceptación</h2>
              <p className="text-muted-foreground mb-4">
                Bienvenido al sitio web de Nexius. Al acceder y utilizar este sitio, usted acepta los siguientes Términos de Servicio. Si no está de acuerdo con estos términos, le rogamos no usar este sitio.
              </p>
              <p className="text-muted-foreground">
                Nexius ofrece información sobre servicios de desarrollo de software a medida, diseño de sitios web, sistemas para hoteles y restaurantes, aplicaciones móviles, entre otros.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">2. Condiciones de Uso</h2>
              <ul className="space-y-4 text-muted-foreground list-disc pl-6">
                <li>Utilizar el sitio de conformidad con la ley y estos Términos.</li>
                <li>Queda prohibido realizar actividades ilícitas o contrarias al orden público.</li>
                <li>No interferir o interrumpir el funcionamiento del sitio (virus, ataques, manipulación de código, scraping excesivo, etc.).</li>
                <li>No enviar spam, publicidad no solicitada o contenido ofensivo, discriminatorio o amenazante.</li>
                <li>No eliminar, ocultar o alterar avisos de derechos de autor, marcas registradas u otra propiedad intelectual.</li>
                <li>No suplantar a terceros o crear cuentas falsas.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">3. Propiedad Intelectual</h2>
              <p className="text-muted-foreground mb-4">
                Todo el contenido de nexius.lat (textos, imágenes, logotipos, diseños, vídeos, código fuente, etc.) es propiedad de Nexius o está debidamente licenciado.
              </p>
              <p className="text-muted-foreground">
                Queda expresamente prohibida la reproducción, distribución, comunicación pública o transformación de los contenidos sin autorización previa. Los nombres, marcas o denominaciones que aparecen en el sitio son propiedad de Nexius o de sus respectivos titulares.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">4. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground mb-4">
                El usuario reconoce que el acceso y uso de este sitio es bajo su propio riesgo. Nexius proporciona la información de forma "tal cual" y no garantiza la exactitud, integridad o actualidad del contenido.
              </p>
              <p className="text-muted-foreground">
                Nexius no será responsable por daños directos o indirectos derivados del uso o la imposibilidad de uso del sitio, incluyendo fallos técnicos o cortes en el servicio.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">5. Modificaciones</h2>
              <p className="text-muted-foreground">
                Nexius se reserva el derecho de modificar, añadir o suprimir tanto el contenido de nexius.lat como estos Términos en cualquier momento y sin previo aviso. Es responsabilidad del usuario revisar periódicamente los Términos para estar al tanto de posibles cambios.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">6. Legislación Aplicable</h2>
              <p className="text-muted-foreground">
                Estos Términos se regirán e interpretarán de acuerdo con las leyes de la República del Perú. Cualquier disputa será sometida a los tribunales competentes de Lima, Perú.
              </p>
            </div>

            <div className="text-center">
              <Link href="/#contacto">
                <Button size="lg" className="group">
                  Contáctanos si tienes preguntas
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}