import type { Metadata } from "next";

import { GalleryHero } from "@/components/hero/gallery-hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A visual journal of Espressly — coffee, craft, and atmosphere.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: `Gallery — ${siteConfig.name}`,
    description:
      "Discover the coffee, craft, and atmosphere of Espressly.",
    url: "/gallery",
  },
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen overflow-clip">
      <GalleryHero />

      <section
        id="frames"
        aria-label="Espressly photography gallery"
        className="mx-auto w-full max-w-[110rem] px-5 pb-12 pt-4 sm:px-8 sm:pb-16 sm:pt-6 lg:px-12 lg:pb-20"
      >
        <GalleryGrid />
      </section>
    </main>
  );
}
