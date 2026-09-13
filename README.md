# Black Car Autókozmetika

Autókozmetikai szolgáltatás bemutató és időpontfoglaló oldala, Hatvan.

Next.js 15 (App Router), TypeScript strict, Tailwind, JSON adattár, JWT admin,
Docker. A projekt a [Claude Enterprise Framework](../../CEF/.claude/CLAUDE.md)
szabályai szerint épült.

---

## Mi van az oldalon

**Három nyilvános oldal:**

| Útvonal            | Mi van rajta |
| ------------------ | ------------ |
| `/`                | Nyitóképernyő szolgáltatásválasztóval, a munkamenet négy pontja, szolgáltatások, referencia-előzetes, GYIK, záró felhívás |
| `/szolgaltatasok`  | A három szolgáltatás tételes tartalma, méret szerinti árakkal, féléves és éves csomag, GYIK |
| `/referenciak`     | Az elvégzett munkák saját fotókkal, és hogy hogyan zajlik egy megrendelés |

**Ezeken kívül:**

- `/admin` — szerkesztői felület (elérhetőség, foglalás kapcsolója, beérkezett foglalások)
- `/jogi/[slug]` — foglalási feltételek, adatkezelési tájékoztató, impresszum
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/opengraph-image`, `/manifest.webmanifest`

---

## Indítás

```bash
npm install
cp .env.example .env      # majd töltsd ki — lásd lentebb
npm run dev
```

Az admin belépéshez két érték kell a `.env`-be:

```bash
npm run gen:secret
npm run gen:password -- "egy hosszú jelszó"
```

A részletes build-tudnivalók (és hogy **miért Turbopack**) a
[`docs/BUILD.md`](docs/BUILD.md) fájlban vannak.

---

## A foglalási rendszer

**Alapból ki van kapcsolva, és ez szándékos.** Amíg ki van kapcsolva:

- az oldalon **egyetlen űrlap sincs**, semmilyen személyes adatot nem veszünk át,
- a `POST /api/foglalas` végpont 404-et ad — a kapcsoló nemcsak a felületet
  tünteti el, hanem a bejáratot is,
- a jogi tájékoztatók elérhetők, de nem hivatkozik rájuk semmi, és `noindex`
  alatt állnak.

Bekapcsolás az adminban, egy kapcsolóval. Ekkor **egyszerre** jelenik meg a
foglalási szekció, a láblécben a három jogi dokumentum, és a sitemapbe is
bekerülnek. A három együtt jár: adatot kérni tájékoztatás nélkül jogszerűtlen.

Bekapcsolás **előtt** töltsd ki a cégadatokat a `.env`-ben. Ami kitöltetlen,
az `[szögletes zárójelben]` jelenik meg az oldalon — ez a védőháló, hogy ne
lehessen hiányos impresszummal élesíteni.

A foglalás **időpontkérés, nem visszaigazolás**: a rendszer rögzíti, a
tulajdonos telefonon egyeztet. Az oldal ezt ki is mondja az űrlapnál és a
sikerüzenetben.

---

## Szerkezet

```
app/
  (site)/          a nyilvános oldal (keret + három lap + jogi oldalak)
  admin/           belépés és szerkesztői panel
  api/             foglalás fogadása, admin végpontok
components/
  ui/              Button, Card, Container, Section, SectionHeading
  divider/         a három szekcióhatár
  sections/        újrahasznosítható szekciók (hero, árak, GYIK, foglalás…)
  site/            fejléc, lábléc, embléma, nyitó függöny
  motion/          a mozgásrendszer (boot, driver, reveal)
  admin/           a szerkesztői felület elemei
  works/           a referenciagaléria
lib/
  content/         MINDEN szöveg, ár és referencia — egyetlen forrás
  store/           JSON adattár (beállítások, foglalások)
  auth/            JWT, PBKDF2 jelszó, sebességkorlát, munkamenet
  seo/             metaadat és strukturált adat
  divider-path.ts  a szekcióhatárok geometriája
assets/            build időben importált képek (referenciafotók, háttérképek)
data/              futásidejű adat — Dockerben kötet
legacy/            a korábbi, kézzel írt oldal. Csak hivatkozási alap.
```

---

## Hol mit kell szerkeszteni

| Mit                                   | Hol |
| ------------------------------------- | --- |
| E-mail cím, telefonszám               | admin felület |
| Foglalás be/ki                        | admin felület |
| Cégadatok (székhely, adószám…)        | `.env` → újraindítás |
| Árak, szolgáltatások, csomagok        | `lib/content/pricing.ts` |
| Szövegek, GYIK, vonzáskörzet          | `lib/content/site.ts` |
| Referenciák és fotóik                 | `lib/content/works.ts` + `npm run images` |
| Jogi szövegek                         | `lib/content/legal-pages.ts` |

**Egy adatnak egy helye van.** Ha valamit két helyen írnál át, az hiba —
előbb-utóbb a kettő szétcsúszik, és senki nem tudja, melyik az igaz.

---

## Ellenőrzés

```bash
npm run verify
```

Típusellenőrzés, lint, formázás, tesztek és build — ez a kapu. Emellett:

```bash
npm run contrast
```

Megméri a paletta egymáson álló szín-párjait. A sötét felületeken a halvány
szöveg szabad szemmel észrevétlenül csúszik 4,5:1 alá.

Böngészőben nézd meg 360 / 768 / 1440 pixelen, csökkentett mozgással is, és
menj végig billentyűzettel a fejlécen, a szolgáltatásválasztón és — bekapcsolt
foglalás mellett — az űrlapon.

---

## Telepítés

```bash
docker compose up -d --build
```

A konténer a 3000-es porton figyel, a Traefik mögött. Részletek a
`docker-compose.yml` kommentjeiben.

Helyi próbához Traefik nélkül:

```bash
docker compose -f docker-compose.local.yml up --build
```

**A `blackcar_data` kötet nélkül minden deploynál elvész a beállítás és az
összes beérkezett foglalás.**

---

## Design

A paletta a márkanév: fekete. Három felület — obszidián, grafit, csont —,
egyetlen akcentus (sárgaréz), és minden felülethez **egy saját szekcióhatár**:

| Felület   | Határ     | Mi ez |
| --------- | --------- | ----- |
| obszidián | `chamfer` | megtört ferde vágás, mint a karosszéria válvonala |
| grafit    | `sweep`   | széles, elcsúsztatott ív: a polírozó útja |
| csont     | `terrace` | lépcsős perem, megmunkált lemezél |

A szabály egyetlen mondat: **a határ formáját az a felület adja, amelyikbe
érkezünk.** Ezért nem kell oldalanként eldönteni, melyik forma jön — elég a
szekciók sorrendje. Szomszédos szekció soha nem azonos felületű.

Részletek: [`docs/DESIGN.md`](docs/DESIGN.md).
