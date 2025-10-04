import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceItem } from "@/types/homepage"
import { getServiceIcon } from "./icons"
import { SectionHeader } from "./section-header"
import { StaggerContainer, StaggerItem } from "./motion-wrapper"

interface Props {
  services: ServiceItem[]
  meta?: { badge?: string; title?: string; description?: string }
}

export function ServicesSection({ services, meta }: Props) {
  return (
    <section id="servicios" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <SectionHeader
          badge={meta?.badge || "Nuestros Servicios"}
          title={meta?.title || "Soluciones digitales a medida"}
          description={meta?.description || "Ofrecemos servicios tecnológicos completos adaptados a las necesidades específicas de tu negocio."}
        />
        <StaggerContainer className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <StaggerItem key={service.id || service.title}>
              <Card className="group relative overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                    {getServiceIcon(service.icon, "h-6 w-6")}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
