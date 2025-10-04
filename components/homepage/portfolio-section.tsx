import Link from "next/link"
import { Button } from "@/components/ui/button"
import CompletedProjects from "@/components/completed-projects"
import { SectionHeader } from "./section-header"
import { FadeIn } from "./motion-wrapper"

export function PortfolioSection({ meta }: { meta?: { badge?: string; title?: string; description?: string } }) {
  return (
    <section id="portafolio" className="w-full py-16 md:py-24 lg:py-32 bg-muted/30 dark:bg-muted/10">
      <div className="container px-4 md:px-6">
        <SectionHeader
          badge={meta?.badge || "Portafolio"}
          title={meta?.title || "Proyectos destacados"}
          description={meta?.description || "Conoce algunos de nuestros proyectos más destacados y cómo hemos ayudado a nuestros clientes a crecer."}
        />
        {/* CompletedProjects ya maneja su propio skeleton y client fetch */}
        <CompletedProjects />
        <FadeIn className="flex justify-center mt-10">
          <Link href="/portafolio">
            <Button variant="outline" size="lg" className="group bg-transparent">
              Ver más proyectos
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
