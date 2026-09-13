# Képek

Két, élesen elkülönülő csoport. A különbség nem technikai, hanem tartalmi, és
**nem szabad összekeverni őket**.

## `munkak/` — valódi munkafotók

A vállalkozás saját fotói az elvégzett munkákról. Ezek **tartalmi képek**:
leíró `alt` szöveggel jelennek meg, mellettük ott van, melyik autó, milyen
szolgáltatás és mennyiért. A referencia szekció és a `/referenciak` oldal
ezekből él.

A forrás a `legacy/images/munkaim/` mappa (3000×4000, 3–13 MB telefonos
felvételek). Az itteni változatokat a

```bash
npm run images
```

parancs állítja elő: hosszabb él 1600 px, minőség 80, EXIF tájolás beégetve.
A script idempotens, a meglévő, frissebb kimenetet nem írja újra.

## `stage/` — hangulati képek

Generált, sötét lakkfelületek és műhelyjelenetek. Ezek **díszítő képek**:
`alt=""` és `aria-hidden` attribútummal jelennek meg, és soha nincs melléjük
írva, hogy elvégzett munkát ábrázolnának — mert nem azt ábrázolnak.

| Fájl                | Hol jelenik meg |
| ------------------- | --------------- |
| `hero.jpg`          | a nyitóképernyő háttere |
| `hero-car.jpg`      | a nyitóképernyő jobb oldali panelje |
| `cta.jpg`           | a záró felhívás háttere |
| `szolgaltatasok.jpg`| a szolgáltatások oldal fejléce |
| `referenciak.jpg`   | a referenciák oldal fejléce |

**Egyik képen sincs gyártói embléma, rendszám vagy felirat.** A `hero-car.jpg`
eredetijén a generátor a hűtőrácsra rajzolt egy márkajelet; a bent lévő
változat ezért vágott — egy felismerhető gyártói jel egy szolgáltató oldalán
védjegykérdés, és azt sugallná, hogy a kép egy konkrét megrendelésről készült.

## Miért `assets/` és nem `public/`

Mindkét csoportra **statikus importtal** hivatkozunk
(`import kep from '@/assets/...'`). Így a Next build időben ismeri a méretarányt
— nincs elrendezés-ugrás —, és maga állítja elő a homályos helyőrzőt. Nincs
kézzel karbantartott méret- vagy blur-táblázat, ami elcsúszhatna a fájloktól.

A `public/` abban különbözik, hogy onnan a fájlok **stabil URL-en**
szolgálódnak ki — oda csak az kerül, amit kívülről, néven kell elérni
(`favicon.ico`).
