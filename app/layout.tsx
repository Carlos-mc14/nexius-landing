import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { RecaptchaProvider } from "@/components/recaptcha-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nexius | Soluciones Digitales",
  description:
    "Desarrollamos software a medida, sitios web y sistemas especializados para restaurantes, hoteles y más.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <RecaptchaProvider>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Navbar />
          </header>

          {children}
          <footer className="w-full py-6 md:py-0 bg-gray-900 text-white">
            <div className="container px-4 md:px-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-4 py-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Nexius</h3>
                  <p className="text-gray-400">Soluciones digitales que transforman tu negocio.</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Servicios</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-white">
                        Diseño Web
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-white">
                        Sistemas para Restaurantes
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-white">
                        Sistemas para Hoteles
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-white">
                        Desarrollo a Medida
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Empresa</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#nosotros" className="text-gray-400 hover:text-white">
                        Sobre Nosotros
                      </Link>
                    </li>
                    <li>
                      <Link href="/equipo" className="text-gray-400 hover:text-white">
                        Equipo
                      </Link>
                    </li>
                    <li>
                      <Link href="#portafolio" className="text-gray-400 hover:text-white">
                        Portafolio
                      </Link>
                    </li>
                    <li>
                      <Link href="#testimonios" className="text-gray-400 hover:text-white">
                        Testimonios
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Contacto</h3>
                  <ul className="space-y-2">
                    <li className="text-gray-400">Lima, Lima, Perú</li>
                    <li className="text-gray-400">+51 999 999 999</li>
                    <li className="text-gray-400">contacto@nexius.lat</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-400">
                <p>© {new Date().getFullYear()} Nexius. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
          </RecaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}