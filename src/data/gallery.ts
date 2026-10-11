export type GalleryFrame = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  /**
   * Placement within the authored composition.
   *
   * `feature` — the one photograph the page is built around
   * `wide`    — a second full-measure frame
   * `tall`    — portrait, sets down the page
   * `inset`   — deliberately narrow, held against whitespace
   */
  readonly span: "feature" | "wide" | "tall" | "inset";
  readonly meta: string;
};

/**
 * The gallery set.
 *
 * Eight photographs, chosen because they are eight different subjects, and
 * ordered to match the composition the grid builds from them: featured frame,
 * then a portrait/landscape pair, then a ragged run of three, then a closing
 * pair. `audit:gallery` asserts the order still groups the way the grid expects,
 * because the grid destructures by position.
 *
 * An earlier set of eighteen was drawn from a pool in which six files were café
 * interiors — rattan chairs, hanging plants, glazed roofs, communal tables — so
 * the page read as one room photographed repeatedly, and every frame was large
 * enough that the repetition was the composition. It was also rendered three
 * times: the hero showed three of them as overlapping thumbnails, a pinned
 * contact-sheet band showed twelve, and the spreads below showed all eighteen
 * again. Nothing on the page was a surprise after the first viewport.
 *
 * Eight of the original eighteen were also menu or shop product photographs, so
 * a drink's product shot reappeared as "editorial work".
 *
 * Alt text describes what is actually in each photograph. It was written against
 * a contact sheet of the files, not inferred from the filename or copied from the
 * caption.
 */
export const galleryFrames: readonly GalleryFrame[] = [
  {
    id: "beans-falling",
    src: "/images/craft-beans.jpg",
    alt: "A white cup standing on a bed of coffee beans, with more beans falling into the frame against a black background.",
    caption: "Testing a roast, one bean at a time.",
    span: "feature",
    meta: "Roast",
  },
  {
    id: "rosetta",
    src: "/images/bar-macchiato.jpg",
    alt: "Cups of coffee with rosetta latte art on a table, framed by green sprigs.",
    caption: "Three ways to taste the same coffee.",
    span: "tall",
    meta: "Service",
  },
  {
    id: "bulb-bar",
    src: "/images/hero-counter.jpg",
    alt: "A dim bar lined with bottles beneath a dense row of hanging filament bulbs.",
    caption: "Nine in the evening, and nobody has turned the lights up.",
    span: "wide",
    meta: "Bar · Night",
  },
  {
    id: "steam-in-hand",
    src: "/images/hero-primary.jpg",
    alt: "A hand holding a white mug as a thick plume of steam rises through the light.",
    caption: "07:02 — first cup, before the shutters go up.",
    span: "inset",
    meta: "Morning",
  },
  {
    id: "portafilters",
    src: "/images/editorial-sign.jpg",
    alt: "Two portafilters and freshly ground coffee laid out on worn wooden boards, seen from above.",
    caption: "Three groups, calibrated every morning at seven.",
    span: "inset",
    meta: "Equipment",
  },
  {
    id: "chalkboard",
    src: "/images/space-menu.jpg",
    alt: "A chalkboard menu on a concrete wall, with bicycles parked beneath it.",
    caption: "Everything is priced on a card you can read standing up.",
    span: "inset",
    meta: "Frontage",
  },
  {
    id: "beans-hessian",
    src: "/images/bar-cortado.jpg",
    alt: "A white cup and saucer resting on hessian cloth with coffee beans scattered around it.",
    caption: "Roasted to first crack, plus ninety seconds.",
    span: "tall",
    meta: "Detail",
  },
  {
    id: "window-seat",
    src: "/images/space-window.jpg",
    alt: "A window-side table with a plant, printed matter and a half-drunk coffee.",
    caption: "Window seats go quiet after three.",
    span: "wide",
    meta: "Room · Afternoon",
  },
];