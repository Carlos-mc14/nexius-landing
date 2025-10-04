import { Card, CardContent } from "@/components/ui/card"
import { TestimonialItem } from "@/types/homepage"
import { SectionHeader } from "./section-header"
import { StaggerContainer, StaggerItem } from "./motion-wrapper"

interface Props {
  testimonials: TestimonialItem[]
  meta?: { badge?: string; title?: string; description?: string }
}

export function TestimonialsSection({ testimonials, meta }: Props) {
  if (!testimonials || testimonials.length === 0) return null
  return (
    <section id="testimonios" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <SectionHeader
          badge={meta?.badge || "Testimonios"}
          title={meta?.title || "Lo que dicen nuestros clientes"}
          description={meta?.description || "Empresas y personas que han confiado en nosotros y han transformado su negocio con nuestras soluciones."}
        />
        <StaggerContainer className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.id || t.name}>
              <Card className="text-left bg-card/50 backdrop-blur-sm border-primary/5 dark:border-primary/10 h-full">
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
                      <p className="text-base/relaxed">{t.text}</p>
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.company}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
