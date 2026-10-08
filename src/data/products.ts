export type ProductCategory = "coffee" | "equipment" | "merch";

export type Product = {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly price: number;
  readonly unit: string;
  readonly category: ProductCategory;
  readonly image: string;
  readonly roast?: string;
  readonly weight?: string;
  readonly limited?: boolean;
  readonly details: readonly string[];
};

export const productCategories = [
  { id: "coffee", label: "Coffee" },
  { id: "equipment", label: "Equipment" },
  { id: "merch", label: "Merch" },
] as const;

export const products: readonly Product[] = [
  {
    id: "signature-blend",
    name: "Signature Blend",
    subtitle: "Whole bean · 340 g",
    description:
      "The same blend we pull on bar, roasted a shade darker for filter. Brazil and Ethiopia, cocoa and dried fig.",
    price: 22,
    unit: "340 g",
    category: "coffee",
    image: "/images/product-beans.jpg",
    roast: "Dark",
    weight: "340 g",
    details: ["Rest 7 days after roasting", "Whole bean only", "Roasted every Tuesday"],
  },
  {
    id: "single-origin",
    name: "Single Origin",
    subtitle: "Whole bean · 250 g",
    description:
      "One farm, one lot, one season. Rotating. Ask at the counter and we will tell you who grew it.",
    price: 26,
    unit: "250 g",
    category: "coffee",
    image: "/images/craft-origin.jpg",
    roast: "Light",
    weight: "250 g",
    limited: true,
    details: ["Single lot, named on the bag", "Rest 14 days", "Limited allocation"],
  },
  {
    id: "cold-brew-bottle",
    name: "Cold Brew Bottle",
    subtitle: "Ready to drink · 330 ml",
    description:
      "Eighteen hours cold-steeped, bottled the same afternoon. Drink it cold; do not shake it.",
    price: 7.5,
    unit: "330 ml",
    category: "coffee",
    image: "/images/cold-tonic.jpg",
    details: ["No sugar", "Keep refrigerated", "Best within 10 days"],
  },
  {
    id: "house-blend-filter",
    name: "Filter Grind",
    subtitle: "Pre-ground · 340 g",
    description:
      "Ground medium-coarse for batch brew and drippers. Requested often, so we grind it fresh every Friday.",
    price: 22,
    unit: "340 g",
    category: "coffee",
    image: "/images/bar-batch.jpg",
    roast: "Dark",
    weight: "340 g",
    details: ["Medium-coarse", "Best within 4 weeks", "Weekly grind"],
  },
  {
    id: "hand-grinder",
    name: "Hand Grinder",
    subtitle: "Anodised aluminium",
    description:
      "Forty-eight millimetre conical burrs, stepped adjustment, almost silent. The last grinder we bought for the bar.",
    price: 145,
    unit: "each",
    category: "equipment",
    image: "/images/craft-grinder.jpg",
    details: ["48 mm conical burrs", "36 steps", "Two-year warranty"],
  },
  {
    id: "ceramic-set",
    name: "Ceramic Cup & Saucer",
    subtitle: "250 ml · matte glaze",
    description:
      "Thrown in a studio outside Toronto. Thin walls, a lip thin enough to drink from properly.",
    price: 58,
    unit: "per set",
    category: "equipment",
    image: "/images/bar-cupping.jpg",
    details: ["250 ml", "Dishwasher safe", "Glaze varies slightly"],
  },
  {
    id: "travel-mug",
    name: "Travel Cup",
    subtitle: "Insulated · 350 ml",
    description:
      "Holds heat for four hours. Fits under a group head, which is the only test that matters.",
    price: 42,
    unit: "each",
    category: "merch",
    image: "/images/product-cup.jpg",
    details: ["350 ml", "Leakproof lid", "Four-hour retention"],
  },
  {
    id: "canvas-tote",
    name: "Canvas Tote",
    subtitle: "Heavyweight cotton",
    description:
      "Screen-printed in-house on eighteen-ounce canvas. Heavy enough that the strap will not stretch out.",
    price: 32,
    unit: "each",
    category: "merch",
    image: "/images/space-street.jpg",
    details: ["18 oz canvas", "Long strap", "Printed in Toronto"],
  },
  {
    id: "retail-bag",
    name: "Retail Beans",
    subtitle: "Valve bag · 250 g",
    description:
      "The same blend in a one-way valve bag, for anyone who grinds at home. Not for resale.",
    price: 22,
    unit: "250 g",
    category: "coffee",
    image: "/images/product-bag.jpg",
    roast: "Dark",
    weight: "250 g",
    details: ["One-way valve", "Home grind only", "Not for resale"],
  },
  {
    id: "scoop",
    name: "Measuring Scoop",
    subtitle: "Anodised aluminium",
    description:
      "A 18-gram scoop, sized to the dose on our bar card. Brushed, not polished.",
    price: 24,
    unit: "each",
    category: "equipment",
    image: "/images/product-scoop.jpg",
    details: ["18 g dose", "Brushed finish", "Dishwasher safe"],
  },
  {
    id: "apron",
    name: "Bar Apron",
    subtitle: "Waxed cotton · one size",
    description:
      "The apron our staff wear. Waxed so it takes a spill and then dries without a mark.",
    price: 78,
    unit: "each",
    category: "merch",
    image: "/images/craft-pour.jpg",
    details: ["Waxed cotton", "Adjustable straps", "Cross-back"],
  },
];

export const featuredProducts = [
  "signature-blend",
  "cold-brew-bottle",
  "hand-grinder",
  "canvas-tote",
] as const;