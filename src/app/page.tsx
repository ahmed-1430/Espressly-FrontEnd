import type { Metadata } from "next";
import { HomeHero } from "@/components/home/home-hero";
import { FeaturedCoffee } from "@/components/home/featured-coffee";
import {
  AtmospherePreview,
  BrandStory,
  MenuPreview,
  ShopPreview,
  SignatureExperience,
} from "@/components/home/home-sections";
import { VisitEspressly } from "@/components/home/visit-espressly";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

/**
 * Home.
 *
 * Composed entirely from section components, so the page file stays a readable
 * outline of the experience rather than a wall of markup.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <FeaturedCoffee />
      <BrandStory />
      <SignatureExperience />
      <MenuPreview />
      <AtmospherePreview />
      <ShopPreview />
      <VisitEspressly />
    </>
  );
}