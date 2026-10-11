import type { Metadata } from "next";
import { GalleryHero } from "@/components/hero/gallery-hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs of the Espressly bar, the roast and the room. Shot on film and on a Tuesday morning in Queen Street.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: `Gallery — ${siteConfig.name}`,
    description: "The bar, the roast and the room, in nine photographs.",
    url: "/gallery",
  },
};

export default function GalleryPage() {
  return (
    <>
      <GalleryHero />

      {/*
        The pinned contact-sheet band that used to sit here has been removed. It
        rendered twelve of the same frames as a scrolling strip, directly between
        two sections that showed the same frames again — the single largest
        contributor to the page reading as endless, and the reason a visitor saw
        the same photograph three times before reaching the lightbox.
      */}
      <section
        id="frames"
        aria-label="Photographs"
        className="mx-auto w-full max-w-[110rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
          <h2 className="font-display text-[clamp(1.25rem,2.4vw,1.75rem)] tracking-display">
            The set
          </h2>
          <p className="micro text-muted-foreground">
            Select any frame to open the viewer
          </p>
        </div>

        <div className="mt-10 sm:mt-14">
          <GalleryGrid />
        </div>
      </section>
    </>
  );
}