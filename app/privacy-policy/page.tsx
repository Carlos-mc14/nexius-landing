import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden bg-muted/30 dark:bg-muted/10">
        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20 dark:text-slate-200 mb-4">
              <span className="font-medium">Protección de Datos</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-6">
              Política de Privacidad
            </h1>
            <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed mb-8">
              Nos comprometemos a proteger su privacidad y manejar sus datos personales de forma transparente
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Introducción</h2>
              <p className="text-muted-foreground">
                Nexius es una empresa de soluciones digitales con sede en Lima, Perú. Nos comprometemos a proteger su privacidad y a manejar sus datos personales de forma transparente.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Datos Personales Recopilados</h2>
              <p className="text-muted-foreground mb-4">
                Cuando utiliza nuestro sitio web, recopilamos los datos que usted nos proporciona voluntariamente al enviar el formulario de contacto. Estos datos incluyen:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Nombre completo</li>
                <li>Correo electrónico</li>
                <li>Teléfono</li>
                <li>Empresa</li>
                <li>Servicio de interés</li>
                <li>Mensaje</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                También podemos recolectar información técnica como dirección IP, tipo de navegador y fecha/hora de acceso, principalmente para fines de seguridad y mejora del sitio.
              </p>
              <p className="text-muted-foreground mt-4">
                No solicitamos datos sensibles (salud, religión, origen étnico, etc.) ni datos de menores de edad intencionalmente.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Finalidad del Tratamiento de Datos</h2>
              <p className="text-muted-foreground mb-4">
                Los datos personales que recopilamos se utilizan para:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Responder a sus consultas y solicitudes</li>
                <li>Enviar información, cotizaciones o propuestas relacionadas con nuestros servicios</li>
                <li>Gestión comercial y registro de comunicaciones con posibles clientes</li>
                <li>Mejorar nuestro sitio web y servicios</li>
                <li>Cumplimiento de obligaciones legales</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                No empleamos sus datos para fines de publicidad masiva o venta a terceros. No vendemos información personal bajo ninguna circunstancia.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Base Legal de Tratamiento</h2>
              <p className="text-muted-foreground mb-4">
                El tratamiento de sus datos se basa en diferentes fundamentos legales:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Consentimiento del usuario al completar y enviar el formulario de contacto</li>
                <li>Interés legítimo en gestionar la relación con clientes potenciales</li>
                <li>Cumplimiento de obligaciones legales, fiscales o contables</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Cookies y Tecnologías de Seguimiento</h2>
              <p className="text-muted-foreground mb-4">
                Nuestro sitio web utiliza tecnologías esenciales que no requieren consentimiento previo:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Google reCAPTCHA para protección contra bots</li>
                <li>Cookies de preferencias de visualización (tema claro/oscuro)</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                No usamos cookies de analítica web ni píxeles de seguimiento publicitarios.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Derechos de los Usuarios</h2>
              <p className="text-muted-foreground mb-4">
                Usted puede ejercer los siguientes derechos:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Derecho de acceso a sus datos</li>
                <li>Derecho de rectificación</li>
                <li>Derecho de supresión ("derecho al olvido")</li>
                <li>Derecho a limitar el tratamiento</li>
                <li>Derecho de oposición</li>
                <li>Derecho de portabilidad de datos</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Para ejercer cualquiera de estos derechos, envíe una solicitud a contacto@nexius.lat.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Seguridad y Transferencias de Datos</h2>
              <p className="text-muted-foreground mb-4">
                Adoptamos medidas técnicas y organizativas para proteger sus datos personales, incluyendo:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Restricción de acceso al personal autorizado</li>
                <li>Uso de conexiones seguras (HTTPS)</li>
                <li>Notificación a autoridades en caso de brechas de seguridad</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Podemos utilizar servicios de proveedores globales que pueden implicar transferencias internacionales de datos, siempre garantizando mecanismos legales adecuados de protección.
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