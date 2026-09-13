/**
 * Az árak és a szolgáltatások — az oldal egyetlen árforrása.
 *
 * A kezdőlap, a szolgáltatások oldal, az árkalkulátor és a strukturált adat
 * mind innen olvas. Ha egy ár változik, egy helyen változik.
 *
 * **Minden szám a korábbi oldalról származik.** Ahol a vállalkozás nem
 * mondott ki méret szerinti bontást (teljes takarítás), ott nincs kitalált
 * táblázat sem: a sáv marad, és az oldal kiírja, mi határozza meg az árat.
 * Egy becsült, de kimondottnak látszó ár rosszabb, mint egy őszinte sáv.
 */

/** A méretkategóriák. A sorrend az áré: a legolcsóbbtól a legdrágábbig. */
export const vehicleSizes = [
  { id: 'varosi', label: 'Városi személyautó', note: 'Normál méretű, 5 ajtós' },
  { id: 'kombi', label: 'Kombi', note: 'Normál méretű személyautó, kombi kivitel' },
  { id: 'egyteru', label: 'Egyterű / 7 személyes', note: 'Egyterű városi személyautó' },
  { id: 'furgon', label: 'Furgon / kisteherautó', note: 'Kisbusz és kisebb teherautó' },
] as const;

export type VehicleSizeId = (typeof vehicleSizes)[number]['id'];

export type Service = {
  slug: string;
  name: string;
  /**
   * Rövid név a választósávhoz.
   *
   * A három teljes név mindegyike a „takarítás” szóra végződik, tehát a
   * szegmensvezérlőben háromszor ismétlődne — és 375 pixelen nem is férne el
   * egy sorban. A megkülönböztető rész az első szó.
   */
  short: string;
  /** Egy mondat, ami eldönti, hogy ez kell-e neki. */
  summary: string;
  /** A csomag tartalma, tételesen. */
  includes: string[];
  /** Várható időtartam, emberi formában. */
  duration: string;
  /** A kimondott ársáv, ezer forintban. */
  range: { from: number; to: number };
  /**
   * Méret szerinti ár, ezer forintban — csak ott, ahol a vállalkozás kimondta.
   * `null` esetén az oldal a sávot mutatja és megmondja, mitől függ az ár.
   */
  bySize: Record<VehicleSizeId, number> | null;
};

export const services: Service[] = [
  {
    slug: 'kulso-takaritas',
    name: 'Külső takarítás',
    short: 'Külső',
    summary:
      'A lakk, az üveg és a felnik kézi átmosása és konzerválása — a falcokkal és ' +
      'az ajtó melletti ívekkel együtt.',
    includes: [
      'Szennyeződésoldó szerek felvitele',
      'Nagynyomású szivattyúval való öblítés',
      'Felnik részletes takarítása',
      'Szélvédő és üvegfelületek tisztítása',
      'Falcok és ajtó melletti ívek öblítése',
      'Konzerválás és szárítás',
    ],
    duration: '2–3 óra',
    range: { from: 15, to: 35 },
    bySize: { varosi: 15, kombi: 20, egyteru: 25, furgon: 35 },
  },
  {
    slug: 'belso-takaritas',
    name: 'Belső takarítás',
    short: 'Belső',
    summary:
      'Ülés, kárpit, műszerfal és csomagtér — a beltér minden felülete, oldószeres ' +
      'tisztítással és ápolással.',
    includes: [
      'Ülések oldószerekkel való takarítása',
      'Kárpitok tisztítása',
      'Kormány, váltó, műszerfal és kezelőszervek portalanítása',
      'Hátsó ülések alatti terület és csomagtér tisztítása',
      'Műanyag felületek ápolása',
      'Belső illatosítása',
    ],
    duration: '4–5 óra',
    range: { from: 20, to: 50 },
    bySize: { varosi: 20, kombi: 25, egyteru: 35, furgon: 50 },
  },
  {
    slug: 'teljes-takaritas',
    name: 'Teljes takarítás',
    short: 'Teljes',
    summary:
      'A külső és a belső egy menetben. A leggyakoribb megrendelés: az autó úgy ' +
      'megy haza, ahogy a kereskedésből elindult.',
    includes: [
      'Teljes külső takarítás',
      'Teljes belső takarítás',
      'Az autó külső és belső ápolása',
    ],
    duration: '4–5 óra',
    range: { from: 40, to: 85 },
    // A vállalkozás a teljes takarításra sávot adott meg, méret szerinti
    // bontást nem. Itt szándékosan nincs kitalált táblázat.
    bySize: null,
  },
];

/**
 * A fenntartó takarítás.
 *
 * Külön áll a szolgáltatásoktól, mert **nem rendelhető önállóan**: csak a
 * féléves és az éves csomag része. A korábbi oldalon ez egy árazatlan kártya
 * volt a többi mellett, ami félreérthető — itt a saját helyén van, és kimondja
 * magáról, hogy mi.
 */
export const maintenanceService = {
  name: 'Fenntartó takarítás',
  summary:
    'Alapos belső és átlagos külső takarítás a két nagy takarítás között. Önállóan ' +
    'nem rendelhető: a féléves és az éves csomag része.',
  includes: ['Alapos belső takarítás', 'Átlagos külső takarítás', 'Külső és belső ápolás'],
} as const;

export type Bundle = {
  slug: string;
  name: string;
  period: string;
  includes: string[];
  /** Az ár ezer forintban. */
  price: number;
  /** A megtakarítás ezer forintban, ahogy a vállalkozás kimondta. */
  saving: number;
};

/**
 * A féléves és az éves csomag.
 *
 * Mindkettő **csak telefonos egyeztetéssel** köthető, és a foglalás az ár
 * 40%-ának letételével válik véglegessé — ezt az oldal kiírja a csomagoknál,
 * nem apró betűvel a lap alján.
 */
export const bundles: Bundle[] = [
  {
    slug: 'feleves',
    name: 'Féléves csomag',
    period: '6 hónap',
    includes: ['2 teljes takarítás', '4 fenntartó takarítás'],
    price: 250,
    saving: 50,
  },
  {
    slug: 'eves',
    name: 'Éves csomag',
    period: '12 hónap',
    includes: ['4 teljes takarítás', '8 fenntartó takarítás'],
    price: 450,
    saving: 50,
  },
];

/** A csomagokra vonatkozó feltétel, egy helyen. */
export const bundleTerms =
  'A féléves és az éves csomag telefonos egyeztetéssel köthető. A foglalás az ár ' +
  '40%-ának letétele után válik véglegessé.';

/** Az árakra vonatkozó kitétel, egy helyen. */
export const priceNote =
  'Az árak forintban értendők és tájékoztató jellegűek: a végleges árat a gépjármű ' +
  'mérete és állapota határozza meg. Az árváltozás jogát fenntartjuk.';

/** Ezer forintos értékből olvasható ár. */
export function formatThousands(value: number): string {
  return `${value} e Ft`;
}

/** Ársáv olvasható formában. Azonos határok esetén nem ír ki „15 – 15"-öt. */
export function formatRange(range: { from: number; to: number }): string {
  return range.from === range.to ? formatThousands(range.from) : `${range.from} – ${range.to} e Ft`;
}

export function serviceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
