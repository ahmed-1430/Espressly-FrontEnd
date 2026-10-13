export type GalleryFrame = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  readonly meta: string;
  /** Optional legacy field for compatibility with existing gallery layouts. */
  readonly span?: "feature" | "wide" | "tall" | "inset";
};

/**
 * Espressly gallery collection.
 *
 * Keep each image path unique and use concise editorial captions.
 * Verify the actual image contents before changing descriptive alt text.
 */
export const galleryFrames: readonly GalleryFrame[] = [
  {
    id: "beans-falling",
    src: "/images/craft-beans.jpg",
    alt: "A white cup surrounded by coffee beans against a dark background.",
    caption: "The art of the roast.",
    meta: "CRAFT",
    span: "feature",
  },
  {
    id: "rosetta",
    src: "/images/bar-macchiato.jpg",
    alt: "Coffee cups arranged on a table with green sprigs nearby.",
    caption: "Made for the moment.",
    meta: "SERVICE",
    span: "tall",
  },
  {
    id: "bulb-bar",
    src: "/images/hero-counter.jpg",
    alt: "A café bar illuminated by warm hanging lights.",
    caption: "After hours at the bar.",
    meta: "ATMOSPHERE",
    span: "wide",
  },
  {
    id: "steam-in-hand",
    src: "/images/hero-primary.jpg",
    alt: "A hand holding a white mug as steam rises into the light.",
    caption: "Before the day begins.",
    meta: "MORNING",
    span: "inset",
  },
  {
    id: "portafilters",
    src: "/images/editorial-sign.jpg",
    alt: "Coffee preparation tools and freshly ground coffee arranged on a wooden surface.",
    caption: "Precision in every detail.",
    meta: "EQUIPMENT",
    span: "inset",
  },
  {
    id: "chalkboard",
    src: "/images/space-menu.jpg",
    alt: "A café menu displayed against a concrete wall.",
    caption: "A menu made to explore.",
    meta: "THE MENU",
    span: "inset",
  },
  {
    id: "beans-hessian",
    src: "/images/bar-cortado.jpg",
    alt: "A cup and saucer arranged with coffee beans on a textured surface.",
    caption: "A closer look at the craft.",
    meta: "DETAIL",
    span: "tall",
  },
  {
    id: "window-seat",
    src: "/images/space-window.jpg",
    alt: "A window-side café table with a plant, printed matter, and coffee.",
    caption: "Stay a little longer.",
    meta: "THE SPACE",
    span: "wide",
  },
];
