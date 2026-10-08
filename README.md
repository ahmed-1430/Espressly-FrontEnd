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
  components/   layout/  ui/  home/  menu/  shop/  gallery/  about/  contact/  motion/
  config/       brand, location, hours, social
  data/         menu, products, gallery, navigation
  hooks/        use-scrolled, use-media-query
  lib/          cn, form, gsap
  styles/       globals.css (tokens + motion vocabulary), fonts.ts
```

Content lives in `src/data` and `src/config`; components are about layout and
behaviour. There is no scattered hex value or repeated brand string in a
component — brand colour comes from CSS variables mapped into the Tailwind theme.

## Motion

Motion is a system rather than per-element improvisation.

- `Reveal` — intersection-driven fade-up, scale, slide and clip, with optional
  group stagger. Animates only opacity and transform.
- `SplitLines` — masked line-by-line type reveal, used for editorial headlines.
- `RevealImage` — clip reveal with optional GSAP scrubbed parallax.
- `Magnetic` — pointer attraction for primary controls.
- `Cursor` — a two-part custom cursor for pointer devices only.
- `SmoothScroll` — Lenis, driving `ScrollTrigger.update` from its own ticker.

GSAP handles the hero timeline, scroll parallax and any pinned work. CSS handles
everything else, which keeps the client bundle small and the motion off the main
thread.

Everything is disabled under `prefers-reduced-motion`, and smooth scroll is
skipped entirely for touch pointers, where native momentum is already tuned.

## Images

Photography is the design, so it is curated rather than sprinkled. Frames were
downloaded, reviewed as contact sheets, and assigned to roles by what they
actually depict. `scripts/download-images.cjs` is the manifest of record.

Frames carrying a third party's printed branding — a roaster's name on a bag, a
logo on a cup — were rejected. Products that could not be represented with an
honest image were cut from the catalogue rather than given a misleading one.

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

npm run verify:interactions   # overflow at 9 widths, menu, lightbox, forms
npm run verify:reveals        # no element left visually suppressed
npm run audit:assets          # transferred image bytes per route
```

The verification scripts need a served build (`npm run start`) and Puppeteer. They
exist because several defects here were invisible to review by reading the code:
`clip-path` collapses an element's intersection rectangle, so an
`IntersectionObserver` watching a clipped element can never fire; a Tailwind
arbitrary `clip-path` value did not survive class extraction, leaving the mobile
panel visible while nominally shut.

## Deploying

Built for Vercel with no configuration. `SITE_URL` should be set to the deployed
origin so canonical URLs, Open Graph tags and the sitemap are correct.