import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { RecaptchaProvider } from "@/components/recaptcha-provider"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Github, Linkedin, Facebook, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { getSeoConfig } from "@/lib/seo"
import { ThemeToggle } from "@/components/theme-toggle"
import { getHomepageContent } from "@/lib/homepage"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoConfig()

  return {
    title: {
      default: seo.title,
      template: `%s | ${seo.title.split("|")[0].trim()}`,
    },
    description: seo.description,
    keywords: seo.keywords.split(",").map((keyword) => keyword.trim()),
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.siteUrl,
      siteName: seo.title.split("|")[0].trim(),
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      creator: seo.twitterHandle,
      images: [seo.ogImage],
    },
    metadataBase: new URL(seo.siteUrl),
    alternates: {
      canonical: "/",
    },
  }
}

export async function generateViewport(): Promise<Viewport> {
  const seo = await getSeoConfig()

  return {
    themeColor: seo.themeColor,
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seo = await getSeoConfig()
  const homepageContent = await getHomepageContent()

  // Get the current pathname to determine if we're in dashboard
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const isDashboard = pathname.startsWith("/dashboard")

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href={seo.favicon} />
        {seo.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${seo.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
        {seo.additionalMetaTags?.map((tag, index) => (
          <meta key={index} name={tag.name} content={tag.content} />
        ))}
      </head>
      <body className={`${inter.className} w-full overflow-x-hidden m-0 p-0`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RecaptchaProvider>
            {/* Only show navbar for non-dashboard pages */}
            {!isDashboard && <Navbar />}

            <main className={isDashboard ? "w-full h-screen overflow-hidden" : "pt-16 w-full overflow-x-hidden"}>
              {children}
            </main>

            {/* Only show WhatsApp button and footer for non-dashboard pages */}
            {!isDashboard && (
              <>
                {/* Botón flotante de WhatsApp */}
                <div className="fixed bottom-6 right-6 z-50">
                  <a
                    href="https://wa.me/message/CAFPDSATMVIQA1"
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

                        <ThemeToggle />
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
                            <Linkedin size={20} />
                            <span>Linkedin</span>
                          </a>
                          <a
                            href="https://github.com/asdasd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Github size={20} />
                            <span>Github</span>
                          </a>
                          <a
                            href="https://instagram.com/asdasd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Facebook size={20} />
                            <span>Facebook</span>
                          </a>
                          <a
                            href="https://instagram.com/asdasd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Phone size={20} />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold">Empresa</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link
                              href="#nosotros"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Sobre Nosotros
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/equipo"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Equipo
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="#portafolio"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Portafolio
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="#testimonios"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Testimonios
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold">Contacto</h3>
                        <ul className="space-y-2">
                          <li className="text-muted-foreground">Lima, Lima, Perú</li>
                          <li className="text-muted-foreground">
                            {homepageContent.contactInfo?.phone || "+123 456 7890"}
                          </li>
                          <li className="text-muted-foreground">
                            {homepageContent.contactInfo?.email || "contacto@nexius.lat"}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
                      <p>© {new Date().getFullYear()} Nexius. Todos los derechos reservados.</p>
                    </div>
                  </div>
                </footer>
              </>
            )}

            <Toaster />
          </RecaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
