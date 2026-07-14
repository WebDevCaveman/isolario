# ISOLARIO

**A one-page landing site for a fictional ultra-luxury expedition watch.** Eighty-eight
pieces exist, each named for one of the 88 constellations. The site is not a shop — it is a
legend told to one person at a time: a quiet, dim "private cartography room" with no prices,
no urgency, and exactly one way in.

> *Not found on any map.*

**Live:** [isolario.vercel.app](https://isolario.vercel.app)

![ISOLARIO hero — the watch on dark rock beneath a field of stars](assets/hero-background-poster.webp)

*Concept / portfolio project. ISOLARIO is a fictional brand; the imagery is AI-generated.*

---

## The idea

A single scroll that crosses from dark to light and back to dark, telling the ISOLARIO
legend section by section. The whole page obeys one rule: **at most one attention moment per
viewport, and exactly one conversion point** — a quiet "Request a private viewing" that opens
an inline email field in place, never a button block or modal.

Two colours, two typefaces, nothing louder than the silence:

- **Deep Meridian** `#0E1B25` · **Aged Brass** `#B08D57` · Chart Ivory · Ink · Warm White
- **Cormorant Garamond** (headings) + **Inter** (body / labels)

## Sections

Hero · The Legend · The Instrument · The Terrains · The Eighty-Eight · A Day, Anywhere ·
Private Viewing · Footer.

## Built with

**Plain HTML, CSS, and JavaScript. No framework, no dependencies, no build step.** Open
`index.html` and it runs.

- Scroll reveals, nav theming, parallax, the pinned "terrains" stage, self-drawing compass
  rose and constellations — all vanilla `IntersectionObserver` + `requestAnimationFrame`.
- Fully responsive **320 – 2560 px**; `prefers-reduced-motion` and
  `prefers-reduced-transparency` honored (videos drop to posters, animations settle to their
  final state).
- Semantic HTML, one `<h1>`, alt text throughout, visible keyboard focus, WCAG AA contrast.
- **Optimized, self-hosted assets:** WebP imagery, compressed H.264 loops (≤ ~450 KB each,
  no audio), and subset WOFF2 fonts — full page ≈ 2.4 MB.

## Run it locally

Any static file server works — no tooling required:

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000
```

## Structure

```
index.html      # markup + inline starfield SVG
styles.css      # design tokens, all layout, responsive + reduced-motion
app.js          # scroll/nav/parallax/terrains/video/CTA behaviour
assets/         # webp images, mp4 loops, fonts (woff2) + fonts.css
```
