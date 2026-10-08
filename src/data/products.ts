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
  /** Alt text for the product image, describing what is actually in frame. */
  readonly imageAlt: string;
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

/**
 * The catalogue.
 *
 * Every product image is one of our own frames and each `imageAlt` describes what
 * is actually in that frame. Stock frames carrying a third party's branding were
 * rejected outright rather than cropped around, and products that could not be
 * represented honestly — a grinder or a takeaway cup, where the only available
 * photographs showed someone else's label — were cut from the range rather than
 * shipped with a misleading image.
 */
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
    imageAlt: "A dense macro texture of dark roasted coffee beans filling the frame.",
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
    imageAlt: "Two hands cupped around a large quantity of freshly roasted beans.",
    roast: "Light",
    weight: "250 g",
    limited: true,
    details: ["Single lot, named on the bag", "Rest 14 days", "Limited allocation"],
  },
  {
    id: "cold-brew-bottle",
    name: "Cold Brew",
    subtitle: "Ready to drink · 330 ml",
    description:
      "Eighteen hours cold-steeped, poured over one clear block. Drink it cold; do not shake it.",
    price: 7.5,
    unit: "330 ml",
    category: "coffee",
    image: "/images/cold-tonic.jpg",
    imageAlt: "A tall glass of iced coffee with milk swirling through it on a wooden table.",
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
    imageAlt: "A glass of layered coffee and milk on a pale surface lit by dappled window light.",
    roast: "Dark",
    weight: "340 g",
    details: ["Medium-coarse", "Best within 4 weeks", "Weekly grind"],
  },
  {
    id: "ceramic-set",
    name: "Cup & Saucer",
    subtitle: "250 ml · matte glaze",
    description:
      "Thrown in a studio outside Toronto. Thin walls, and a lip thin enough to drink from properly.",
    price: 58,
    unit: "per set",
    category: "equipment",
    image: "/images/editorial-still.jpg",
    imageAlt: "A plain white cup and saucer of black coffee on a dark table.",
    details: ["250 ml", "Dishwasher safe", "Glaze varies slightly"],
  },
  {
    id: "scoop",
    name: "Measuring Scoop",
    subtitle: "Anodised aluminium · 18 g",
    description:
      "A 18-gram scoop, sized to the dose on our bar card. Brushed rather than polished, so it does not glare.",
    price: 24,
    unit: "each",
    category: "equipment",
    image: "/images/product-scoop.jpg",
    imageAlt: "An anodised scoop of ground coffee lying beside whole beans on a dark surface.",
    details: ["18 g dose", "Brushed finish", "Dishwasher safe"],
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
    imageAlt: "A cafe terrace on a cobbled street with an A-board menu on the pavement.",
    details: ["18 oz canvas", "Long strap", "Printed in Toronto"],
  },
  {
    id: "apron",
    name: "Bar Apron",
    subtitle: "Waxed cotton · one size",
    description:
      "The apron our staff wear. Waxed so it takes a spill and then dries without leaving a mark.",
    price: 78,
    unit: "each",
    category: "merch",
    image: "/images/craft-pour.jpg",
    imageAlt: "Steamed milk being poured into a cup, forming a rosetta in the crema.",
    details: ["Waxed cotton", "Adjustable straps", "Cross-back"],
  },
];

export const featuredProducts = [
  "signature-blend",
  "cold-brew-bottle",
  "scoop",
  "canvas-tote",
] as const;