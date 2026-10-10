# Espressly

A premium café brand site. Next.js App Router, TypeScript, Tailwind v4, GSAP.

Six routes: `/`, `/menu`, `/shop`, `/gallery`, `/about`, `/contact`. All statically
prerendered.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm run start   # production
```

No environment variables are required. See `.env.example` for the optional
`SITE_URL` that sets the canonical origin.

## The brand

The supplied logo (`resource/expressly-logo.jpeg`) is the only original brand
asset. It is a flat JPEG on a flat background, so `scripts/build-logo-assets.cjs`
removes the background with an edge-seeded flood fill — not a global colour
threshold, which would have eaten the cream in the cup mark — crops to the
artwork bounds, and writes a transparent PNG.

`scripts/build-logo-variants.cjs` then produces two tonal knockouts so the
wordmark sits on both dark and light surfaces without a visible plate, plus the
app icons.

The palette is taken from the logo itself: espresso brown, the copper of the cup
mark, and a warm parchment. Glass is used only for navigation and the lightbox.

## Architecture

```
src/
  app/          routes, metadata, sitemap, generated OG image
  components/
    layout/     navbar, mobile navigation, footer, container
    hero/       hero atoms, choreography, five per-page compositions
    ui/         buttons, section headings, text links
    home/  menu/  shop/  gallery/  about/  contact/
    motion/     reveal, split lines, smooth scroll, progress, cursor
  config/       brand, location, hours, social
  data/         menu, products, gallery, navigation
  hooks/        use-scrolled, use-media-query
  lib/          cn, form, gsap, scroll
  styles/       globals.css (tokens + motion vocabulary), fonts.ts
```

Content lives in `src/data` and `src/config`; components are about layout and
behaviour. There is no scattered hex value or repeated brand string in a
component — brand colour comes from CSS variables mapped into the Tailwind theme.

## Heroes

Each inner route gets its own composition rather than a shared masthead. The
shared part is deliberately small:

- `hero/hero-atoms.tsx` — masked media frame with scrubbed parallax, metadata
  rail, eyebrow, scroll cue.
- `hero/hero-motion.tsx` — `HeroEntrance` runs one ordered timeline over
  elements tagged `data-hero-stage`, so a page declares the order it wants to
  arrive in. `HeroExit` handles the scroll-away parallax.

| Route   | Composition                                                          |
| ------- | -------------------------------------------------------------------- |
| Menu    | Oversized editorial type over the bar, category contents rail          |
| Shop    | Parchment atelier ground, offset product frames, catalogue labelling |
| Gallery | Exhibition wall — type set into the lower third of a single frame     |
| About   | Statement first, title alongside rather than above                    |
| Contact | The directory is the hero; nothing is deferred to a section below    |

They share a vocabulary, not a layout. The only parchment-toned hero is the shop,
which is what makes it feel like a different room in the same building.

## Motion

Motion is a system rather than per-element improvisation. The split is
deliberate: **GSAP** owns scroll-linked and cinematic work, **Motion** owns
component-level interaction and presence.

GSAP:

- `Reveal` — intersection-driven fade-up, scale, slide and clip, with optional
  group stagger. Animates only opacity and transform.
- `SplitLines` — masked line-by-line type reveal, used for editorial headlines.
- `RevealImage` — clip reveal with optional scrubbed parallax.
- Hero entrance and exit timelines, gallery reveal batches, reading progress.
- `SmoothScroll` — Lenis, driving `ScrollTrigger.update` from its own ticker.

Motion:

- Mobile navigation — `AnimatePresence` gives the panel true presence for its
  exit, which a class toggle cannot. Links stagger in and reverse out.
- The gallery viewer — directional cross-fade so stepping reads as movement
  rather than the same frame flickering.
- The category and navigation active indicators — one shared layout element each,
  so the mark travels between items instead of blinking.

`Magnetic` handles pointer attraction on primary controls and `Cursor` supplies a
two-part custom cursor for pointer devices only.

Two details worth knowing if you extend this:

- Mask reveals tween a registered `@property` custom property that a `clip-path`
  reads, rather than tweening `clip-path` directly. `clip-path` collapses an
  element's intersection rectangle, so an `IntersectionObserver` watching a
  clipped element can never fire — this is what deadlocked the first gallery.
- `HeroExit` uses an explicit `fromTo`, never a bare `to`. A `to` reads whatever
  the element's opacity happens to be when the tween is created, and this effect
  runs in the same commit as the entrance that has already set it to zero.

Everything is disabled under `prefers-reduced-motion`, and smooth scroll is
skipped entirely for touch pointers, where native momentum is already tuned.

## Images

Photography is the design, so it is curated rather than sprinkled. Frames were
downloaded, reviewed as contact sheets, and assigned to roles by what they
actually depict. `scripts/download-images.cjs` is the manifest of record.

Frames carrying a third party's printed branding — a roaster's name on a bag, a
logo on a cup — were rejected. Products that could not be represented with an
honest image were cut from the catalogue rather than given a misleading one.

Alt text was written against the photographs rather than the captions, and
`scripts/verify-gallery-alt.cjs` renders every gallery frame with its alt text so
the two can be compared side by side. That check caught two descriptions naming a
different photograph than the file they pointed at.

`scripts/check-assets.cjs` fails if code references a missing frame, and reports
frames nothing references.

## Forms

There is no backend. `src/lib/form.ts` models the full submit path — pending,
resolved, typed failure — and simulates the round trip. Both the contact form and
the newsletter say plainly that nothing was sent. Connecting a real endpoint means
replacing two functions in that file and nothing else.

## Verification

```bash
npm run lint
npm run typecheck
npm run build

npm run verify              # every browser harness below
npm run verify:interactions # overflow at 9 widths, menu, lightbox, forms
npm run verify:layout       # collapsed media, squeezed text, empty pages
npm run verify:reveals      # no element left visually suppressed
npm run verify:console      # console errors, heading order, alt coverage
npm run verify:motion       # nothing hidden under reduced motion
npm run verify:progress     # reading progress is at the top edge, not under the nav
npm run assets:check        # missing or orphaned image references
npm run assets:alt          # gallery alt text against the actual photographs
npm run audit:assets        # transferred image bytes per route
```

The verification scripts need a served build (`npm run start`) and Puppeteer. They
exist because several defects here were invisible to review by reading the code:

- `clip-path` collapses an element's intersection rectangle, so an
  `IntersectionObserver` watching a clipped element can never fire; a Tailwind
  arbitrary `clip-path` value did not survive class extraction, leaving the mobile
  panel visible while nominally shut.
- The gallery grid rendered nineteen frames as 86px slivers inside a 965px band.
  Nothing overflowed, no console error fired, and the DOM was correct — the images
  were simply zero pixels tall. `verify:layout` exists because of that class of
  bug: it measures rendered geometry rather than trusting the markup.
- Every hero photograph was invisible because the parallax wrapper was absolutely
  positioned with only vertical insets and so shrink-wrapped to zero width.

The harnesses also guard against testing the wrong thing. Scroll locking is
asserted with a real wheel gesture rather than `window.scrollBy`, because
`overflow: hidden` does not stop programmatic scrolling and asserting on it would
pass against a lock that did not work. The 404 route is checked for its status,
heading and links out instead of a clean console, since a missing route *should*
answer 404. And `verify:motion` skips `aria-hidden` elements, because the inactive
slides of a cross-fade are meant to be invisible.

## Deploying

Built for Vercel with no configuration. `SITE_URL` should be set to the deployed
origin so canonical URLs, Open Graph tags and the sitemap are correct.