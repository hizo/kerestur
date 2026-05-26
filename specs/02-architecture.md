# Architecture Diagrams — farmakerestur.sk

> Foundational document. Sets the HOW. Mermaid diagrams renderujú v GitHube aj v Markdown vieweroch.

## 1. System Architecture (high-level)

Statická aplikácia distribuovaná cez Cloudflare edge. Žiadna databáza vo fáze 1, žiadny vlastný backend okrem stateless funkcií pre formuláre.

```mermaid
graph LR
    Dev[Vývojár / Claude Code]
    Repo[GitHub Repo<br/>Astro + MDX]
    CI[GitHub Actions<br/>Build + Lint + Audit]
    CF[Cloudflare Pages<br/>Static Hosting]
    CDN[Cloudflare CDN<br/>Edge Network]
    User[Návštevník]
    Fn[Cloudflare Function<br/>/api/kontakt]
    Resend[Resend API]
    Email[Email farmárom]
    Plausible[Plausible Analytics]

    Dev -->|git push| Repo
    Repo -->|webhook| CI
    CI -->|deploy| CF
    CF --> CDN
    User -->|HTTP GET| CDN
    User -->|POST formulár| Fn
    Fn --> Resend
    Resend --> Email
    User -.->|pageview| Plausible

    style CF fill:#f48120,color:#fff
    style CDN fill:#f48120,color:#fff
    style Fn fill:#f48120,color:#fff
```

## 2. Content Authoring Flow (fáza 1 vs fáza 2)

Fáza 1: developer commituje MDX manuálne. Fáza 2: farmár používa Keystatic GUI.

```mermaid
graph TD
    subgraph "Fáza 1 — MDX-first"
        D1[Developer] -->|edit| MDX1[MDX súbory v repe]
        MDX1 -->|git commit + push| GH1[GitHub]
        GH1 -->|webhook| Build1[Astro Build]
        Build1 -->|deploy| Site1[farmakerestur.sk]
    end

    subgraph "Fáza 2 — Keystatic GUI"
        Farmer[Farmár] -->|edit cez GUI| KS[Keystatic UI]
        KS -->|GitHub OAuth| GH2[GitHub API]
        GH2 -->|commit/PR| MDX2[MDX súbory]
        MDX2 -->|webhook| Build2[Astro Build]
        Build2 -->|deploy| Site2[farmakerestur.sk]
    end

    style Farmer fill:#fbbf24,color:#000
    style KS fill:#3b82f6,color:#fff
```

## 3. Visitor Request Flow (sequence)

Typická návšteva — všetko statické, cached na edge.

```mermaid
sequenceDiagram
    participant U as Návštevník (mobil)
    participant DNS as Cloudflare DNS
    participant Edge as Cloudflare Edge (najbližší PoP)
    participant Cache as Edge Cache
    participant Origin as Pages Origin

    U->>DNS: GET farmakerestur.sk
    DNS-->>U: IP najbližšieho PoP
    U->>Edge: HTTPS GET /
    Edge->>Cache: Cache hit?
    
    alt Cache hit (väčšina prípadov)
        Cache-->>Edge: Cached HTML
        Edge-->>U: 200 OK (HTML)
    else Cache miss (prvý visitor po deploy)
        Edge->>Origin: Fetch
        Origin-->>Edge: HTML
        Edge->>Cache: Store
        Edge-->>U: 200 OK (HTML)
    end

    U->>Edge: GET /_astro/*.css, *.js
    Edge-->>U: Cached assets (immutable)
    U->>Edge: GET obrázky (avif/webp)
    Edge-->>U: Cached images
```

## 4. Contact Form Submission (sequence)

```mermaid
sequenceDiagram
    participant U as Návštevník
    participant Page as Astro stránka
    participant Fn as /api/kontakt<br/>(Cloudflare Function)
    participant TS as Cloudflare Turnstile
    participant Resend as Resend API
    participant Farm as Farmári

    U->>Page: Vyplní formulár
    Page->>TS: Validate captcha token
    TS-->>Page: OK
    Page->>Fn: POST { meno, email, sprava }
    Fn->>Fn: Zod validácia + rate limit
    Fn->>Resend: Send email
    Resend->>Farm: Email s detailmi
    Resend->>U: Auto-reply odosielateľovi
    Resend-->>Fn: 200 OK
    Fn-->>Page: { success: true }
    Page->>U: Zobraz potvrdenie
```

## 5. Future E-shop Flow (fáza 3, sequence)

Shopify embed handluje payment a inventory mimo nášho kódu.

```mermaid
sequenceDiagram
    participant U as Zákazník
    participant Astro as Astro stránka<br/>(produktová)
    participant SBB as Shopify Buy Button<br/>(React island)
    participant Shopify as Shopify Backend
    participant Stripe as Stripe Checkout
    participant Farm as Farmári

    U->>Astro: GET /shop/pstrosie-vajce
    Astro-->>U: HTML + SBB embed
    U->>SBB: Pridať do košíka
    SBB->>Shopify: Add to cart
    U->>SBB: Pokladňa
    SBB->>Shopify: Begin checkout
    Shopify->>Stripe: Redirect to payment
    U->>Stripe: Card details
    Stripe-->>Shopify: Payment success
    Shopify->>Farm: Webhook: nová objednávka
    Shopify->>U: Potvrdenie + faktúra
```

## 6. Deployment Pipeline

```mermaid
graph LR
    PR[Pull Request]
    Lint[Lint + Type Check]
    Build[Astro Build]
    Audit[web-quality-skills audit]
    Preview[Cloudflare Preview Deploy]
    Review[Manual Review]
    Main[Merge to main]
    Prod[Cloudflare Production Deploy]
    Invalidate[CDN Cache Invalidate]

    PR --> Lint
    Lint --> Build
    Build --> Audit
    Audit --> Preview
    Preview --> Review
    Review -->|approved| Main
    Main --> Prod
    Prod --> Invalidate

    style Audit fill:#10b981,color:#fff
    style Prod fill:#f48120,color:#fff
```

## Design Notes

- **Žiadne databázy v MVP** — všetko statické, žiadne dáta na serveri okrem ephemeral submit handlerov
- **Stateless funkcie len kde nutné** — kontakt formulár, prípadne v budúcnosti webhook receivery zo Shopify
- **Cache-first všade** — HTML, assety, obrázky, fonty
- **Žiadny third-party JS na blocking** — Plausible je defer, Shopify Buy Button lazy-load
- **Single failure domain** — celý stack stojí na Cloudflare. Risk akceptovaný (kvalita uptime), backup plán = static hosting kdekoľvek inde

## Future Considerations (out of MVP scope)

- **i18n** — Astro built-in routing pre SK/EN/HU keď príde čas
- **Edge personalisation** — Cloudflare Workers môžu robiť A/B test alebo geolocation-based content
- **Webhooks z farmy** — ak by bola IoT integrácia (kamery, váhy, atď.), Workers + Durable Objects
- **Newsletter** — Buttondown alebo Beehiiv ako standalone, alebo Resend Broadcast
