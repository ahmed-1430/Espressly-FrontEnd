import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Cursor } from "@/components/motion/cursor";
import { fontVariables } from "@/styles/fonts";
import "./globals.css";

/**
 * Canonical URL origin.
 *
 * Vercel injects VERCEL_PROJECT_PRODUCTION_URL at build time; falling back to a
 * placeholder keeps local builds working without an env file. Set SITE_URL in the
 * deployment environment to publish correct canonicals and Open Graph images.
 */
const siteUrl = process.env.SITE_URL ?? siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — Specialty Coffee, Crafted With Intention`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: `${siteConfig.name} Coffee Co.` }],
  creator: siteConfig.name,
  publisher: `${siteConfig.name} Coffee Co.`,
  keywords: [
    "specialty coffee",
    "coffee shop Toronto",
    "espresso bar",
    "single origin coffee",
    "coffee beans",
    "Espressly",
  ],
  category: "food and drink",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/brand/espressly-logo-cream.png",
        width: 855,
        height: 239,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/brand/espressly-logo-cream.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#14100d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="auto" className={fontVariables}>
      <body className="min-h-dvh bg-background antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-accent focus:px-5 focus:py-3 focus:text-xs focus:uppercase focus:tracking-[0.16em] focus:text-accent-foreground"
        >
          Skip to content
        </a>

        <SmoothScroll />
        <Cursor />
        <Navbar />

        <main id="main" className="relative">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}