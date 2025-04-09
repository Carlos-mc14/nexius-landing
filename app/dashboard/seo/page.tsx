import type { Metadata } from "next"
import { getSeoConfig } from "@/lib/seo"
import { SeoForm } from "@/components/dashboard/seo/seo-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Configuración SEO | Dashboard",
  description: "Gestiona la configuración SEO de tu sitio web",
}

export default async function SeoPage() {
  const seoConfig = await getSeoConfig()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración SEO</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los metadatos, favicon y configuración SEO de tu sitio web.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <SeoForm initialData={seoConfig} />
      </div>
    </div>
  )
}
