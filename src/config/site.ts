/**
 * Espressly brand and site configuration.
 *
 * Everything reusable about the brand lives here so pages stay about layout and
 * content rather than repeating literals.
 */

export const siteConfig = {
  name: "Espressly",
  wordmark: "Espressly",
  tagline: "Specialty coffee, crafted with intention.",
  description:
    "Espressly is a specialty coffee house built around a single espresso blend, slow-roasted weekly and pulled to order. Read the menu, browse the shop, and find us downtown.",
  shortDescription:
    "Specialty coffee, roasted weekly and pulled to order in a warm, quiet room downtown.",
  url: "https://espressly.example.com",
  locale: "en_US",
  email: "hello@espressly.cafe",
  phone: "+1 (416) 555-0142",
  phoneDisplay: "+1 416 555 0142",
  founded: 2019,
} as const;

export const location = {
  name: "Espressly — Queen Street",
  street: "418 Queen Street West",
  district: "Downtown Toronto, Ontario",
  postalCode: "M5V 2A9",
  country: "Canada",
  coordinates: { latitude: 43.6471, longitude: -79.4006 },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=43.6471,-79.4006",
} as const;

export type OpeningHour = {
  readonly day: string;
  readonly shortDay: string;
  readonly hours: string;
};

export const openingHours: readonly OpeningHour[] = [
  { day: "Monday", shortDay: "Mon", hours: "07:00 — 18:00" },
  { day: "Tuesday", shortDay: "Tue", hours: "07:00 — 18:00" },
  { day: "Wednesday", shortDay: "Wed", hours: "07:00 — 18:00" },
  { day: "Thursday", shortDay: "Thu", hours: "07:00 — 19:00" },
  { day: "Friday", shortDay: "Fri", hours: "07:00 — 19:00" },
  { day: "Saturday", shortDay: "Sat", hours: "08:00 — 19:00" },
  { day: "Sunday", shortDay: "Sun", hours: "08:00 — 16:00" },
];

export const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/espressly.cafe" },
  { label: "TikTok", href: "https://tiktok.com/@espressly.cafe" },
  { label: "Pinterest", href: "https://pinterest.com/espresslycafe" },
] as const;

export const addressLines: readonly string[] = [
  location.street,
  location.district,
  `${location.postalCode}, ${location.country}`,
];