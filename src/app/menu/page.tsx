import type { Metadata } from "next";
import { MenuHero } from "@/components/hero/menu-hero";
import { MenuExplorer } from "@/components/menu/menu-explorer";
import { MenuNotes } from "@/components/menu/menu-notes";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Our Menu",
  description:
    "Espresso, signature coffees, filter, cold brew, tea, pastry and breakfast. Every coffee is roasted on site and pulled on a three-group lever. Prices in CAD.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: `Our Menu — ${siteConfig.name}`,
    description:
      "Eight categories, one very short list. Espresso roasted on site and pulled to order.",
    url: "/menu",
  },
};

export default function MenuPage() {
  return (
    <>
      <MenuHero />

      {/* The category rail anchors here, so "Read the list" lands on the control. */}
      <Container className="py-16 sm:py-20 lg:py-24">
        <div id="categories">
          <MenuExplorer />
        </div>
      </Container>

      <MenuNotes />
    </>
  );
}