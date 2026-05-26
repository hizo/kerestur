# CLAUDE.md — farmakerestur.sk

Guidance for Claude Code working in this repository. Keep it short. Update it when the project's working agreement changes — not as a substitute for the specs.

## Project summary

Redesign of **farmakerestur.sk**, a Slovak family ostrich farm in Križovany nad Dudváhom (~30 minutes from Bratislava). Marketing-first MVP: home, animal sections, gallery, contact, news. Static Astro site distributed via Cloudflare Pages. Slovak primary language. See `specs/00-project-overview.md` for the WHY.

## Current state

Pre-scaffold. The repo currently contains only `/specs/` and `existing-logo.png` — no `package.json`, no `src/`, no toolchain yet. The first implementation task will be scaffolding the Astro project per `specs/01-technical-spec.md`.

## Source of truth: `/specs/`

The numbered files in `/specs/` are canonical:

- `00-project-overview.md` — vision, audience, scope, success criteria, non-goals
- `01-technical-spec.md` — stack, routing/content model, performance budget, SEO, a11y baseline
- `02-architecture.md` — Mermaid diagrams for system, content flow, request flow, deployment
- `03-personas.md` — five personas (Mária, Tomáš, Anna, Mišo, Eva) and cross-persona implications
- `04-brand-strategy.md` — positioning, personality, voice, no-go zone, three visual directions

**Working rule:** before any non-trivial change, read the matching numbered spec. Decisions locked in the specs are not to be re-argued; the technical spec is explicit about this. If a decision genuinely changes, update the spec in the same change that implements it.

A more formal Spec-Driven Development workflow is planned. Until it lands, the numbered-file convention is the contract. Anticipated additions: `05-design-system.md`, `06-content-model.md`.

## Locked tech stack

| Layer | Choice |
|---|---|
| Framework | Astro 5.x |
| UI islands | React 19.x (only where interactivity is needed) |
| Styling | Tailwind CSS 4.x (CSS-first config with `@theme`) |
| Content | MDX + Astro Content Collections |
| Images | Astro Image (local, sharp at build) |
| Hosting | Cloudflare Pages with per-PR branch previews |
| Repo & CI | GitHub + GitHub Actions |
| Analytics | **Deferred to post-launch** (Plausible or Umami; no GA, no cookie banner ever) |
| Forms/email | Resend via Astro endpoint on Cloudflare Pages Function, with Cloudflare Turnstile |
| Future CMS | Keystatic (git-based, edits existing MDX) |
| Future eshop | Shopify Lite embed (phase 3) |

**Tooling:** Node 22 LTS, pnpm, TypeScript strict, Biome (lint+format), Vitest (unit), Playwright (1–2 E2E flows), lefthook (pre-commit).

Rationale for each choice is in the decision log of `specs/01-technical-spec.md`.

## Project structure (planned)

To be scaffolded. Target layout from `specs/01-technical-spec.md` §Routing & Content Model:

```
src/
├── content/      # MDX collections: aktuality, zvierata, stranky, galeria
├── pages/        # index, o-nas, zvierata/[slug], aktuality, galeria, kontakt, api/kontakt
├── components/   # Astro + React
├── layouts/      # Base, Page, Article
├── styles/       # global.css (Tailwind + @theme), tokens.css (semantic layer)
└── lib/          # utilities, schema markup helpers
```

Route slugs are Slovak (`o-nas`, `zvierata`, `aktuality`, `kontakt`) — matches user-facing language.

## Language conventions

- **Content / UI copy:** Slovak. Vykanie (formal "vy") with warmth, no anglicisms where a Slovak word exists. See the Áno / Skôr nie dictionary in `specs/04-brand-strategy.md` §3.
- **Code, identifiers, commit messages, internal docs:** English.
- **File and route slugs:** Slovak (matches the routing in the technical spec).

## Brand voice guardrails

Compressed from `specs/04-brand-strategy.md`. Read that file in full before writing any user-facing copy.

Personality anchors: **autentický, hrdý, hravý, prístupný, poctivý**. Every piece of copy should hit ≥3 of these.

We are **NOT**: a ZOO, a luxury food brand, an eco-warrior brand, retro/nostalgic, corporate, elitist, or generic. No "artisanal", "curated", "handcrafted", "terroir", "naša misia", "náš tím".

Existing tagline **„Šťastný pštros, dobrý pštros"** is preserved across any future rebrand.

Three visual directions (A — warm earthy / B — bold confident / C — playful natural) are sketched but **not yet validated with the farmers**. Treat the visual direction as open. Direction C is the author's current favorite; do not lock palettes, fonts, or illustration choices until the farmers have reacted to mockups (see `specs/04-brand-strategy.md` §10 Process Forward).

## Non-negotiable constraints

**Performance budget** (per `specs/01-technical-spec.md`)
- LCP < 2.0s on mobile
- Lighthouse Performance 95+, Accessibility 100
- First-load JS on homepage < 30 KB gzipped
- Total homepage weight < 500 KB with images

**Accessibility** (WCAG 2.1 AA)
- Semantic HTML5, ARIA only where HTML can't express it
- Focus visible everywhere, contrast 4.5:1 body / 3:1 large
- `prefers-reduced-motion` respected
- Body text ≥17px (Anna persona — older users)

**SEO**
- `lang="sk"` on `<html>`, Slovak content primary, EN deferred
- JSON-LD `LocalBusiness` + `Farm` on home, `Article` on news, `Place` for location
- Sitemap and canonical URLs on every page
- No Google Analytics, no cookies, no GDPR banner

**Forms**
- Astro endpoint → Zod validation → Resend, with Cloudflare Turnstile + honeypot + rate limit

**Design tokens** (two-layer)
- Primitive layer: raw OKLCH values
- Semantic layer: `--color-brand`, `--color-accent`, `--color-surface`, `--color-ink`, `--color-ink-muted`, `--color-border`
- Components reference **only** semantic tokens. Rebranding = edit `tokens.css`, not search/replace across components.

**Process**: build greyscale for the first 2–3 weeks; add color only after composition is fixed.

## Personas (one paragraph)

Optimize for five personas (full profiles in `specs/03-personas.md`): **Mária** (weekend mom from Bratislava), **Tomáš** (chef from Trnava, B2B), **Anna** (67yo loyalist, low tech comfort), **Mišo** (millennial foodie, social-driven), **Eva** (kindergarten teacher organizing school trips). Recurring rules across personas: phone number visible on every page, real photos not stock, no jargon / no English terms in UI, B2B and school paths must be distinct from the consumer path.

## Working agreement for Claude Code

- Read the relevant numbered spec before non-trivial work; cite it when explaining choices.
- Prefer editing existing files over adding new ones.
- Update the matching spec file in the same change when a decision shifts.
- Default to no code comments; only explain WHY when non-obvious.
- For UI work: start the dev server and verify in a browser before declaring done. Type checks and tests are not enough.
- For copy work: gut-check against the brand voice dictionary and the no-go zone before committing strings.
- Don't introduce experimental dependencies that contradict locked stack decisions without first updating `specs/01-technical-spec.md`.

## Open questions still on the table

Technical open questions from `01-technical-spec.md` were resolved and locked in the decision log there. What remains:

- **Visual direction:** A / B / C not yet validated with farmers (`specs/04-brand-strategy.md` §10).
- **Brand voice tone confirmation:** farmers prefer "hravý a rodinný" per user note in `specs/00-project-overview.md`; treat as confirmed but reconfirm during mockup review.
- **Future revisit triggers** (analytics activation, Cloudflare Images switch, EN/HU localization, custom vs Shopify eshop) — see `specs/01-technical-spec.md` §Revisit Triggers.
