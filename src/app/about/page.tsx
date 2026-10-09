import type { Metadata } from "next";
import { AboutHero } from "@/components/hero/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutValues } from "@/components/about/about-values";
import { AboutTeam } from "@/components/about/about-team";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Espressly opened in 2019 with one lever, one blend, and a refusal to serve coffee we would not drink. The story of how the room was built, and the values that did not change.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About — ${siteConfig.name}`,
    description: "One blend, roasted weekly on site. The room is quiet by design.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutTeam />
      <AboutValues />
    </>
  );
}