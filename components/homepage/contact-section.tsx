import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ContactForm from "@/components/contact-form"
import { Button } from "@/components/ui/button"
import { Phone, MessageSquare, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { SectionHeader } from "./section-header"
import { FadeIn, StaggerContainer, StaggerItem } from "./motion-wrapper"
import { ContactInfoSection, ServiceItem } from "@/types/homepage"

interface Props {
  contactInfo?: ContactInfoSection
  meta?: { badge?: string; title?: string; description?: string }
  services?: ServiceItem[]
}

export function ContactSection({ contactInfo, meta, services }: Props) {
  return (
    <section id="contacto" className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden bg-muted/30 dark:bg-muted/10">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[length:20px_20px] z-0" />
      <div className="container relative z-10 px-4 md:px-6">
        <SectionHeader
          badge={meta?.badge || "Contáctanos"}
          title={meta?.title || "¿Listo para comenzar?"}
          description={meta?.description || "Estamos listos para ayudarte a transformar tu negocio con soluciones tecnológicas a medida."}
        />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
          <FadeIn>
            <Card className="overflow-hidden border-primary/5 dark:border-primary/10">
              <CardContent className="p-0">
                <ContactForm servicesFromDashboard={services} />
              </CardContent>
            </Card>
          </FadeIn>
          <div className="space-y-8">
            <StaggerContainer className="space-y-8">
              <StaggerItem>
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
                        <p className="font-medium">Teléfono/Whatsapp</p>
                        <p className="text-muted-foreground">{contactInfo?.phone || "+123 456 7890"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">{contactInfo?.email || "contacto@nexius.lat"}</p>
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
                        <p className="text-muted-foreground">{contactInfo?.address || "Calle Principal 123, Ciudad, País"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="border-primary/5 dark:border-primary/10">
                  <CardHeader>
                    <CardTitle>Síguenos en redes sociales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 flex-wrap">
                      <SocialLink href={contactInfo?.socialLinks?.facebook || "#"} label="Facebook">
                        <Facebook className="h-5 w-5" />
                      </SocialLink>
                      <SocialLink href={contactInfo?.socialLinks?.twitter || "#"} label="Twitter / X">
                        <Twitter className="h-5 w-5" />
                      </SocialLink>
                      <SocialLink href={contactInfo?.socialLinks?.instagram || "#"} label="Instagram">
                        <Instagram className="h-5 w-5" />
                      </SocialLink>
                      <SocialLink
                        href={
                          contactInfo?.socialLinks?.linkedin ||
                          "https://www.linkedin.com/company/nexiuslat/"
                        }
                        label="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </SocialLink>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group h-10 w-10 rounded-full bg-muted/70 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border"
    >
      {children}
    </Link>
  )
}
