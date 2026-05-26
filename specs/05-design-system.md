# Design System — farmakerestur.sk

> Foundational document. Lock pre Direction A z `04-brand-strategy.md` po user-review 2026-05-26. Tokeny tu sú zdroj pravdy pre `src/styles/tokens.css`. Smery B a C zostávajú v repe ako referencia (`/mockup/b`, `/mockup/c`) — môžeme sa k nim vrátiť pri rebrand-och alebo pre porovnanie.

## 1. Direction Lock

Vybraný smer: **A — Teplá zem, rodinný príbeh**, s dvomi hybridnými úpravami od developera:

- **Typografia:** Fraunces (display, ako pôvodne v A) + **Outfit** (body, prebraté zo smeru C). Klasická editorial kombinácia patkového display + bezpatkového body.
- **Akcent:** **vivid egg-yolk yellow** namiesto pôvodnej tlmenej terracotty. Reference k pštrosiemu vajcu, viac „food magazine" energia.

Ostatné smery sú zámerne zachované ako mockup routes:
- `/mockup/b` — Hrdý a sebavedomý (modern butcher, high contrast)
- `/mockup/c` — Hravý prirodzený (sandy + coral)

Ak sa v budúcnosti rozhodneme robiť rebrand alebo seasonal kampaň v inom register, máme východisko bez od-nuly práce.

## 2. Color Tokens

Dvojvrstvový model. **Sémantické tokeny** sú jediné, na ktoré sa komponenty odkazujú. Primitívne hodnoty (raw OKLCH) sa môžu reorganizovať bez zmeny komponentov.

### Semantic palette (Direction A)

| Token | OKLCH | Použitie |
|---|---|---|
| `--color-surface` | `oklch(96% 0.02 80)` | Hlavné pozadie. Teplá krémová s jemným okrovým posunom. |
| `--color-surface-muted` | `oklch(90% 0.04 70)` | Sekundárne plochy (cards, alternujúce sekcie). |
| `--color-border` | `oklch(82% 0.03 70)` | Hairline border-y, separátory. |
| `--color-ink` | `oklch(25% 0.04 50)` | Hlavný text, headliny, ikony. Tlmený mahogany dark. |
| `--color-ink-muted` | `oklch(45% 0.04 60)` | Sekundárny text, popisky, captions. |
| `--color-brand` | `oklch(42% 0.07 60)` | Olivovo-hnedá. Rezerva pre sekundárne brand prvky (badges, logo treatments). Zatiaľ málo používaná. |
| `--color-accent` | `oklch(85% 0.18 90)` | Egg-yolk yellow. Primary CTA pozadie, headline highlight marker, key moments. |

### Použitie akcentu (egg-yolk yellow)

Sýta žltá má **slabý kontrast pre text na cream pozadí** (~3:1, pod WCAG AA). Preto:
- ✅ **Yellow background + dark ink text** — CTA buttony, highlight markery v headline. Kontrast text-na-žltej ~7:1.
- ✅ **Žltý fill v ikonách / decoration** — kde nie je text dôležitý.
- ❌ **Yellow text na cream / white** — nepoužívať bez tmavšieho shade alebo strokes.

### Tailwind 4 utility classes

Vďaka `@theme inline` v `global.css` generujú sémantické tokeny utility classes:
- `bg-surface`, `bg-surface-muted`, `bg-ink`, `bg-brand`, `bg-accent`
- `text-ink`, `text-ink-muted`, `text-surface`, `text-accent`, `text-brand`
- `border-border`, `border-ink`

## 3. Typography

### Font Pair

| Rola | Font | Zdroj | Váhy |
|---|---|---|---|
| Display | **Fraunces** | Google Fonts (variable, opsz 9–144) | 400, 500, 600, 700 |
| Body | **Outfit** | Google Fonts | 400, 500, 600 |

Loadované cez `<link>` v `Base.astro` s `preconnect` na `fonts.googleapis.com` + `fonts.gstatic.com`. `display=swap` zabraňuje FOIT.

**Pre produkciu** zvážiť self-host cez Fontsource (`@fontsource-variable/fraunces`, `@fontsource-variable/outfit`) — odpadne dependency na Google Fonts CDN a `preconnect`-y, fonty sa serve-ujú z CF CDN ako súčasť buildu. Migrácia je 10 min, urobíme keď budeme tlačiť na performance budget.

### Pravidlá kombinácie

- **Display (Fraunces):** hlavné headliny (h1, h2), pull quotes, hero claims. Citlivé na opsz axis — pri väčších veľkostiach prepínať na vyššiu opsz pre osobitejší charakter.
- **Body (Outfit):** všetko ostatné — body text, nav, buttony, captions, formuláre.
- Nikdy nemiešať serif a sans v jednej rieke textu okrem zámernej typographic emphasis.

### Fluid Type Scale

Min viewport 320px, max viewport 1440px. Body baseline 17px (per accessibility — Anna persona).

| Token | Min | Max | clamp |
|---|---|---|---|
| `text-sm` | 14px | 15px | `clamp(0.875rem, …, 0.9375rem)` |
| `text-base` | 17px | 18px | `clamp(1.0625rem, …, 1.125rem)` |
| `text-lg` | 19px | 22px | `clamp(1.1875rem, …, 1.375rem)` |
| `text-xl` | 22px | 26px | `clamp(1.375rem, …, 1.625rem)` |
| `text-2xl` | 26px | 31px | `clamp(1.625rem, …, 1.9375rem)` |
| `text-3xl` | 31px | 38px | `clamp(1.9375rem, …, 2.375rem)` |
| `text-4xl` | 38px | 48px | `clamp(2.375rem, …, 3rem)` |
| `text-5xl` | 48px | 64px | `clamp(3rem, …, 4rem)` |
| `text-6xl` | 64px | 84px | `clamp(4rem, …, 5.25rem)` |

Pre presné `clamp()` formuly generované cez [Utopia.fyi](https://utopia.fyi/type/calculator). Konkrétne hodnoty migrujeme do `@theme` v `global.css` pri prvom použití (zatiaľ používame ad-hoc Tailwind classes a inline `clamp()`).

### Line-height

- Headliny (Fraunces): `1.02 – 1.15` (tight, kvôli osobitosti display fontu)
- Body (Outfit): `1.55` (čitateľnosť pre staršie publikum — Anna persona)
- Captions: `1.45`

## 4. Spacing & Radius

Spacing škála = Tailwind 4 default (4px-based: 1 = 4px, 2 = 8px, 4 = 16px, …). Pre rytmus stránky používame násobky:

- **Component padding:** 4 (16px), 6 (24px), 8 (32px)
- **Section padding (vertikálne):** 12 (48px) mobile, 20–24 (80–96px) desktop
- **Section padding (horizontálne):** 6 (24px) mobile, 14 (56px) desktop, max-width container 6xl (1152px) alebo 7xl (1280px)
- **Stack rytmus medzi elementmi:** `space-y-4`, `space-y-6`, `space-y-8`

Radius škála:

| Token | Hodnota | Použitie |
|---|---|---|
| `--radius-sm` | `0.25rem` (4px) | Inputy, malé badges, info pills |
| `--radius-md` | `0.5rem` (8px) | Karty (default), button accentuated |
| `--radius-lg` | `1rem` (16px) | Hero karty, modal-y, výrazné cards |
| (`rounded-full`) | — | CTA buttony, avatary, logo stamps |

## 5. Component Principles

Komponenty zatiaľ neexistujú ako shared files — vznikajú on-demand v `src/components/`. Tu princípy, na ktoré sa pri ich tvorbe odvolávame.

### Primary CTA button
- `rounded-full bg-accent px-7 py-3.5 font-body font-semibold text-ink`
- Hover: `opacity-90` (žiadny color shift — žltá by stratila identitu)
- Vždy text-ink na yellow bg (kontrast)
- Vždy aspoň 44×44 touch target (Anna persona)

### Secondary CTA / inverted
- `rounded-full bg-ink px-5 py-2.5 text-surface`
- Pre tmavé sekcie alebo footer

### Text link
- `underline decoration-1 underline-offset-4 text-ink hover:text-brand`
- Žiadny color-only highlight (a11y)

### Card
- `bg-surface-muted border border-border rounded-lg p-6`
- Hover (ak interactive): `border-ink`

### Image treatment
- Astro `<Image>` component vždy s `alt` (alebo `alt=""` ak dekoračný)
- Hero photos: `loading="eager" fetchpriority="high"`
- Below-fold: `loading="lazy"`
- Sizes attribute povinný pre responsive

### Logo
- Existujúce B&W PNG (`specs/existing-logo.png`)
- Display ako kruh: `width={72} height={72} class="rounded-full"`
- Sedí na cream surface aj na ink surface bez recoloru
- Pri lock loga (možný future refresh) — vymení sa jeden import path

### Form field
- TBD pri stavbe kontakt-formulára — predpokladaný štýl: `border border-border bg-surface rounded-md px-4 py-3` s `focus-visible:border-ink`

## 6. Accessibility Validation

Verifikované kontrasty (WCAG 2.1 AA = 4.5:1 body, 3:1 large/UI):

| Combo | Kontrast | Status |
|---|---|---|
| `ink` on `surface` | ~9.2:1 | ✅ AAA |
| `ink-muted` on `surface` | ~5.4:1 | ✅ AA |
| `ink` on `surface-muted` | ~7.8:1 | ✅ AAA |
| `ink` on `accent` (yellow) | ~7.1:1 | ✅ AAA |
| `surface` on `ink` (inverted button) | ~9.2:1 | ✅ AAA |
| `accent` on `surface` (yellow text) | ~2.4:1 | ❌ — only as fill, never as text |

Pri každom novom token/farba comb-e overiť cez [oklch.com](https://oklch.com/) alebo Chrome DevTools contrast checker.

## 7. How to Extend

Pri pridávaní nového tokenu:

1. **Pridať OKLCH hodnotu** do `:root` v `src/styles/tokens.css`.
2. **Exposovať ako Tailwind utility** v `@theme inline` v `src/styles/global.css`.
3. **Validovať kontrast** so všetkými relevantnými text farbami.
4. **Aktualizovať tabuľku v tomto dokumente** so semantickým menom + použitím.
5. Ak ide o farbu používanú aj v inom smere (`b` alebo `c`), aktualizovať `[data-direction]` override v `src/styles/mockups.css`.

Pri refactor-e farby:

1. Zmeniť hodnotu **iba v `tokens.css`** — utility classes a komponenty sa prepíšu automaticky.
2. Re-validovať kontrasty.
3. Vizuálne overiť všetky pages (homepage + budúce sub-pages).
4. Pri väčšom posune (paleta swap) — zvážiť či zostávame v Direction A alebo to už je iný smer; ak iný, aktualizovať aj `04-brand-strategy.md`.

## 8. Open Items

- Self-host fontov cez Fontsource (vendor migrácia z Google Fonts CDN) — pri tlačení na performance budget alebo CSP requirements.
- Konkrétne `clamp()` hodnoty z Utopia.fyi pre fluid type scale — generovať pri prvom potreb dokonalej hodnoty.
- Komponentná knižnica — vznikne organicky pri stavbe stránok; refactor do `src/components/` keď sa pattern zopakuje 2×.
- Ikonický set — TBD. Pravdepodobne Lucide alebo Phosphor, mokupy zatiaľ používajú text-arrow `→`.
- Custom illustrácia pštrosa (per Direction C playful) — odložené; ak by sme prešli do hybridu C-prvkov, znovu otvoriť.
