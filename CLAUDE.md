# Black Car Autókozmetika — munkautasítás

Next.js 15 App Router, TypeScript strict, Tailwind, JSON adattár, JWT admin.
A projekt a Claude Enterprise Framework (`F:/Klivo/CEF/.claude/`) szabályai
szerint épült.

**Olvasd el munka előtt:** [`docs/DESIGN.md`](docs/DESIGN.md) (a design rendszer
és a szekcióhatárok), [`docs/BUILD.md`](docs/BUILD.md) (miért Turbopack),
[`README.md`](README.md) (szerkezet, parancsok).

## Nem megkerülhető szabályok

1. **Három felület van, és nincs negyedik.** Obszidián, grafit, csont. Nincs
   színátmenet dekorációként, és nincs második akcentus a sárgaréz mellett.
   Mindkettőt azzal tartjuk be, hogy nem is létezik hozzájuk token.
2. **A szekcióhatár formáját az érkező felület adja.** Szomszédos szekció nem
   lehet azonos felületű, és kapcsolható szekció nem dönthet a saját
   láthatóságáról — azt az oldal dönti el, mert onnan következik a következő
   szekció `from` értéke is.
3. **Nincs „szemöldök"** — a címsorok fölötti apró, csupa nagybetűs címke.
4. **Nincs kitalált tartalom.** Se referencia, se vélemény, se szám. Ahol a
   vállalkozás nem mondott ki árat (teljes takarítás, méret szerint), ott nincs
   becsült táblázat sem: a sáv marad, és az oldal kiírja, mitől függ az ár.
5. **Egy adatnak egy helye van.** Elérhetőség → admin. Cégadat → `.env`. Ár →
   `lib/content/pricing.ts`. Szöveg → `lib/content/site.ts`. Referencia →
   `lib/content/works.ts`. Ezt ne duplázd.
6. **Animálni csak `transform`-ot és `opacity`-t szabad.** A kivétel a GYIK
   lenyílója, és az meg van indokolva a `globals.css`-ben.
7. **A foglalás kapcsolója a bejáratot is zárja**, nem csak a felületet: a
   `POST /api/foglalas` kikapcsolt állapotban 404. Ha valaha új, adatot fogadó
   végpont kerül az oldalra, annak is ellenőriznie kell a kapcsolót.
8. **A jogi tájékoztatók a foglalással együtt jelennek meg.** A kettő nem
   választható szét: adatot kérni tájékoztatás nélkül jogszerűtlen.
9. **Minden szekciócím balra igazított.**
10. **Mérd a kontrasztot:** `npm run contrast`. A sötét felületeken a világos
    szöveg gyorsan 4,5:1 alá esik, és ez szabad szemmel nem látszik.
11. **Betűméret csak a skáláról.** Ha bővíted a `tailwind.config.ts` `fontSize`
    kulcsait, bővítsd a `lib/cn.ts` listáját is — különben a `tailwind-merge`
    némán eldobja a méretet.
12. **`npm run verify` a kapu.** Típus + lint + formázás + teszt + build.

## A telepítés névkonvenciója

A tárhelyplatform (`F:/Klivo/webhosting/docker-web-1`) a `docker-compose.yml`
minden nevét az **ügyfél azonosítójából** számolja. Az azonosító a platform
könyvtárszerkezetéből jön — `/app/clients/{ügyfél}/sites/{oldal}/` —, ennél a
projektnél **`blackcar60`**, a domain alapján. Nem „blackcar".

| Mi                | Alak                    | Itt                      | Forrás a platformban |
| ----------------- | ----------------------- | ------------------------ | -------------------- |
| hálózat           | `client_{ügyfél}_net`   | `client_blackcar60_net`  | `services/docker.ts` |
| konténernév       | `hosting_{ügyfél}_web`  | `hosting_blackcar60_web` | `types.ts` — `containerNameForSite` |
| szolgáltatásnév   | = konténernév           | `hosting_blackcar60_web` | `services/template.ts` |

A kettő közül **csak a hálózatot ellenőrzi a validátor** — rossz néven a deploy
azonnal elbukik, érthető hibaüzenettel. A konténernév viszont némán romlik el:
a build lefut, a konténer elindul, a Traefik pedig egy nem létező névre
irányít, és a látogató 502-t kap. Ezért mind a hármat egyszerre kell írni.

A compose fájl a platform saját validátorával ellenőrizhető:

```bash
cd F:/Klivo/webhosting/docker-web-1/api && node_modules/.bin/tsx <(cat <<'EOF'
import { validateComposeFile } from 'F:/Klivo/webhosting/docker-web-1/api/src/services/composeValidator';
const r = validateComposeFile('F:/Klivo/! PROJEKTEK/BlackCar/docker-compose.yml', {
  allowedNetworks: ['client_blackcar60_net'],
});
console.log(r.valid ? 'ELFOGADVA' : 'ELUTASITVA:\n' + r.errors.join('\n'));
EOF
)
```

**A panelben a `container_port` legyen 3000.** Az alapértelmezés 80, és a
Traefik abból építi a cél URL-t — rossz értéken minden más stimmel, a látogató
mégis 502-t kap.

## Csapdák, amikbe már beleszaladtunk

- **A webpack nem tud buildelni ebből a mappából.** A `! PROJEKTEK` útvonal
  felkiáltójele a webpack loader-szintaxisában foglalt karakter, és a build el
  sem indul tőle. Ezért fut a `dev` és a `build` is `--turbopack`-kel, és ezért
  fut Turbopackkel a Docker build is: két bundler két kimenetet jelentene.
- **A `.env`-ből jövő adat futásidejű adat.** A `.env` nincs a Docker build
  kontextusában, tehát build időben renderelve a helyőrzők égnének bele a
  HTML-be. A nyilvános keret ezért `force-dynamic`. Figyelem: a keret
  beállítását a `generateStaticParams` **felülírja** — ezért nincs a jogi
  oldalakon.
- **A `sitemap.ts` is `force-dynamic`.** A jogi oldalak a foglalás
  kapcsolójától függően kerülnek bele; statikusan generálva a build
  pillanatának állapota égne be, és a bekapcsolás után is a régi lista menne ki.
- **A gyorsítótár-kulcs része a fájl ujjlenyomata** (`createDocument().fingerprint()`).
  Az `unstable_cache` a `.next/cache`-be ír, ami két build között megmarad, a
  JSON fájl viszont a Next tudta nélkül változik. Új tárolónál ezt ne hagyd ki —
  a hiba néma: a build sikeres, az oldal hiánytalan, csak elavult.
- **Az `ADMIN_PASSWORD_HASH` elválasztója pont, nem dollárjel.** A dotenv a
  `$210000`-t változó hivatkozásként értelmezné és kifejtené, némán elrontva a
  hash-t — és a hibaüzenet a rossz helyre mutatna.
- **A munkamenet süti neve a kérés protokolljától függ**, nem a `NODE_ENV`-től.
  A `__Host-` előtag HTTPS nélkül némán eldobatja a sütit a böngészővel: a
  felhasználó helyes jelszóval, 200-as válasszal is a belépő oldalon kötne ki.
- **Kliens komponens nem importálhat a tárolóból.** A tároló `revalidateTag`-et
  húz be, ami csak szerveren létezik, és a build elszáll tőle. Ami a
  szerkesztő felületnek is kell (pl. `SiteSettings`, `validateSettings`), az
  `lib/content/` alá megy.
- **A `tailwind-merge` csak azonos variánsú osztályt ejt ki.** A `p-0` az alap
  `p-6`-ot leüti, a `sm:p-8`-at nem. Ezért van a `Card`-on `flush` kapcsoló.
- **A Vitest nem olvassa a `tsconfig` `paths` mezőjét**, és a `.jpg` importot
  sem érti. Mindkettőre alias van a `vitest.config.ts`-ben; a képminta a
  **teljes** modulazonosítóra illeszkedik, mert a Vite az illeszkedő részletet
  cseréli le.
- **Ne buildelj futó szerver mellé.** A `next build` felülírja a `.next`-et a
  futó `next start` alól: a kiszolgált HTML régi chunkokra hivatkozik, azok
  400-at adnak, és a lap stílus nélkül jelenik meg.

## Ellenőrzés

```bash
npm run verify
```

```bash
npm run contrast
```

Böngészőben ellenőrizd: 360 / 768 / 1440 px, csökkentett mozgással is, és
billentyűzettel végig a fejlécen, a szolgáltatásválasztón és az űrlapon.
