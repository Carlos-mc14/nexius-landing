import { Card, CardContent } from "@/components/ui/card"
import { WhyChooseUsReason } from "@/types/homepage"
import { SectionHeader } from "./section-header"
import { getWhyChooseUsIcon } from "./icons"
import { StaggerContainer, StaggerItem } from "./motion-wrapper"

interface Props {
  reasons: WhyChooseUsReason[]
  meta?: { badge?: string; title?: string; description?: string }
}

export function WhyChooseUsSection({ reasons, meta }: Props) {
  if (!reasons || reasons.length === 0) return null
  return (
    <section id="por-que-nosotros" className="w-full py-16 md:py-24 lg:py-32 bg-muted/30 dark:bg-muted/10">
      <div className="container px-4 md:px-6">
        <SectionHeader
          badge={meta?.badge || "¿Por qué elegirnos?"}
          title={meta?.title || "Valor que impulsa resultados"}
          description={meta?.description || "Las razones por las que nuestros clientes confían en nosotros para construir y escalar sus soluciones digitales."}
        />
        <StaggerContainer className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => (
            <StaggerItem key={r.id || r.title}>
              <Card className="h-full border-primary/5 dark:border-primary/10 hover:shadow-sm transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-full bg-primary/10 p-2 w-fit text-primary dark:bg-primary/20 dark:text-primary-foreground">
                    {getWhyChooseUsIcon(r.title, "h-5 w-5")}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold leading-tight">{r.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
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
