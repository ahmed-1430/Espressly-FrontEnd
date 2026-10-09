import type { Metadata } from "next";
import { ShopHero } from "@/components/hero/shop-hero";
import { ShopCatalogue } from "@/components/shop/shop-catalogue";
import { ShopEnquiry } from "@/components/shop/shop-enquiry";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Espressly beans roasted on site, cold brew to take away, brewing gear and merch. Ordering is by enquiry, not by cart.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: `Shop — ${siteConfig.name}`,
    description: "Beans roasted Tuesdays and Fridays. Take them home, or set up a standing order.",
    url: "/shop",
  },
};

export default function ShopPage() {
  return (
    <>
      <ShopHero />

      <Container className="py-16 sm:py-20 lg:py-24">
        <div id="catalogue">
          <ShopCatalogue />
        </div>
      </Container>

      <ShopEnquiry />
    </>
  );
}