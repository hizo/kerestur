# Project Overview — farmakerestur.sk redesign

> Foundational document. Sets the WHY. Update when business assumptions change.

## Vision

Priviesť online prezentáciu Farmy Kerestúr na úroveň, ktorá zodpovedá kvalite samotnej farmy — autentickej rodinnej pštrosej farmy v Križovanoch nad Dudváhom. Web má byť **digitálnym ekvivalentom prechádzky po farme**: teplý, hrdý, dôveryhodný, a zároveň dnešný čo do rýchlosti, mobile UX a SEO.

## Problem Statement

Existujúci web (BaseKit šablóna, ~2017) má niekoľko obmedzení, ktoré reálne stoja farmárov zákazníkov:

- **Vyzerá staršie ako farma reálne je** — moderné rodiny a šéfkuchári z Bratislavy/Trnavy si vyberajú podľa prvého dojmu z webu
- **Slabé SEO** — keď niekto v Google hľadá „pštrosia farma Slovensko", „pštrosie vajcia Trnava", farma nie je v top výsledkoch
- **Mobile-prvý svet, mobile-druhá stránka** — väčšina návštevníkov ide z telefónu
- **Žiadna cesta k e-shopu** — predaj vajec, mäsa a doplnkov je dnes len cez telefón
- **Žiadna brand identita** — logo, paleta, typografia neexistujú ako systém
- **Nehybný obsah** — farmári nemajú jednoduchý spôsob ako pridať aktualitu („vyliahli sa mláďatá!")

## Target Audience

Päť hlavných segmentov (detaily v `03-personas.md`):

1. **Rodiny z Bratislavy a Trnavy** hľadajúce víkendový výlet a edukačný zážitok pre deti
2. **Šéfkuchári a gastro prevádzky** hľadajúci lokálnych premium dodávateľov (farm-to-table)
3. **Stredná a staršia generácia z okolia**, ktorí kupujú vajcia/mäso priamo z farmy
4. **Foodies a social media generácia**, pre ktorých je pštros zážitok hodný príbehu
5. **Školy a kolektívy** organizujúce skupinové návštevy

Sekundárne: turisti pri ceste D1, novinári o slovenskom farmárstve, agroturistické portály.

## Core Value Proposition

**„Jediná autentická pštrosia farma 30 minút od Bratislavy."**

Tri piliere, na ktorých web stojí:

- **Vzácnosť zážitku** — pštrosov v SR chová len pár farmárov, Kerestúr je z nich najbližšie k hlavnému mestu
- **Rodinný príbeh** — farma vedená rodinou od 2015, žiadny agrobiznis, žiadne fabrické chovy
- **Premium produkty s pôvodom** — vajcia, mäso, doplnky z hospodárstva, kde poznáš tvár farmára

## Project Scope

### Fáza 1 — Marketing web (MVP)
- Domovská stránka, O nás, sekcie pre jednotlivé zvieratá (pštrosy, sliepky, morky, králiky, včely), galéria, kontakt, aktuality
- Slovenčina primárne, anglická verzia odložená
- Statická generácia, obsah v MDX
- Kontaktný formulár + Google Mapa
- Schema.org LocalBusiness markup, OG karty, sitemap

### Fáza 2 — CMS + obsahový rast (3–6 mesiacov po MVP)
- Keystatic ako GUI nad existujúcimi MDX súbormi
- Aktuality publikované farmármi bez vývojárskeho zásahu
- Galéria s upload UI
- Newsletter signup (Buttondown alebo podobné)

### Fáza 3 — E-shop (12+ mesiacov, podľa dopytu)
- Shopify Lite embed pre 10–30 SKU (vajcia, mäso, koža, med, doplnky)
- Pickup z farmy + prípadne kuriérske doručenie
- Žiadny custom checkout, žiadne vlastné platby

## Success Criteria

Kvantitatívne (6 mesiacov po launch):
- Top 3 v Google pre „pštrosia farma Slovensko" a 2–3 ďalšie kľúčové frázy
- Lighthouse performance 95+ na mobile
- Mesačná organická návštevnosť aspoň 5× oproti starému webu
- Reálne kontakty (formuláre + telefón) merateľné a sledovateľné

Kvalitatívne:
- Farmári hovoria „toto vyzerá ako ja by som chcel aby ľudia farmu videli"
- Návštevníci po pristátí ostávajú aspoň 30 sekúnd a kliknú aspoň raz
- Šéfkuchári a B2B kontakty prichádzajú aj zo vzdialenejších oblastí

## Non-goals

Veci, ktoré web **explicitne nebude** robiť, aspoň v prvej fáze:

- Online rezervačný systém pre návštevy (telefón a email stačia)
- Custom e-shop (Shopify embed neskôr, žiadny vlastný)
- Komunitné funkcie, komentáre, fórum
- Viacjazyčný web hneď od začiatku (slovenčina prvá, EN/HU keď príde dopyt)
- Tracking cez Google Analytics (Plausible/Umami namiesto toho, žiadny cookie banner)
- Animované hero videá, parallax efekty a iné výkonové brzdy

## Open Questions

- Otázka pre farmárov: chcete byť na webe ako rodina (mená, fotky, tváre) alebo ako značka? - urcite chcem aby boli vidiet samotni farmari, s predstavenim a tak dalej, vid napr. https://www.instagram.com/p/DKJ80XNtmbm/
- Otázka pre farmárov: existuje brand voice, ktorý vám sedí? (Hrdý a vážny? Hravý a rodinný? Niečo medzi?) - skor hravy a rodinny
- Logo: máte niečo existujúce, alebo ideme od nuly? - existujuce logo najdes v ./existing-logo.png - ale nelimituj sa cierno bielou farbou, pouzil by som existujuce logo a neskor ked tak vymenime
- Doména: zostávame pri `farmakerestur.sk` alebo zvážime aj alternatívu? - zostavame
