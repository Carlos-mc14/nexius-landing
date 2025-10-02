"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

export default function PublicShell({
  children,
  homepageContent,
}: {
  children: React.ReactNode
  homepageContent?: any
}) {
  const pathname = usePathname() || ""
  const isDashboard = pathname.startsWith("/dashboard")

  if (isDashboard) {
    // Let dashboard layout render as-is without public chrome
    return <>{children}</>
  }

  return (
    <>
      <Navbar />

      <main className="pt-16 w-full overflow-x-hidden">{children}</main>

      {/* Botón flotante de WhatsApp y footer (solo en sitio público) */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/+51973648613"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle size={24} className="mr-2" />
          <span className="hidden sm:inline-block font-medium">Contáctanos por WhatsApp</span>
          <span className="sm:hidden font-medium">WhatsApp</span>
        </a>
      </div>

      <footer className="w-full py-12 bg-muted/50 dark:bg-muted/20 border-t border-border">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Nexius</h3>
              <p className="text-muted-foreground">Soluciones digitales que transforman tu negocio.</p>

              <div className="flex space-x-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">•</span>
                  <Link
                    href="/terms-of-service"
                    className="underline text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Términos y Condiciones
                  </Link>
                  <br />
                  <span className="text-muted-foreground">•</span>
                  <Link
                    href="/privacy-policy"
                    className="underline text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Política de Privacidad
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Nuestras redes</h3>
              <div className="space-y-2">
                <a
                  href="https://www.linkedin.com/company/nexiuslat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Linkedin</span>
                </a>
                <a
                  href="https://github.com/asdasd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Github</span>
                </a>
                <a
                  href="https://instagram.com/asdasd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Facebook</span>
                </a>
                <a
                  href="https://instagram.com/asdasd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#nosotros" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/equipo" className="text-muted-foreground hover:text-foreground transition-colors">
                    Equipo
                  </Link>
                </li>
                <li>
                  <Link href="#portafolio" className="text-muted-foreground hover:text-foreground transition-colors">
                    Portafolio
                  </Link>
                </li>
                <li>
                  <Link href="#testimonios" className="text-muted-foreground hover:text-foreground transition-colors">
                    Testimonios
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Contacto</h3>
              <ul className="space-y-2">
                <li className="text-muted-foreground">Lima, Lima, Perú</li>
                <li className="text-muted-foreground">{homepageContent?.contactInfo?.phone || "+123 456 7890"}</li>
                <li className="text-muted-foreground">{homepageContent?.contactInfo?.email || "contacto@nexius.lat"}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Nexius. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
