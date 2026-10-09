import type { Metadata } from "next";
import { GalleryHero } from "@/components/hero/gallery-hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Container } from "@/components/layout/container";
import { galleryFrames } from "@/data/gallery";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs of the Espressly bar, the long room, the pastry board and the people behind it. Shot on film and on a Tuesday morning in Queen Street.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: `Gallery — ${siteConfig.name}`,
    description: "The room, the bar, the roast, and the people who work it.",
    url: "/gallery",
  },
};

export default function GalleryPage() {
  return (
    <>
      <GalleryHero />

      <Container className="py-20 sm:py-24 lg:py-32">
        <div id="frames" className="flex flex-col gap-10">
          {/* Rail between the exhibition hero and the frames themselves. */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
            <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.25rem)] tracking-display">
              {galleryFrames.length} frames
            </h2>
            <p className="micro text-muted-foreground">
              Select any frame to open the viewer
            </p>
          </div>

          <GalleryGrid />
        </div>
      </Container>
    </>
  );
}