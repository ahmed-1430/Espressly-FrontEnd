export type GalleryFrame = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  /**
   * Placement within an authored spread.
   *
   * `full`  — spans the whole column, breaks the grid
   * `half`  — one of a pair
   * `inset` — deliberately narrow, set against whitespace
   * `tall`  — portrait, drops down the page
   */
  readonly span: "full" | "half" | "inset" | "tall";
  readonly meta: string;
  /** Optional editorial note shown beside the frame on wide viewports. */
  readonly note?: string;
};

/**
 * The gallery set.
 *
 * Ordered as a sequence of spreads rather than a grid to be filled: each entry
 * declares how it sits, and negative space is part of the composition. Alt text
 * describes what is actually in each frame — it was written against the
 * photographs, not against the captions.
 */
export const galleryFrames: readonly GalleryFrame[] = [
  {
    id: "morning-bar",
    src: "/images/hero-primary.jpg",
    alt: "A hand holding a white ceramic cup as steam rises through warm morning light.",
    caption: "07:02 — first cup, before the shutters go up.",
    span: "full",
    meta: "Bar · Morning",
    note: "The hour the room is built for.",
  },
  {
    id: "espresso-pull",
    src: "/images/craft-pour.jpg",
    alt: "Steamed milk poured into a cup, forming a rosetta in the crema.",
    caption: "The last cup of the morning rush, poured slowly.",
    span: "half",
    meta: "Craft · Pour",
  },
  {
    id: "beans-in-hand",
    src: "/images/craft-origin.jpg",
    alt: "Two hands cupped around a large quantity of freshly roasted coffee beans.",
    caption: "Wednesday's roast, cooling on the bench.",
    span: "half",
    meta: "Roast · Green",
  },
  {
    id: "machine-detail",
    src: "/images/editorial-sign.jpg",
    alt: "Two portafilters and ground coffee laid out on a worn wooden board.",
    caption: "Three groups, calibrated every morning at seven.",
    span: "inset",
    meta: "Equipment",
  },
  {
    id: "counter-dark",
    src: "/images/bar-cortado.jpg",
    alt: "A cup standing on a hessian cloth with coffee beans spilled around it.",
    caption: "After eight, the room turns to this.",
    span: "full",
    meta: "Bar · Evening",
    note: "Nine in the evening, and nobody has turned the lights up.",
  },
  {
    id: "beans-close",
    src: "/images/product-beans.jpg",
    alt: "Roasted coffee beans filling the frame in a dense macro texture.",
    caption: "Roasted to first crack plus ninety seconds.",
    span: "half",
    meta: "Detail",
  },
  {
    id: "viennoiserie",
    src: "/images/food-viennoiserie.jpg",
    alt: "A chilled display case of croissants and pastries arranged on shelves inside the café.",
    caption: "Thirty-six hour lamination. Baked twice daily.",
    span: "half",
    meta: "Kitchen",
  },
  {
    id: "window-seat",
    src: "/images/space-window.jpg",
    alt: "A window-side table with a notebook, printed matter and a half-finished coffee.",
    caption: "Window seats go quiet after three.",
    span: "inset",
    meta: "Room · Afternoon",
  },
  {
    id: "seating-room",
    src: "/images/space-seating.jpg",
    alt: "A cafe interior with rattan chairs, plants and tables under a glazed roof.",
    caption: "The long table runs the length of the room.",
    span: "full",
    meta: "Room · Day",
    note: "Fourteen seats, one of them informally reserved.",
  },
  {
    id: "pourover",
    src: "/images/bar-pourover.jpg",
    alt: "Two lattes with rosetta art on a round wooden board, surrounded by dark leaves.",
    caption: "Three ways to taste the same coffee.",
    span: "half",
    meta: "Filter",
  },
  {
    id: "beans-flying",
    src: "/images/craft-beans.jpg",
    alt: "A white cup on a bed of beans with more beans falling into the frame.",
    caption: "Testing the roast, one bean at a time.",
    span: "tall",
    meta: "Roast",
  },
  {
    id: "cold-brew",
    src: "/images/cold-brew.jpg",
    alt: "A tall glass of iced coffee with ice and a layer of cream through the middle.",
    caption: "Eighteen hours, no heat at any point.",
    span: "half",
    meta: "Cold",
  },
  {
    id: "bakery-case",
    src: "/images/food-croissant.jpg",
    alt: "Two croissants on a dark bench with flour still falling around them.",
    caption: "Laminated at four in the morning. Out of the oven at seven.",
    span: "half",
    meta: "Pastry",
  },
  {
    id: "garden-room",
    src: "/images/space-garden.jpg",
    alt: "A cafe interior filled with hanging plants beneath a glazed roof.",
    caption: "Plants we have outlived. Two, so far.",
    span: "full",
    meta: "Room · Day",
    note: "The skylight is the only thing in the room we did not plan.",
  },
  {
    id: "menu-board",
    src: "/images/space-menu.jpg",
    alt: "A cafe chalkboard menu on a concrete wall, with bicycles parked beneath it.",
    caption: "Everything is priced on a card you can read standing up.",
    span: "inset",
    meta: "Room",
  },
  {
    id: "brew-station",
    src: "/images/hero-bar.jpg",
    alt: "The service counter and refrigerated display case, with the kitchen beyond.",
    caption: "Three groups, two grinders, one shot at a time.",
    span: "half",
    meta: "Equipment",
  },
  {
    id: "street-front",
    src: "/images/space-street.jpg",
    alt: "A cafe terrace on a cobbled street with an A-board menu on the pavement.",
    caption: "The A-board goes out when the weather allows.",
    span: "half",
    meta: "Frontage",
  },
  {
    id: "counter-view",
    src: "/images/space-counter.jpg",
    alt: "A barista working behind a white brick counter lined with shelves and stock.",
    caption: "Seven in the morning, before the room fills.",
    span: "tall",
    meta: "Bar · Morning",
  },
];