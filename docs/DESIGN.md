# Design rendszer

A döntések, és ami miatt így dőltek el. Ha valamit meg akarsz változtatni,
előbb itt nézd meg, miért van úgy — a legtöbb szabály egy konkrét hibából
származik.

---

## 1. A paletta

A márkanév fekete, tehát a paletta is az. **Három felület**, és ez a teljes
készlet:

| Token      | Érték     | Hol |
| ---------- | --------- | --- |
| `obsidian` | `#0A0A0B` | nyitóképernyő, aloldal-fejléc, záró felhívás, lábléc |
| `graphite` | `#141417` | sötét tartalmi szekciók |
| `bone`     | `#F2F0EC` | világos, olvasnivalónak való szekciók |

Ezeken belül **kiemelt felület** a kártyáknak: `slate` (`#1C1C21`) sötéten,
`paper` (fehér) világoson.

**Egyetlen akcentus van: a sárgaréz.** Két tónusban, mert ugyanaz a szín a
világos felületen 2,1:1 lenne:

- `brass` (`#C8A253`) — sötét felületen (8,2:1 obszidiánon)
- `brass-deep` (`#7A5B1E`) — világos felületen (5,5:1 csonton)

**Nincs színátmenet dekorációként**, és nincs második akcentus. Nem azért, mert
csúnya lenne, hanem mert nincs hozzá token: amihez nincs név, azt nem lehet
véletlenül használni. A két kivétel — a nyitóképernyő sötétítése és a fotók
alján a felirat mögötti sötétítés — nem díszítés, hanem a szöveg
kontrasztjának garanciája egy olyan kép fölött, aminek a világosságát nem mi
szabjuk meg.

### Kontraszt

```bash
npm run contrast
```

Huszonegy, ténylegesen egymáson álló párt mér. Nem a paletta összes
kombinációját: azt mérjük, ami az oldalon előfordul. A sötét felületeken a
halvány szöveg **szabad szemmel észrevétlenül** csúszik 4,5:1 alá — ezért van
mérés, nem szemrevételezés.

---

## 2. A szekcióhatárok

Ez az oldal formanyelve. Három felület, és **mindegyikhez egy saját határ**
tartozik:

| Érkezünk ide | Forma     | Mi ez |
| ------------ | --------- | ----- |
| `obsidian`   | `chamfer` | megtört ferde vágás — a karosszéria válvonala |
| `graphite`   | `sweep`   | széles, elcsúsztatott ív — a polírozó egy áthúzása |
| `bone`       | `terrace` | lépcsős perem — megmunkált lemezél |

**A szabály:** a határ formáját az a felület adja, amelyikbe *érkezünk*. A sáv
felső színe a fölötte lévő szekcióé (`from`), a rajzolt alakzat az alattié. Így
oldalanként csak a szekciók **sorrendjét** kell helyesen megadni; a határok
maguktól következnek.

Ebből két dolog következik, és mindkettő betartandó:

1. **Szomszédos szekció nem lehet azonos felületű.** Akkor a határ önmagába
   rajzolna, és láthatatlan sávként csak helyet foglalna.
2. **Kapcsolható szekció nem döntheti el magáról, hogy megjelenik-e.** Minden
   szekció a *fölötte* lévő felületről érkezik; ha egy szekció maga döntene a
   láthatóságáról, az alatta lévő rossz színről indítaná a sávját, és látható
   varrás maradna. A döntést az oldal hozza meg (`app/(site)/page.tsx`), és
   ugyanott dől el a következő szekció `from` értéke is.

Az útvonalakat a `lib/divider-path.ts` **számolja**, nem kézzel írt `d`
attribútumokból másoljuk. Egy kézzel írt görbe minden módosításnál
újrarajzolandó, és nem lehet megmondani róla, miért pont ott van a töréspont.

### Amin egyszer már elbuktunk

A `bone` határ **első változata huszonhat vékony lamella** volt (hűtőrács).
Elméletben szép: az autó formanyelvéből jön, és mind a három forma
„megmunkált fém". A gyakorlatban teljes lapszélességen **vonalkóddá esett
szét** — zaj lett ott, ahol határnak kellett volna lennie. A mostani öt
lépcsős perem ugyanazt mondja, csak halkan.

Tanulság: egy elválasztónak 1440 pixel szélességben is **egyetlen formának**
kell látszania, nem sok apró elem sorozatának.

---

## 3. Tipográfia

- **Display: Oswald.** Az embléma felirata Haettenschweilerrel készült — egy
  nagyon keskeny, nehéz groteszkkel. Ez a márka meglévő hangja, tehát a
  címsorok is ezt folytatják; az Oswald ennek a szabadon elérhető, latin-ext
  karakterkészletű megfelelője.
- **Szöveg: Inter.** A keskeny, nehéz betű hosszabb szövegben olvashatatlan.
  A kontraszt a kettő között maga a tipográfiai rendszer.

**Betűméret csak a skáláról.** Ha bővíted a `tailwind.config.ts` `fontSize`
kulcsait, bővítsd a `lib/cn.ts` listáját is — különben a `tailwind-merge` a
saját nevű méretosztályt *szövegszínnek* nézi, és egy `cn('text-h3',
'text-ink')` hívásban némán eldobja a méretet. A hiba nem ad figyelmeztetést:
a címsor egyszerűen akkora lesz, mint a folyószöveg.

A nagy fokozatok `clamp`-pel folyékonyak. Fix méreten a hosszú magyar szavak
(„autókozmetika", „időpontfoglalás") 360 pixeles nézeten kilógnának, és ezt
semmilyen sortörés nem javítja: egy szó nem tud elférni.

**Minden szekciócím balra igazított.** Középre zárt címsor kitör az oldal
ritmusából, és hosszú magyar szavaknál rongyos tömböt ad.

**Nincs „szemöldök"** — a címsorok fölötti apró, csupa nagybetűs címke. A
hierarchiát a méret, a szín és a térköz adja; egy szemöldök csak megismételné a
címsort kisebben.

---

## 4. Mozgás

Két szabály köti az egészet:

1. **Csak `transform` és `opacity` animálódik.** Ezeket a compositor kezeli,
   tehát nem indítanak elrendezés-újraszámolást. A kivétel a GYIK lenyílója
   (`::details-content` magassága), és az ott meg van indokolva.
2. **Minden mozgás alapállapota a látható tartalom.** A megjelenést a
   `data-motion="ready"` jelző kapcsolja be, amit a `MotionBoot` tesz ki az
   első festés előtt. Kikapcsolt JavaScript vagy hibás betöltés esetén így nem
   tűnhet el a szöveg.

**Egyetlen vezérlő** van (`components/motion/motion-driver.tsx`): egy
`IntersectionObserver` az összes megjelenő elemre, és egy `pointermove` figyelő
a fénykövető felületekre. Húsz kártya nem hoz létre húsz figyelőt.

**A mutatókövetés közvetlenül az elemek stílusát írja**, nem a `<html>` egy CSS
változóját. A gyökéren megváltozó egyedi tulajdonság az egész dokumentumra
újraszámoltatja a stílust, méghozzá minden képkockán — ettől akad a felület.

**Csökkentett mozgás esetén nincs mozgás**, nem „lassabb mozgás": a `MotionBoot`
ki sem teszi a jelzőket, a CSS pedig a maradékot is elnémítja, beleértve a
`scroll-behavior: smooth`-t.

### A nyitó függöny

Összesen **2,6 másodperc**, ebből az utolsó 0,7 a felhúzás. A határ három
másodperc, és a bevezető nem nyúlhat odáig: az első látogatás első
másodperceit nem szabad elvenni attól, aki árat keres.

Csak a **főoldal teljes betöltésekor** fut. Aloldalon nem, és oldalon belüli
navigáció sem indítja újra.

Alapból **rejtett**. Ha a `MotionBoot` bármi miatt nem fut le, nem az a hibás
állapot áll elő, hogy egy fekete lap marad a tartalom fölött.

A függönynek saját `overflow: hidden` kell: a `<html>` `overflow-x: clip`-je a
`position: fixed` elemeket nem vágja, és a fénycsík kilógna a lapból.

---

## 5. Térköz és mérték

- Szekció függőleges térköze: 80 / 96 / 128 px (`py-20 md:py-24 lg:py-30`).
  A sok üres hely maga a prémium érzet, és a határoknak is kell hely.
- Vízszintes mérték: `Container` — 1280 px alap, 1440 px széles rácsokhoz,
  704 px összefüggő olvasnivalóhoz. **Egyetlen helyen dől el**, hogy ne tudjon
  oldalanként pár pixelt csúszni.
- Lekerekítés: `card` (12px), `panel` (20px), `pill`. Nincs negyedik.
- Árnyék: három szint, csak elemeléshez, soha díszítésnek.

---

## 6. Csapdák

- **A `tailwind-merge` csak azonos variánsú osztályt ejt ki.** A `p-0` az alap
  `p-6`-ot leüti, a `sm:p-8`-at **nem** — a térköz 640 pixel fölött némán
  visszajön. Ezért van a `Card`-on `flush` kapcsoló a `p-0` helyett; ahol
  hasonló felülírás kell, ott is a komponens adjon rá kapcsolót.
- **A `data-motion` attribútumot festés előtt írja egy beágyazott szkript**,
  ezért a `<html>`-en `suppressHydrationWarning` van. Máshová ne tedd ki.
- **A `preserveAspectRatio="none"` a vonalvastagságot is nyújtja.** A határok
  fényvonalán ezért van `vector-effect="non-scaling-stroke"` — enélkül széles
  nézeten kövér csíkká hízik.
- **A rögzített fejléc alá horgonyzott szekció a fejléc mögé csúszik.** A
  megoldás `scroll-margin` (`scroll-mt-28`) és a `<html>` `scroll-padding-top`
  értéke, nem egy üres elem a horgony elé.
- **Az álló fotókat ne vágd fekvőre.** A referenciafotók 3:4 arányúak, mert
  telefonnal készültek a műhelyben. A galéria erre épül; egy 16:9-re nyírt
  álló fotóból pont az veszik el, ami rajta van.
- **A kliensoldali ellenőrzés nem védelem.** A `required` attribútum
  kikapcsolható, a végpont űrlap nélkül is hívható. A döntés a
  `lib/validation.ts`-é, a szerveren.
