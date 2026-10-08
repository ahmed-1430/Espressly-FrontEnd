import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { ShopCatalogue } from "@/components/shop/shop-catalogue";
import { ShopEnquiry } from "@/components/shop/shop-enquiry";
import { Container } from "@/components/layout/container";
import { products } from "@/data/products";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Espressly beans roasted on site, cold brew to take away, hand grinders, cups and merch. Ordering is by enquiry, not by cart.",
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
      <PageHero
        eyebrow="Beans & Goods"
        title="Shop"
        lede="The same coffee we serve, roasted in the back room twice a week, plus the equipment and objects we actually use ourselves."
        image="/images/craft-machine.jpg"
        imageAlt="A chrome espresso machine on a brew bar, its buttons catching the light."
        meta={[
          { label: "Products", value: String(products.length).padStart(2, "0") },
          { label: "Roasted", value: "Tue & Fri" },
          { label: "Dispatch", value: "2 working days" },
        ]}
      />

      <Container className="py-16 sm:py-20 lg:py-24">
        <ShopCatalogue />
      </Container>

      <ShopEnquiry />
    </>
  );
}