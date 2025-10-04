import Link from "next/link"
import Image from "next/image"
import { ArrowDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroSection as Hero } from "@/types/homepage"
import { FadeIn } from "./motion-wrapper"

interface Props {
  hero: Hero
}

export function HeroSection({ hero }: Props) {
  return (
    <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 dark:from-primary/80 dark:via-primary/70 dark:to-primary/60 z-0" />
      <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] z-0 opacity-20" />
      <div className="container relative z-10 px-4 md:px-6 lg:pl-[170px]">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <FadeIn className="flex flex-col justify-center space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm dark:bg-white/5">
                <span className="font-medium">Innovación Digital</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                {hero.title || "Transformamos ideas en soluciones digitales"}
              </h1>
              <p className="max-w-[600px] text-white/80 md:text-xl">
                {hero.subtitle ||
                  "Desarrollamos software a medida que impulsa el crecimiento de tu negocio con tecnologías de vanguardia."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href={hero.primaryButtonUrl || "#contacto"}>
                <Button
                  size="lg"
                  className="bg-slate-900 text-white hover:bg-slate-600 dark:bg-white dark:text-primary dark:hover:bg-white/90"
                >
                  {hero.primaryButtonText || "Solicitar cotización"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {hero.secondaryButtonText && (
                <Link href={hero.secondaryButtonUrl || "#servicios"}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-black hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10 bg-transparent"
                  >
                    {hero.secondaryButtonText}
                  </Button>
                </Link>
              )}
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <Image
              src={hero.image || "/placeholder.svg?height=600&width=600"}
              width={400}
              height={400}
              alt="Imagen hero"
              className="cover"
              priority
            />
          </FadeIn>
        </div>
        <div className="absolute bottom-[-100px] right-[609px] transform -translate-x-1/2 hidden md:block">
          <Link href="#servicios" className="flex flex-col items-center text-white/80 hover:text-white transition-colors">
            <span className="text-sm mb-2">Descubre más</span>
            <ArrowDown className="animate-bounce" />
          </Link>
        </div>
      </div>
    </section>
  )
}
