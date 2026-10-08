import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
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
      <PageHero
        eyebrow="Photography"
        title="Gallery"
        lede="The room, the bar, the roast, and the people who work them. Shot on a Tuesday, mostly, because that is when the light is best and nobody is performing."
        image="/images/space-garden.jpg"
        imageAlt="A cafe interior filled with hanging plants beneath a glass roof."
        meta={[
          { label: "Frames", value: String(galleryFrames.length).padStart(2, "0") },
          { label: "Period", value: "2019 — 2026" },
          { label: "Studio", value: "Queen St W" },
        ]}
      />

      <Container className="py-16 sm:py-20 lg:py-24">
        <GalleryGrid />
      </Container>
    </>
  );
}