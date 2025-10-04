import { SeoConfig } from "./seo"

// Build minimal page-level metadata overrides that will be merged with the
// global metadata provided by `app/layout.tsx`. Keep this intentionally
// small: pages should only provide what's specific to that page.
export function buildPageMetadataOverrides(
  seo: SeoConfig,
  opts?: { title?: string; description?: string; image?: string; path?: string },
): Partial<import("next").Metadata> {
  const title = opts?.title ? `${opts.title} | ${seo.title.split("|")[0].trim()}` : undefined
  const description = opts?.description || undefined
  const image = opts?.image || seo.ogImage
  const canonical = opts?.path ? new URL(opts.path, seo.siteUrl).toString() : undefined

  const meta: Partial<import("next").Metadata> = {}

  if (title) meta.title = title
  if (description) meta.description = description

  meta.openGraph = {
    ...(seo ? { siteName: seo.title.split("|")[0].trim(), url: seo.siteUrl } : {}),
    title: title || seo.title,
    description: description || seo.description,
    images: image ? [{ url: image, alt: title || seo.title, width: 1200, height: 630 }] : [],
    type: "website",
  }

  meta.twitter = {
    card: "summary_large_image",
    title: title || seo.title,
    description: description || seo.description,
    creator: seo.twitterHandle,
    images: image ? [image] : [],
  }

  if (canonical) {
    meta.alternates = { canonical }
  }

  return meta
}

// Build Organization + Website + WebPage JSON-LD. Returns a JSON string ready
// to be inlined into a <script type="application/ld+json"> tag.
export function buildSiteJsonLd(seo: SeoConfig, homepageContent: any, opts?: { path?: string }) {
  const siteUrl = seo.siteUrl.replace(/\/$/, "")

  const json: any = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: seo.title.split("|")[0].trim(),
        url: siteUrl,
        logo: seo.siteUrl + (seo.ogImage || "/logo.png"),
        description: seo.description,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: homepageContent?.contactInfo?.phone || "+123 456 7890",
          contactType: "customer service",
          availableLanguage: ["Spanish", "English"],
        },
        sameAs: [
          homepageContent?.contactInfo?.socialLinks?.facebook,
          homepageContent?.contactInfo?.socialLinks?.twitter,
          homepageContent?.contactInfo?.socialLinks?.instagram,
          homepageContent?.contactInfo?.socialLinks?.linkedin,
        ].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/`,
        url: siteUrl,
        name: seo.title,
        description: seo.description,
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
        inLanguage: "es-ES",
      },
      {
        "@type": "WebPage",
        "@id": opts?.path ? `${siteUrl}${opts.path}` : `${siteUrl}/`,
        url: opts?.path ? `${siteUrl}${opts.path}` : `${siteUrl}/`,
        name: seo.title,
        isPartOf: { "@id": `${siteUrl}/` },
        about: { "@id": `${siteUrl}/` },
        description: seo.description,
        inLanguage: "es-ES",
      },
    ],
  }

  return JSON.stringify(json)
}
