# Technical Specification — farmakerestur.sk

> Foundational document. Sets the WHAT. Decisions sú zámerne zafixované, aby ich AI agent ani my opakovane nereargumentovali.

## Stack Overview

| Layer | Choice | Verzia (2026) |
|---|---|---|
| Framework | **Astro** | 5.x |
| UI islands | **React** | 19.x |
| Styling | **Tailwind CSS** | 4.x (CSS-first config) |
| Content | **MDX** + Astro Content Collections | — |
| Images | **Astro Image** (lokálne, sharp pri builde) | built-in |
| Hosting | **Cloudflare Pages** + branch previews pre každý PR | — |
| Repo & CI | **GitHub** + GitHub Actions | — |
| Analytics | **Deferred do post-launchu** (Plausible alebo Umami) | — |
| Forms / email | **Resend** cez Astro endpoint na Cloudflare Pages Function | — |
| Future CMS | **Keystatic** (git-based) | — |
| Future eshop | **Shopify Lite** embed | — |

### Tooling & Workflow

| Vrstva | Voľba | Verzia (2026) |
|---|---|---|
| Runtime | **Node** | 22 LTS |
| Package manager | **pnpm** | 9.x |
| TypeScript | **strict mode** | 5.x (Astro starter default) |
| Lint + Format | **Biome** | 1.9+ |
| Unit testy | **Vitest** | 2.x |
| E2E testy | **Playwright** | 1.x |
| Git hooks | **lefthook** | latest |

## Stack Decisions (Decision Log)

### Prečo Astro a nie Next.js
Web je primárne obsahový/marketingový, statický build pokrýva 95% potrieb. Astro produkuje rýchlejší HTML s menšie JS payload, má prvotriedne content collections, jednoduchší deploy a nižšie operational complexity. React skúsenosti sa využijú v `client:*` islands tam, kde to dáva zmysel (galéria, formuláre).

### Prečo nie vinext
Cloudflare projekt je pôsobivý, ale **experimental v0.1.0, not affiliated with Vercel/Next team**. Pre projekt s 5+ ročným horizontom a netechnickými používateľmi je riziko vyššie ako prínos.

### Prečo Cloudflare Pages a nie Vercel/Netlify
Najlepšia free tier pre statické weby (unlimited bandwidth), CDN s európskymi PoP-mi (rýchlosť pre SK návštevnosť), čisté DX, jednoduché custom domény. Vercel by sme zvážili len pri prechode na Next.js v budúcnosti.

### Prečo Tailwind 4 (CSS-first) a nie 3
Native CSS premenné, `@theme` direktíva, OKLCH farby zabudované, menej buildtime mágie. Lepší fit pre dvojvrstvové tokeny (viď nižšie).

### Prečo Keystatic a nie Sanity/Contentful
Obsah ostáva v gite (verzionovanie zadarmo, žiadny vendor lock-in), nulové mesačné náklady, edituje priamo existujúce MDX súbory, čistá Astro integrácia. Sanity by sme zvážili len pri prerast > 100 obsahových entít.

### Prečo Shopify Lite a nie vlastný eshop
Pre 10–30 SKU od malej farmy je vlastný eshop ekonomický nezmysel. Shopify rieši inventory, dane, platby, faktúry, doručenie za $9/mes. Embed sa vloží do Astro stránky ako React island.

### Prečo Astro Image lokálne a nie Cloudflare Images
Vo fáze 1 sú obrázky commitnuté developerom (bounded count, < 100). Astro Image + sharp produkujú AVIF/WebP pri builde zadarmo, bez vendor dependency a bez mesačného poplatku. Cloudflare Images ($5/mes) zvážime až keď príde Keystatic a farmári budú nahrávať priamo — vtedy by sa build-time obrázkov stal úzkym hrdlom.

### Prečo Resend a nie Cloudflare Email Workers
3000 free emailov/mes pokryje desiatky kontakt-formulárov bohato. Čistá Astro integrácia, moderné DX, React Email templates pre konzistentný styling autoreply-ov. CF Email Workers sú primárne pre inbound routing — transactional outbound má slabší DX.

### Prečo defer analytics do post-launchu
Plausible aj Umami sa aktivujú pridaním jedného script tagu, bez architektonických zmien. Launchneme bez nich, doplníme keď príde reálna otázka na dáta („odkiaľ chodia návštevníci?", „ktorá stránka konvertuje?"). Šetrí $108/rok aj ops čas v MVP. Voľba (Plausible cloud vs Umami self-hosted) sa urobí v tom čase podľa ops kapacity.

### Prečo pnpm
Symlink-based store znižuje disk usage a urýchľuje instally. Lepšia podpora pre prípadný monorepo (`packages/`) v budúcnosti. Cloudflare Pages build natívne podporuje pnpm cez detekciu lock súboru.

### Prečo Biome a nie ESLint + Prettier
Jeden Rust binary nahrádza dva nástroje + ~10 pluginov. Rádovo rýchlejší (lint celého repa pod 1s vs ~5s s ESLint). Astro a React 19 podpora je v 2026 zrelá. Jedna `biome.json` konfigurácia, žiadny config-zoo. Minimum dependencies.

### Prečo Vitest + Playwright (lightweight)
Pre statický marketing web nemá zmysel testovať každý render. Vitest pokryje `lib/` — schema markup helpers, Zod validátory, slug utilities. Playwright spustí 1–2 E2E flows: homepage smoke + kontakt-formulár submit (s mock Resend). Žiadne snapshot testy, žiadny visual regression — overkill na ~10 stránok.

### Prečo lefthook a nie husky + lint-staged
Jediný YAML config, žiadne npm dependencies, paralelné spustenie hookov. Husky funguje, ale lefthook je menej friction pre solo dev a malý tím. Pre-commit: Biome check na staged files + tsc na zmenené súbory.

### Prečo branch previews na Cloudflare Pages
CF Pages generuje preview URL pre každý PR zadarmo. Kľúčové pre zdieľanie mockupov a draftov s farmármi a stakeholdermi („kliknite na link, povedzte čo si myslíte") bez deploy-u na hlavnú doménu. Nahrádza potrebu staging environmentu.

## Routing & Content Model

```
src/
├── content/
│   ├── config.ts                 # Zod schémy pre collections
│   ├── aktuality/                # MDX: novinky, oznamy
│   ├── zvierata/                 # MDX: pštros, kura, morka, králik, včely
│   ├── stranky/                  # MDX: O nás, Kontakt, Návšteva
│   └── galeria/                  # JSON manifesty albumov
├── pages/
│   ├── index.astro               # Domovská
│   ├── o-nas.astro
│   ├── zvierata/[slug].astro     # Dynamic z content collection
│   ├── aktuality/index.astro
│   ├── aktuality/[slug].astro
│   ├── galeria.astro
│   ├── kontakt.astro
│   ├── api/kontakt.ts            # POST endpoint pre formulár
│   ├── sitemap.xml.ts
│   └── robots.txt.ts
├── components/                   # Astro + React komponenty
├── layouts/                      # Base, Page, Article
├── styles/
│   ├── global.css                # Tailwind import + @theme tokeny
│   └── tokens.css                # Sémantická vrstva (--color-brand atď.)
└── lib/                          # Utility, schema markup, helpers
```

## Design System (zhrnutie, detaily v `05-design-system.md` ak vznikne)

Dvojvrstvová token architektúra v Tailwind 4 CSS-first config:

1. **Primitive tokens** — surové OKLCH hodnoty (Radix Colors alebo Open Props ako baseline)
2. **Semantic tokens** — `--color-brand`, `--color-accent`, `--color-surface`, `--color-ink`, `--color-ink-muted`, `--color-border`

Komponenty referujú výlučne sémantické tokeny. Rebranding = úprava `:root` v `tokens.css`, nie hľadanie/náhrada v komponentoch.

**Typografia:** jeden display font (kandidáti: Fraunces, Bricolage Grotesque, Recoleta) + jeden sans pre body (Inter alebo Geist). Fluid scale generovaný cez Utopia.fyi.

**Process:** stavať greyscale prvé 2–3 týždne, pridať farby až po fixácii kompozície.

## Performance Budget

| Metric | Cieľ |
|---|---|
| LCP (mobile) | < 2.0s |
| TTFB | < 200ms (Cloudflare edge) |
| Lighthouse Performance | 95+ |
| Lighthouse Accessibility | 100 |
| First-load JS (homepage) | < 30 KB gzipped |
| Total page weight (homepage) | < 500 KB s obrázkami |

Nasadenie audit cez `addyosmani/web-quality-skills` pred každým release.

## SEO & i18n

- **Slovenčina ako primárny jazyk**, `lang="sk"` na html
- **JSON-LD Schema.org**: `LocalBusiness` + `Farm` na homepage, `Article` na aktualitách, `Place` pre lokalitu
- **Open Graph** tags so správnymi obrázkami pre každú stránku
- **Sitemap.xml** generovaný z content collections
- **Robots.txt** povolí všetkých botov okrem dev preview
- **Canonical URLs** explicitne na každej stránke
- **EN verzia** odložená do fázy 2+ (Astro i18n routing keď príde dopyt)

## Forms & Email

Kontaktný formulár:
1. POST na `/api/kontakt` (Astro endpoint, beží ako Cloudflare Function)
2. Worker validuje (Zod), volá Resend API
3. Email farmárom + autoreply odosielateľovi
4. Honeypot + rate limit cez Cloudflare Turnstile

## Analytics

**Deferred do post-launchu.** Plausible aj Umami sa dajú aktivovať pridaním jedného script tagu, bez architektonických zmien. Bez analytics pri launchi šetríme čas aj poplatky.

Keď príde reálna otázka na dáta („odkiaľ chodia návštevníci?", „ktorá stránka konvertuje?"), aktivovať a trackovať: pageviews, outbound clicks (telefón, email), submit formulárov. Voľba v tom čase: Plausible cloud ($9/mes, fully managed) alebo self-hosted Umami na CF Workers (zadarmo, viac ops) — podľa ops kapacity v tom momente.

Žiadny GA, žiadne cookies, žiadny GDPR banner — ani teraz, ani neskôr.

## CI/CD & Deployment

- **PR → preview deploy:** každý PR generuje unikátnu URL na Cloudflare Pages pre review (zdieľateľný link s farmármi a stakeholdermi).
- **GitHub Actions na PR:** TypeScript typecheck, Biome lint+format, Vitest unit testy, Playwright smoke testy, Astro build, Lighthouse audit (cez `addyosmani/web-quality-skills`).
- **Pre-commit lokálne:** lefthook spustí Biome check + tsc na zmenené súbory pred commitom.
- **Merge to main → production deploy** na Cloudflare Pages s automatickou cache invalidation.
- **Žiadne staging environment** — preview deploys nahrádzajú staging pri MVP rozsahu.

## Accessibility Baseline

- WCAG 2.1 AA compliance
- Sémantické HTML5 (article, nav, main, header, footer)
- ARIA len kde HTML nestačí
- Kontrast 4.5:1 pre body text, 3:1 pre veľký text
- Focus visible everywhere
- Galéria má alt texty, formuláre majú labels
- `prefers-reduced-motion` rešpektovaný

## Revisit Triggers

Otvorené otázky boli zafixované v decision logu vyššie. Niektoré rozhodnutia ale dáva zmysel re-evaluovať keď nastane konkrétna udalosť:

- **Image pipeline → Cloudflare Images** — keď príde Keystatic vo fáze 2 a farmári začnú nahrávať obrázky priamo. Spúšťač: build-time nad 60s alebo viac ako 100 obrázkov v repe.
- **Analytics → zapnúť** — pri prvej konkrétnej otázke na dáta. Reálny horizont 1–3 mesiace po launchi.
- **Plausible vs Umami** — pri aktivácii analytics, podľa ops kapacity v tom čase.
- **EN / HU lokalizácia** — pri dopyte od B2B kontaktov mimo SK alebo turistov pri D1 (`00-project-overview.md` non-goals).
- **Vlastný e-shop vs Shopify Lite** — pri viac ako 30 SKU alebo špecifickej logistike (`00-project-overview.md` fáza 3).
- **Visual direction (A / B / C)** — po reakcii farmárov na hero mockupy (`04-brand-strategy.md` §10 Process Forward).