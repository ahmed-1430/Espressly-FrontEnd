export type GalleryFrame = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  /**
   * Editorial placement. Wide frames span the full grid, tall frames occupy a
   * narrow column, and standard frames fill a single cell. The layout is authored
   * rather than random so the page reads like a spread, not a masonry dump.
   */
  readonly span: "wide" | "tall" | "standard";
  readonly meta: string;
};

/**
 * The gallery set.
 *
 * Alt text describes what is actually in each frame. It was written against the
 * photographs rather than against the captions, which is why some captions name
 * a moment that the image cannot show.
 */
export const galleryFrames: readonly GalleryFrame[] = [
  {
    id: "morning-bar",
    src: "/images/hero-primary.jpg",
    alt: "A hand holding a white ceramic cup as steam rises through warm morning light.",
    caption: "07:02 — first cup, before the shutters go up.",
    span: "wide",
    meta: "Bar · Morning",
  },
  {
    id: "espresso-pull",
    src: "/images/craft-pour.jpg",
    alt: "Steamed milk poured into a cup, forming a rosetta in the crema.",
    caption: "The last cup of the morning rush, poured slowly.",
    span: "standard",
    meta: "Craft · Pour",
  },
  {
    id: "beans-in-hand",
    src: "/images/craft-origin.jpg",
    alt: "Two hands cupped around a large quantity of freshly roasted coffee beans.",
    caption: "Wednesday's roast, cooling on the bench.",
    span: "standard",
    meta: "Roast · Green",
  },
  {
    id: "machine-detail",
    src: "/images/craft-machine.jpg",
    alt: "The chrome face of an espresso machine lit warmly from behind.",
    caption: "Three groups, calibrated every morning at seven.",
    span: "tall",
    meta: "Equipment",
  },
  {
    id: "counter-dark",
    src: "/images/hero-counter.jpg",
    alt: "A long bar counter lined with bottles and hanging lights, lit in amber.",
    caption: "After eight, the room turns to this.",
    span: "wide",
    meta: "Bar · Evening",
  },
  {
    id: "viennoiserie",
    src: "/images/food-viennoiserie.jpg",
    alt: "A dark wooden board of croissants, danishes and pastries lit from one side.",
    caption: "Thirty-six hour lamination. Baked twice daily.",
    span: "standard",
    meta: "Kitchen",
  },
  {
    id: "seating-room",
    src: "/images/space-seating.jpg",
    alt: "A cafe interior with rattan chairs, plants and tables under a glazed roof.",
    caption: "The long table runs the length of the room.",
    span: "standard",
    meta: "Room · Day",
  },
  {
    id: "window-seat",
    src: "/images/space-window.jpg",
    alt: "A wooden table by a window with a notebook, sunglasses and a small coffee.",
    caption: "Window seats go quiet after three.",
    span: "standard",
    meta: "Room · Afternoon",
  },
  {
    id: "beans-close",
    src: "/images/product-beans.jpg",
    alt: "Roasted coffee beans filling the frame in a dense macro texture.",
    caption: "Roasted to first crack plus ninety seconds.",
    span: "wide",
    meta: "Detail",
  },
  {
    id: "bakery-case",
    src: "/images/food-counter.jpg",
    alt: "A chilled display case of pastries arranged on shelves inside the cafe.",
    caption: "Everything in the case is made here.",
    span: "standard",
    meta: "Kitchen",
  },
  {
    id: "garden-room",
    src: "/images/space-garden.jpg",
    alt: "A cafe interior filled with hanging plants beneath a glazed roof.",
    caption: "Plants we have outlived. Two, so far.",
    span: "wide",
    meta: "Room · Day",
  },
  {
    id: "cold-brew",
    src: "/images/cold-brew.jpg",
    alt: "A tall glass of iced coffee with ice and a layer of cream through the middle.",
    caption: "Eighteen hours, no heat at any point.",
    span: "standard",
    meta: "Cold",
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
    id: "pourover",
    src: "/images/bar-pourover.jpg",
    alt: "Two lattes with rosetta art on a round wooden board, surrounded by dark leaves.",
    caption: "Three ways to taste the same coffee.",
    span: "standard",
    meta: "Filter",
  },
  {
    id: "counter-view",
    src: "/images/space-counter.jpg",
    alt: "A barista working behind a white brick counter lined with shelves and stock.",
    caption: "Seven in the morning, before the room fills.",
    span: "wide",
    meta: "Bar · Morning",
  },
  {
    id: "brew-station",
    src: "/images/hero-bar.jpg",
    alt: "A brew bar of grinders and an espresso machine under warm pendant lights.",
    caption: "Three groups, two grinders, one shot at a time.",
    span: "standard",
    meta: "Equipment",
  },
  {
    id: "menu-board",
    src: "/images/space-menu.jpg",
    alt: "A cafe chalkboard menu on a concrete wall, with bicycles parked beneath it.",
    caption: "Everything is priced on a card you can read standing up.",
    span: "standard",
    meta: "Room",
  },
  {
    id: "street-front",
    src: "/images/space-street.jpg",
    alt: "A cafe terrace on a cobbled street with an A-board menu on the pavement.",
    caption: "The A-board goes out when the weather allows.",
    span: "standard",
    meta: "Frontage",
  },
  {
    id: "sign",
    src: "/images/editorial-sign.jpg",
    alt: "Two portafilters and ground coffee laid out on a dark timber bench.",
    caption: "Dialed in twice a day, and logged both times.",
    span: "tall",
    meta: "Craft",
  },
];

export const homeGalleryFrames = [
  galleryFrames[0],
  galleryFrames[3],
  galleryFrames[6],
  galleryFrames[9],
] as const;