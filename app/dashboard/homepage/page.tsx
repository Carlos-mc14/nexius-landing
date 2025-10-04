import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroSectionForm } from "@/components/dashboard/homepage/hero-section-form"
import { ServicesForm } from "@/components/dashboard/homepage/services-form"
import { TestimonialsForm } from "@/components/dashboard/homepage/testimonials-form"
import { WhyChooseUsForm } from "@/components/dashboard/homepage/why-choose-us-form"
import { ContactInfoForm } from "@/components/dashboard/homepage/contact-info-form"
import { FooterForm } from "@/components/dashboard/homepage/footer-form"
import { getHomepageContent } from "@/lib/homepage"
import { SectionsMetaForm } from "@/components/dashboard/homepage/sections-meta-form"
import { checkPermission } from "@/lib/permissions"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function HomepageEditorPage() {
  const session = await getSession()
  if (!session) {
    redirect("/dashboard")
  }

  const canEdit = await checkPermission(session.user.id, "homepage:edit")

  if (!canEdit) {
    redirect("/dashboard")
  }

  const homepageContent = await getHomepageContent()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Editar Página Principal</h3>
        <p className="text-muted-foreground">
          Personaliza el contenido que se muestra en la página principal del sitio.
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
          <TabsTrigger value="why-choose-us">Por qué elegirnos</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="sections-meta">Encabezados</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sección Hero</CardTitle>
              <CardDescription>Edita el título, subtítulo y botones de acción de la sección principal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <HeroSectionForm initialData={homepageContent.hero} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Servicios</CardTitle>
              <CardDescription>Gestiona los servicios que ofrece tu empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ServicesForm initialData={homepageContent.services} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testimonios</CardTitle>
              <CardDescription>
                Administra los testimonios de clientes que se muestran en la página principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <TestimonialsForm initialData={homepageContent.testimonials} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="why-choose-us" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Por qué elegirnos</CardTitle>
              <CardDescription>Edita las razones por las que los clientes deberían elegir tu empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <WhyChooseUsForm initialData={homepageContent.whyChooseUs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>
                Actualiza la información de contacto que se muestra en la página principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ContactInfoForm initialData={homepageContent.contactInfo} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer</CardTitle>
              <CardDescription>Edita el contenido del pie de página del sitio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <FooterForm initialData={homepageContent.footer} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections-meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Encabezados de Secciones</CardTitle>
              <CardDescription>
                Administra badge, título y descripción visibles en cada sección pública.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <SectionsMetaForm initialData={homepageContent.sectionsMeta || {}} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
