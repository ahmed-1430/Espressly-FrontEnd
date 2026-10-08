import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
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
      <PageHero
        eyebrow="Since 2019"
        title="About Us"
        lede="We are a small coffee house on Queen Street that never quite finished opening. Three years later it is still the same idea: one blend, roasted on site, in a room built for staying."
        image="/images/craft-machine.jpg"
        imageAlt="The chrome face of a lever espresso machine lit warmly from behind."
        meta={[
          { label: "Founded", value: String(siteConfig.founded) },
          { label: "Baristas", value: "9" },
          { label: "Blends tried", value: "11" },
          { label: "Roasted", value: "On site" },
        ]}
      />

      <AboutStory />
      <AboutTeam />
      <AboutValues />
    </>
  );
}