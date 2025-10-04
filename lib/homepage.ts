import { connectToDatabase, getWithCache, invalidateCache } from "./db"

const COLLECTION = "homepage"
const CACHE_KEY_PREFIX = "homepage:"
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`

// Get all homepage content
export async function getHomepageContent() {
  return getWithCache(
    CACHE_KEY_ALL,
    async () => {
      const { db } = await connectToDatabase()

      // Get all sections from the database
      const sections = await db.collection(COLLECTION).find({}).toArray()

      // Transform into a structured object
      const content: any = {}

      for (const section of sections) {
        content[section.sectionId] = section.data
      }

      // If any section is missing, use default data
      if (!content.hero) {
        content.hero = getDefaultHeroSection()
      }

      if (!content.services) {
        content.services = getDefaultServicesSection()
      }

      if (!content.testimonials) {
        content.testimonials = getDefaultTestimonialsSection()
      }

      if (!content.whyChooseUs) {
        content.whyChooseUs = getDefaultWhyChooseUsSection()
      }

      if (!content.contactInfo) {
        content.contactInfo = getDefaultContactInfoSection()
      }

      if (!content.footer) {
        content.footer = getDefaultFooterSection()
      }

      if (!content.sectionsMeta) {
        content.sectionsMeta = getDefaultSectionsMeta()
      }

      return content
    },
    10, // Cache for 1 minute (reduced from 3600 to see changes faster)
  )
}

// Update a homepage section
export async function updateHomepageSection(section: string, data: any) {
  try {
    const { db } = await connectToDatabase()

    // Update or insert the section
    await db.collection(COLLECTION).updateOne(
      { sectionId: section },
      {
        $set: {
          sectionId: section,
          data: data,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)
    await invalidateCache(`${CACHE_KEY_PREFIX}${section}`)

    return { success: true }
  } catch (error) {
    console.error(`Error updating homepage section ${section}:`, error)
    throw error
  }
}

// Default data for sections
function getDefaultHeroSection() {
  return {
    title: "Soluciones digitales que transforman tu negocio",
    subtitle: "Desarrollamos software a medida, sitios web y sistemas especializados para restaurantes, hoteles y más.",
    image: "/nexius-logo.svg?height=500&width=500",
    primaryButtonText: "Solicitar cotización",
    primaryButtonUrl: "#contacto",
    secondaryButtonText: "Nuestros servicios",
    secondaryButtonUrl: "#servicios",
  }
}

function getDefaultServicesSection() {
  return [
    {
      id: "1",
      title: "Diseño Web",
      description: "Sitios web modernos, responsivos y optimizados para SEO que convierten visitantes en clientes.",
      icon: "Globe",
    },
    {
      id: "2",
      title: "Sistemas para Restaurantes",
      description: "Software de gestión completo: pedidos, inventario, reservas y fidelización de clientes.",
      icon: "Server",
    },
    {
      id: "3",
      title: "Sistemas para Hoteles",
      description: "Gestión de reservas, check-in/out, facturación y experiencia del huésped optimizada.",
      icon: "Database",
    },
    {
      id: "4",
      title: "Desarrollo a Medida",
      description: "Soluciones personalizadas que se adaptan perfectamente a los procesos únicos de tu empresa.",
      icon: "Code",
    },
    {
      id: "5",
      title: "Apps Móviles",
      description: "Aplicaciones nativas e híbridas para iOS y Android que conectan con tus clientes donde estén.",
      icon: "Phone",
    },
    {
      id: "6",
      title: "Soporte Técnico",
      description:
        "Asistencia continua, mantenimiento y actualizaciones para mantener tus sistemas funcionando perfectamente.",
      icon: "MessageSquare",
    },
  ]
}

function getDefaultTestimonialsSection() {
  return [
    {
      id: "1",
      name: "María Rodríguez",
      company: "Restaurante El Sabor",
      text: "El sistema de gestión que implementaron revolucionó nuestro restaurante. Ahora procesamos pedidos más rápido y tenemos un control total del inventario.",
    },
    {
      id: "2",
      name: "Carlos Méndez",
      company: "Hotel Vista Mar",
      text: "Gracias a su sistema de reservas, hemos aumentado nuestra ocupación en un 30%. La interfaz es intuitiva tanto para nuestro personal como para los clientes.",
    },
    {
      id: "3",
      name: "Laura Sánchez",
      company: "Tienda Online ModoFashion",
      text: "Nuestra tienda online ha multiplicado las ventas desde que renovamos el sitio web. La experiencia de compra es excelente y la gestión de inventario es automática.",
    },
  ]
}

function getDefaultWhyChooseUsSection() {
  return [
    {
      id: "1",
      title: "Experiencia Comprobada",
      description: "Más de 10 clientes satisfechos con proyectos exitosos en diversos sectores de la industria.",
    },
    {
      id: "2",
      title: "Soluciones a Medida",
      description: "Cada proyecto se adapta perfectamente a las necesidades específicas de tu negocio.",
    },
    {
      id: "3",
      title: "Tecnología de Vanguardia",
      description: "Utilizamos las últimas tecnologías para garantizar sistemas rápidos, seguros y escalables.",
    },
    {
      id: "4",
      title: "Soporte Continuo",
      description: "Ofrecemos asistencia técnica permanente para asegurar el funcionamiento óptimo de tus sistemas.",
    },
    {
      id: "5",
      title: "Enfoque en Resultados",
      description: "Nos comprometemos con el éxito de tu negocio, midiendo el impacto real de nuestras soluciones.",
    },
    {
      id: "6",
      title: "Equipo Especializado",
      description: "Contamos con profesionales certificados en diversas áreas del desarrollo de software.",
    },
  ]
}

function getDefaultContactInfoSection() {
  return {
    phone: "+123 456 7890",
    email: "contacto@nexius.lat",
    address: "Calle Principal 123, Ciudad, País",
    socialLinks: {
      facebook: "#",
      twitter: "#",
      instagram: "#",
      linkedin: "https://www.linkedin.com/company/nexiuslat/",
    },
  }
}

function getDefaultFooterSection() {
  return {
    companyDescription: "Soluciones digitales que transforman tu negocio.",
    links: {
      company: [
        { text: "Sobre Nosotros", url: "#nosotros" },
        { text: "Equipo", url: "/equipo" },
        { text: "Portafolio", url: "#portafolio" },
        { text: "Testimonios", url: "#testimonios" },
      ],
      legal: [
        { text: "Términos y Condiciones", url: "/terminos" },
        { text: "Política de Privacidad", url: "/privacidad" },
      ],
    },
    copyright: `© ${new Date().getFullYear()} Nexius. Todos los derechos reservados.`,
  }
}

function getDefaultSectionsMeta() {
  return {
    services: {
      badge: "Nuestros Servicios",
      title: "Soluciones digitales a medida",
      description: "Ofrecemos servicios tecnológicos completos adaptados a las necesidades específicas de tu negocio.",
    },
    whyChooseUs: {
      badge: "¿Por qué elegirnos?",
      title: "Valor que impulsa resultados",
      description:
        "Las razones por las que nuestros clientes confían en nosotros para construir y escalar sus soluciones digitales.",
    },
    portfolio: {
      badge: "Portafolio",
      title: "Proyectos destacados",
      description:
        "Conoce algunos de nuestros proyectos más destacados y cómo hemos ayudado a nuestros clientes a crecer.",
    },
    promotions: {
      badge: "Ofertas Especiales",
      title: "Promociones Destacadas",
      description: "Aprovecha nuestras ofertas exclusivas por tiempo limitado. Servicios de calidad con descuentos especiales.",
    },
    blog: {
      badge: "Blog",
      title: "Últimas publicaciones",
      description: "Artículos técnicos, tutoriales y noticias sobre tecnología y desarrollo de software.",
    },
    testimonials: {
      badge: "Testimonios",
      title: "Lo que dicen nuestros clientes",
      description:
        "Empresas y personas que han confiado en nosotros y han transformado su negocio con nuestras soluciones.",
    },
    contact: {
      badge: "Contáctanos",
      title: "¿Listo para comenzar?",
      description: "Estamos listos para ayudarte a transformar tu negocio con soluciones tecnológicas a medida.",
    },
  }
}
