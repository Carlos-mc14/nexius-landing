// Tipos para el contenido de la página principal.
// Mantiene alineación con la estructura existente en `lib/homepage.ts`.
// No introduce campos nuevos para respetar la etapa 1.

export interface HeroSection {
  title?: string
  subtitle?: string
  image?: string
  primaryButtonText?: string
  primaryButtonUrl?: string
  secondaryButtonText?: string
  secondaryButtonUrl?: string
}

export interface ServiceItem {
  id?: string
  title: string
  description: string
  icon: string
}

export interface TestimonialItem {
  id?: string
  name: string
  company: string
  text: string
}

export interface WhyChooseUsReason {
  id?: string
  title: string
  description: string
}

export interface ContactInfoSection {
  phone?: string
  email?: string
  address?: string
  socialLinks?: Record<string, string>
}

export interface FooterSection {
  companyDescription?: string
  links?: Record<string, { text: string; url: string }[]>
  copyright?: string
}

export interface HomepageContent {
  hero: HeroSection
  services: ServiceItem[]
  testimonials: TestimonialItem[]
  whyChooseUs: WhyChooseUsReason[]
  contactInfo?: ContactInfoSection
  footer?: FooterSection
  sectionsMeta?: Record<string, SectionMeta>
  // Secciones futuras: portfolio meta, blog meta, etc.
  // No se añaden ahora para no romper compatibilidad.
  [key: string]: any
}

export interface SectionMeta {
  badge?: string
  title: string
  description?: string
}
