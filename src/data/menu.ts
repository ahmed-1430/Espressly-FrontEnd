export type DietaryTag = "vegan" | "vegetarian" | "gluten-free" | "contains-dairy";

export type MenuCategoryId =
  | "espresso"
  | "signature"
  | "brewed"
  | "cold"
  | "tea"
  | "pastry"
  | "breakfast"
  | "seasonal";

export type MenuCategory = {
  readonly id: MenuCategoryId;
  readonly label: string;
  /** Short line shown under the section heading while a category is active. */
  readonly note: string;
  readonly image: string;
};

export type MenuItem = {
  readonly id: string;
  readonly category: MenuCategoryId;
  readonly name: string;
  readonly description: string;
  /** Millilitres for drinks, grams for pastry. Used as the secondary price unit. */
  readonly unit: "ml" | "g" | "set";
  readonly price: number;
  readonly image?: string;
  /** Long-form editorial note used for oversized featured items. */
  readonly tasting?: string;
  readonly signature?: boolean;
  readonly dietary?: readonly DietaryTag[];
  readonly roast?: string;
};

export const menuCategories: readonly MenuCategory[] = [
  {
    id: "espresso",
    label: "Espresso",
    note: "Pulled on a three-group lever, calibrated every morning at seven.",
    image: "/images/bar-espresso.jpg",
  },
  {
    id: "signature",
    label: "Signature",
    note: "The house compositions we are known for, unchanged since 2019.",
    image: "/images/bar-flatwhite.jpg",
  },
  {
    id: "brewed",
    label: "Brewed",
    note: "Batch brew and filter, ground to order and changed through the day.",
    image: "/images/bar-pourover.jpg",
  },
  {
    id: "cold",
    label: "Cold Coffee",
    note: "Steeped eighteen hours, served over a single clear block.",
    image: "/images/cold-brew.jpg",
  },
  {
    id: "tea",
    label: "Tea & Matcha",
    note: "Loose leaf from a single supplier, and ceremonial-grade matcha.",
    image: "/images/tea-matcha.jpg",
  },
  {
    id: "pastry",
    label: "Pastry",
    note: "Laminated in-house each morning. It sells out by two on Saturdays.",
    image: "/images/food-viennoiserie.jpg",
  },
  {
    id: "breakfast",
    label: "Breakfast",
    note: "Served until eleven, on sourdough from a bakery two streets over.",
    image: "/images/food-breakfast.jpg",
  },
  {
    id: "seasonal",
    label: "Seasonal",
    note: "Short runs, small quantities, gone when they are gone.",
    image: "/images/food-dessert.jpg",
  },
] as const;

export const menuItems: readonly MenuItem[] = [
  // --- espresso ---
  {
    id: "espresso",
    category: "espresso",
    name: "Espresso",
    description: "A dark roast blend of Brazil and Ethiopia. Cocoa, dried fig, a long finish.",
    unit: "set",
    price: 4.25,
    roast: "Dark",
    signature: true,
  },
  {
    id: "macchiato",
    category: "espresso",
    name: "Macchiato",
    description: "Espresso marked with a spoon of steamed milk. Nothing more.",
    unit: "ml",
    price: 4.75,
  },
  {
    id: "cortado",
    category: "espresso",
    name: "Cortado",
    description: "Equal parts espresso and warm milk in a 120 ml glass.",
    unit: "ml",
    price: 5.25,
    image: "/images/bar-cortado.jpg",
  },
  {
    id: "cappuccino",
    category: "espresso",
    name: "Cappuccino",
    description: "Wet, dry, or somewhere in between. Tell us and we will not argue.",
    unit: "ml",
    price: 5.75,
    image: "/images/bar-cappuccino.jpg",
    dietary: ["vegetarian", "contains-dairy"],
  },
  {
    id: "flat-white",
    category: "espresso",
    name: "Flat White",
    description: "Ristretto shots under thin, glossy microfoam. The house standard.",
    unit: "ml",
    price: 5.5,
    dietary: ["vegetarian", "contains-dairy"],
    signature: true,
  },
  {
    id: "filter-shot",
    category: "espresso",
    name: "Espresso Tonic",
    description: "Ristretto over cold tonic with a wide strip of grapefruit peel.",
    unit: "ml",
    price: 6.75,
    tasting:
      "Bitter and bright in equal measure. The tonic's quinine lifts the cocoa notes out of the blend and leaves the citrus on top.",
  },
  {
    id: "americano",
    category: "espresso",
    name: "Americano",
    description: "Double ristretto lengthened with hot water.",
    unit: "ml",
    price: 4.75,
  },
  {
    id: "affogato",
    category: "espresso",
    name: "Affogato",
    description: "A double shot poured over vanilla bean gelato, at the table.",
    unit: "set",
    price: 8.5,
    image: "/images/food-affogato.jpg",
    dietary: ["vegetarian", "contains-dairy"],
  },

  // --- signature ---
  {
    id: "brown-butter-latte",
    category: "signature",
    name: "Brown Butter Latte",
    description: "Browned butter syrup, a pinch of sea salt, steamed milk, ristretto.",
    unit: "ml",
    price: 6.75,
    signature: true,
    dietary: ["vegetarian", "contains-dairy"],
    tasting:
      "The house signature since the first week. Toasted and warm without being sweet, which is the entire point of the salt.",
    image: "/images/bar-macchiato.jpg",
  },
  {
    id: "cardamom-flat-white",
    category: "signature",
    name: "Cardamom Flat White",
    description: "Green cardamom steeped in the milk overnight. Nothing added at the bar.",
    unit: "ml",
    price: 6.5,
    dietary: ["vegetarian", "contains-dairy"],
    tasting: "Floral and warm, closer to a spice than a sweetener.",
  },
  {
    id: "espresso-tonic-signature",
    category: "signature",
    name: "Cold Brew Tonic",
    description: "Eighteen-hour cold brew, tonic, orange peel. Built in the glass.",
    unit: "ml",
    price: 7.25,
    signature: true,
    tasting: "Low acid, high clarity. The cleanest way to taste the origin.",
    image: "/images/cold-tonic.jpg",
  },
  {
    id: "black-sesame-cortado",
    category: "signature",
    name: "Black Sesame Cortado",
    description: "Toasted black sesame, milk, and a single ristretto shot.",
    unit: "ml",
    price: 6.95,
    dietary: ["vegetarian", "contains-dairy"],
    tasting: "Nutty and almost savoury. Not for everyone, which is fine.",
  },
  {
    id: "honey-oat-latte",
    category: "signature",
    name: "Honey Oat Latte",
    description: "Oat milk, wildflower honey from the Niagara escarpment.",
    unit: "ml",
    price: 6.25,
    dietary: ["vegan"],
  },
  {
    id: "mocha-pot",
    category: "signature",
    name: "Drinking Chocolate",
    description: "70% dark chocolate melted into steamed milk. No espresso.",
    unit: "ml",
    price: 6.25,
    dietary: ["vegetarian", "contains-dairy"],
  },

  // --- brewed ---
  {
    id: "pourover-single",
    category: "brewed",
    name: "Filter — Single Origin",
    description: "Rotating guest from a roaster we buy small lots from.",
    unit: "ml",
    price: 6.5,
    tasting: "Ask what is on today. We will pour it and then tell you about it.",
    signature: true,
    image: "/images/bar-pourover.jpg",
  },
  {
    id: "batch-filter",
    category: "brewed",
    name: "Batch Filter",
    description: "House blend, ground coarse, brewed every forty minutes.",
    unit: "ml",
    price: 4.5,
  },
  {
    id: "batch-decaf",
    category: "brewed",
    name: "Batch Decaf",
    description: "Sugarcane decaf. Tastes like coffee, not like compromise.",
    unit: "ml",
    price: 4.75,
  },
  {
    id: "french-press",
    category: "brewed",
    name: "Table French Press",
    description: "Thirty-six grams for two cups. Allow four minutes; we will pour the water.",
    unit: "set",
    price: 16,
    tasting: "The most honest way to taste a coffee, and the least forgiving.",
    image: "/images/space-table.jpg",
  },
  {
    id: "cupping",
    category: "brewed",
    name: "Cupping Flight",
    description: "Three origins side by side, twenty-eight grams each, with a scorecard.",
    unit: "set",
    price: 14,
    tasting: "Standard practice, open to anyone. You do not need to know anything to join in.",
    image: "/images/bar-cupping.jpg",
  },

  // --- cold ---
  {
    id: "cold-brew-classic",
    category: "cold",
    name: "Cold Brew",
    description: "Eighteen hours, cold water, no heat at any point.",
    unit: "ml",
    price: 5.75,
    signature: true,
    tasting: "Cocoa-heavy and almost impossibly smooth over ice.",
    image: "/images/cold-brew.jpg",
  },
  {
    id: "cold-brew-nitro",
    category: "cold",
    name: "Nitro Cold Brew",
    description: "Nitrogen-charged on tap, poured without ice so it stays dense.",
    unit: "ml",
    price: 7,
    tasting: "A cascading head that settles like cream. Very little acidity survives the process.",
    image: "/images/cold-iced.jpg",
  },
  {
    id: "iced-latte",
    category: "cold",
    name: "Iced Latte",
    description: "Shaken hard with ice, so it arrives cold all the way down.",
    unit: "ml",
    price: 6.25,
    dietary: ["vegetarian", "contains-dairy"],
  },
  {
    id: "espresso-soda",
    category: "cold",
    name: "Espresso Soda",
    description: "Ristretto, soda, ice, and a strip of orange.",
    unit: "ml",
    price: 6.75,
  },
  {
    id: "cold-brew-bottle",
    category: "cold",
    name: "Cold Brew Bottle",
    description: "Twelve-hour steep in the bottle. Take it home, or drink it here.",
    unit: "ml",
    price: 7.5,
  },

  // --- tea & matcha ---
  {
    id: "matcha-latte",
    category: "tea",
    name: "Matcha Latte",
    description: "Ceremonial grade from Uji, whisked by hand, oat or whole milk.",
    unit: "ml",
    price: 6.5,
    dietary: ["vegetarian"],
    tasting: "Grassy and sweet, with no bitterness at all if it is whisked properly.",
    image: "/images/tea-glass.jpg",
  },
  {
    id: "sencha",
    category: "tea",
    name: "Sencha",
    description: "Steamed green, low caffeine, brewed at seventy degrees.",
    unit: "ml",
    price: 5.5,
    dietary: ["vegan", "gluten-free"],
    image: "/images/tea-loose-leaf.jpg",
  },
  {
    id: "assam",
    category: "tea",
    name: "Assam",
    description: "Malty and strong enough to take milk. Loose leaf, four-minute steep.",
    unit: "ml",
    price: 5.5,
    dietary: ["vegan", "gluten-free"],
  },
  {
    id: "earl-grey",
    category: "tea",
    name: "Earl Grey",
    description: "Bergamot oil over a brisk Assam base.",
    unit: "ml",
    price: 5.5,
    dietary: ["vegan", "gluten-free"],
    image: "/images/tea-ceramic.jpg",
  },
  {
    id: "hojicha",
    category: "tea",
    name: "Hojicha",
    description: "Roasted green tea. Toasty, low caffeine, good after four in the afternoon.",
    unit: "ml",
    price: 5.75,
    dietary: ["vegan", "gluten-free"],
    image: "/images/tea-pot.jpg",
  },
  {
    id: "chai",
    category: "tea",
    name: "Masala Chai",
    description: "Simmered on the stove all morning with whole spices and no syrup.",
    unit: "ml",
    price: 6,
    dietary: ["vegetarian", "contains-dairy"],
    image: "/images/tea-matcha-bowl.jpg",
  },

  // --- pastry ---
  {
    id: "croissant",
    category: "pastry",
    name: "Butter Croissant",
    description: "Thirty-six hour lamination, French butter, baked twice daily.",
    unit: "g",
    price: 5.25,
    dietary: ["vegetarian", "contains-dairy"],
    tasting: "Shatters if you squeeze it. That is the entire test.",
    image: "/images/food-croissant.jpg",
  },
  {
    id: "almond-pain",
    category: "pastry",
    name: "Almond Pain",
    description: "A second bake with frangipane and a heavy dust of icing sugar.",
    unit: "g",
    price: 6,
    dietary: ["vegetarian", "contains-dairy"],
  },
  {
    id: "cardamom-bun",
    category: "pastry",
    name: "Cardamom Bun",
    description: "Hand-knotted, crushed cardamom, pearl sugar.",
    unit: "g",
    price: 6.5,
    dietary: ["vegetarian", "contains-dairy"],
    image: "/images/food-tray.jpg",
  },
  {
    id: "canele",
    category: "pastry",
    name: "Canelé",
    description: "Beeswax-lined copper, dark custard centre, thin shell.",
    unit: "g",
    price: 4.75,
    dietary: ["vegetarian", "contains-dairy"],
  },
  {
    id: "olive-oil-cake",
    category: "pastry",
    name: "Olive Oil Cake",
    description: "Citrus, good olive oil, no butter. Served at room temperature.",
    unit: "g",
    price: 6.5,
    dietary: ["vegetarian"],
    image: "/images/food-dessert.jpg",
  },
  {
    id: "chocolate-tart",
    category: "pastry",
    name: "Dark Chocolate Tart",
    description: "Seventy percent chocolate, olive oil crust, Maldon salt on top.",
    unit: "g",
    price: 7.25,
    dietary: ["vegetarian"],
    image: "/images/food-cake.jpg",
  },
  {
    id: "biscotti",
    category: "pastry",
    name: "Almond Biscotti",
    description: "Twice-baked, meant to survive a long conversation.",
    unit: "g",
    price: 4.5,
    dietary: ["vegetarian"],
    image: "/images/food-biscuit.jpg",
  },
  {
    id: "sourdough-toast",
    category: "pastry",
    name: "Sourdough & Cultured Butter",
    description: "Thick-cut, grilled in butter, sea salt. Two slices minimum.",
    unit: "set",
    price: 8,
    dietary: ["vegetarian", "contains-dairy"],
    image: "/images/food-bread.jpg",
  },

  // --- breakfast ---
  {
    id: "avo-toast",
    category: "breakfast",
    name: "Avocado & Chilli",
    description: "Sourdough, smashed avocado, pickled chilli, lemon, dukkah.",
    unit: "set",
    price: 15,
    dietary: ["vegan"],
  },
  {
    id: "eggs-any",
    category: "breakfast",
    name: "Eggs, Any Way",
    description: "Two eggs on sourdough. Tell us how you want them.",
    unit: "set",
    price: 14,
    dietary: ["vegetarian", "contains-dairy"],
  },
  {
    id: "shakshuka",
    category: "breakfast",
    name: "Shakshuka",
    description: "Slow-cooked tomato and pepper, baked eggs, feta, flatbread.",
    unit: "set",
    price: 17,
    dietary: ["vegetarian"],
    image: "/images/food-breakfast.jpg",
  },
  {
    id: "french-toast",
    category: "breakfast",
    name: "French Toast",
    description: "Brioche left overnight, griddled in butter, seasonal fruit.",
    unit: "set",
    price: 15,
    dietary: ["vegetarian", "contains-dairy"],
    image: "/images/food-toast.jpg",
  },
  {
    id: "granola-bowl",
    category: "breakfast",
    name: "Granola & Yoghurt",
    description: "House granola, thick yoghurt, poached seasonal fruit, bee pollen.",
    unit: "set",
    price: 13,
    dietary: ["vegetarian"],
  },
  {
    id: "sourdough-plate",
    category: "breakfast",
    name: "Board & Butter",
    description: "Whatever the bakery left us, plus butter and preserve.",
    unit: "set",
    price: 12,
    dietary: ["vegetarian", "contains-dairy"],
    image: "/images/food-counter.jpg",
  },

  // --- seasonal ---
  {
    id: "maple-oat",
    category: "seasonal",
    name: "Maple Oat Latte",
    description: "Dark maple from a mill two hours north, oat milk, cinnamon oil.",
    unit: "ml",
    price: 6.75,
    signature: true,
    dietary: ["vegan"],
    tasting: "Available November through March, and then it is gone for the year.",
  },
  {
    id: "pumpkin-spice",
    category: "seasonal",
    name: "Roasted Squash Latte",
    description: "Roasted kabocha, brown butter, nutmeg. No syrup.",
    unit: "ml",
    price: 6.75,
    dietary: ["vegetarian", "contains-dairy"],
    tasting: "Autumn, decided in a kitchen rather than a marketing meeting.",
  },
  {
    id: "gingerbread",
    category: "seasonal",
    name: "Gingerbread Latte",
    description: "Molasses, fresh ginger, black pepper. Served warm in a small glass.",
    unit: "ml",
    price: 6.95,
    dietary: ["vegetarian", "contains-dairy"],
  },
  {
    id: "lavender-tonic",
    category: "seasonal",
    name: "Lavender Espresso Tonic",
    description: "House lavender cordial, tonic, ristretto.",
    unit: "ml",
    price: 7.25,
  },
] as const;

export const dietaryLabels: Record<DietaryTag, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  "gluten-free": "Gluten-free",
  "contains-dairy": "Contains dairy",
};