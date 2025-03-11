import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tu Empresa - Soluciones Digitales a Medida",
  description:
    "Desarrollamos software a medida, sitios web y sistemas especializados para restaurantes, hoteles y más.",
    generator: 'v0.dev'
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
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <div className="mr-4 flex">
                <a href="/" className="mr-6 flex items-center space-x-2">
                  <span className="font-bold text-xl">Nexius</span>
                </a>
              </div>
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <a href="/" className="transition-colors hover:text-primary">
                  Inicio
                </a>
                <a href="#servicios" className="transition-colors hover:text-primary">
                  Servicios
                </a>
                <a href="#portafolio" className="transition-colors hover:text-primary">
                  Portafolio
                </a>
                <a href="#testimonios" className="transition-colors hover:text-primary">
                  Testimonios
                </a>
                <a href="#contacto" className="transition-colors hover:text-primary">
                  Contacto
                </a>
              </nav>
              <div className="flex flex-1 items-center justify-end space-x-4">
                <a
                  href="#contacto"
                  className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Solicitar cotización
                </a>
                <button className="md:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
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
                      <a href="#" className="text-gray-400 hover:text-white">
                        Diseño Web
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white">
                        Sistemas para Restaurantes
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white">
                        Sistemas para Hoteles
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white">
                        Desarrollo a Medida
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Empresa</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="#nosotros" className="text-gray-400 hover:text-white">
                        Sobre Nosotros
                      </a>
                    </li>
                    <li>
                      <a href="#portafolio" className="text-gray-400 hover:text-white">
                        Portafolio
                      </a>
                    </li>
                    <li>
                      <a href="#testimonios" className="text-gray-400 hover:text-white">
                        Testimonios
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Contacto</h3>
                  <ul className="space-y-2">
                    <li className="text-gray-400">Calle Principal 123, Ciudad</li>
                    <li className="text-gray-400">+123 456 7890</li>
                    <li className="text-gray-400">info@nexius.lat</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-400">
                <p>© {new Date().getFullYear()} Nexius. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'