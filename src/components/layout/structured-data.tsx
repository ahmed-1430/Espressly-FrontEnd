import { socialLinks } from "@/config/site";

const siteUrl = process.env.SITE_URL ?? "https://espressly.example.com";

/**
 * Organisation structured data.
 *
 * Declaring the cafe as a `CafeOrCoffeeShop` with real opening hours lets search
 * engines show the hours and the map pin directly. The address and coordinates
 * match `src/config/site.ts`, which is the single source for both.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "@id": `${siteUrl}/#cafe`,
  name: "Espressly",
  description:
    "Specialty coffee house on Queen Street West. One blend, roasted on site weekly, pulled on a three-group lever.",
  url: siteUrl,
  telephone: "+1-416-555-0142",
  email: "hello@espressly.cafe",
  image: `${siteUrl}/brand/espressly-logo-espresso.png`,
  logo: `${siteUrl}/brand/espressly-logo-espresso.png`,
  priceRange: "$$",
  currenciesAccepted: "CAD",
  foundingDate: "2019",
  address: {
    "@type": "PostalAddress",
    streetAddress: "418 Queen Street West",
    addressLocality: "Toronto",
    addressRegion: "ON",
    postalCode: "M5V 2A9",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.6471,
    longitude: -79.4006,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday"],
      opens: "07:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Thursday", "Friday"],
      opens: "07:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "08:00",
      closes: "16:00",
    },
  ],
  sameAs: socialLinks.map((social) => social.href),
  servesCuisine: ["Coffee", "Breakfast", "Pastry"],
  acceptsReservations: "False",
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // Structured data must be a single serialised object; the values are all
      // static, authored above, and contain no user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}