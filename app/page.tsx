import { getHomepageContent } from "@/lib/homepage"
import { getLatestBlogPosts } from "@/lib/blog"
import { getFeaturedPromotions } from "@/lib/promotions"
import { getSeoConfig } from "@/lib/seo"
import { buildSiteJsonLd } from "@/lib/seo-utils"
import { HeroSection } from "@/components/homepage/hero-section"
import { ServicesSection } from "@/components/homepage/services-section"
import { WhyChooseUsSection } from "@/components/homepage/why-choose-us-section"
import { PortfolioSection } from "@/components/homepage/portfolio-section"
import { BlogLatestSection } from "@/components/homepage/blog-latest-section"
import { TestimonialsSection } from "@/components/homepage/testimonials-section"
import { ContactSection } from "@/components/homepage/contact-section"
import { PromotionsSection } from "@/components/homepage/promotions-section"
import { HomepageContent } from "@/types/homepage"
// Disable caching for this page to always show the latest content
export const revalidate = 0

export default async function Home() {
  const homepageContent = (await getHomepageContent()) as HomepageContent
  const latestPosts = await getLatestBlogPosts(3)
  const featuredPromotions = await getFeaturedPromotions(3)
  const seoConfig = await getSeoConfig()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildSiteJsonLd(seoConfig, homepageContent) }}
      />
      <main className="flex min-h-screen flex-col">
        <HeroSection hero={homepageContent.hero} />
  <PromotionsSection promotions={featuredPromotions} meta={homepageContent.sectionsMeta?.promotions} />
  <ServicesSection services={homepageContent.services} meta={homepageContent.sectionsMeta?.services} />
  <WhyChooseUsSection reasons={homepageContent.whyChooseUs} meta={homepageContent.sectionsMeta?.whyChooseUs} />
  <PortfolioSection meta={homepageContent.sectionsMeta?.portfolio} />
  <BlogLatestSection posts={latestPosts as any} meta={homepageContent.sectionsMeta?.blog} />
  <TestimonialsSection testimonials={homepageContent.testimonials} meta={homepageContent.sectionsMeta?.testimonials} />
        <ContactSection
          contactInfo={homepageContent.contactInfo}
          meta={homepageContent.sectionsMeta?.contact}
          services={homepageContent.services}
        />
      </main>
    </>
  )
}
