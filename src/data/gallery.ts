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
    alt: "The chrome face of a lever espresso machine lit warmly from behind.",
    caption: "Three groups, calibrated every morning at seven.",
    span: "tall",
    meta: "Equipment",
  },
  {
    id: "counter-dark",
    src: "/images/hero-counter.jpg",
    alt: "An amber-lit bar counter lined with bottles and pendant lights at night.",
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
    alt: "A bright cafe interior with rattan chairs, plants and long shared tables.",
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
    alt: "A chilled display case of pastries on shelves inside the cafe.",
    caption: "Everything in the case is made here.",
    span: "standard",
    meta: "Kitchen",
  },
  {
    id: "garden-room",
    src: "/images/space-garden.jpg",
    alt: "A cafe interior filled with hanging plants beneath a glass roof.",
    caption: "Plants we have outlived. Two, so far.",
    span: "wide",
    meta: "Room · Day",
  },
  {
    id: "cold-brew",
    src: "/images/cold-brew.jpg",
    alt: "A tall glass of cold brew with ice and a layer of cream through the middle.",
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
    alt: "A glass carafe and three cups of filter coffee arranged on a dark round table.",
    caption: "Three ways to taste the same coffee.",
    span: "standard",
    meta: "Filter",
  },
];

export const homeGalleryFrames = [
  galleryFrames[0],
  galleryFrames[3],
  galleryFrames[6],
  galleryFrames[9],
] as const;