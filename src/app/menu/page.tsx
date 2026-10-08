import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { MenuExplorer } from "@/components/menu/menu-explorer";
import { MenuNotes } from "@/components/menu/menu-notes";
import { Container } from "@/components/layout/container";
import { menuCategories, menuItems } from "@/data/menu";
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
  const signatureCount = menuItems.filter((item) => item.signature).length;

  return (
    <>
      <PageHero
        eyebrow="Espressly — Queen Street"
        title="Our Menu"
        lede="Eight categories, one very short list. Everything below is made on site, and the seasonal board changes when the week does."
        image="/images/bar-pourover.jpg"
        imageAlt="Two lattes with rosetta art on a round wooden board, surrounded by dark leaves."
        meta={[
          { label: "Categories", value: String(menuCategories.length).padStart(2, "0") },
          { label: "Items", value: String(menuItems.length).padStart(2, "0") },
          { label: "Signatures", value: String(signatureCount).padStart(2, "0") },
          { label: "Kitchen until", value: "15:00" },
        ]}
      />

      <Container className="py-16 sm:py-20 lg:py-24">
        <MenuExplorer />
      </Container>

      <MenuNotes />
    </>
  );
}