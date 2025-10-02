import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
// Navbar is handled by the client-side PublicShell
import { RecaptchaProvider } from "@/components/recaptcha-provider"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
// Footer/social icons are rendered inside PublicShell
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { getSeoConfig } from "@/lib/seo"
import { getHomepageContent } from "@/lib/homepage"
import PublicShell from "@/components/public-shell"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoConfig()

  return {
    title: {
      default: seo.title,
      template: `%s | ${seo.title.split("|")[0].trim()}`,
    },
    description: seo.description,
    keywords: seo.keywords.split(",").map((keyword) => keyword.trim()),
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.siteUrl,
      siteName: seo.title.split("|")[0].trim(),
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      creator: seo.twitterHandle,
      images: [seo.ogImage],
    },
    metadataBase: new URL(seo.siteUrl),
    alternates: {
      canonical: "/",
    },
  }
}

export async function generateViewport(): Promise<Viewport> {
  const seo = await getSeoConfig()

  return {
    themeColor: seo.themeColor,
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seo = await getSeoConfig()
  const homepageContent = await getHomepageContent()

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href={seo.favicon} />
        {seo.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${seo.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
        {seo.additionalMetaTags?.map((tag, index) => (
          <meta key={index} name={tag.name} content={tag.content} />
        ))}
      </head>
      <body className={`${inter.className} w-full overflow-x-hidden m-0 p-0`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RecaptchaProvider>
            <PublicShell homepageContent={homepageContent}>{children}</PublicShell>

            <Toaster />
          </RecaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
