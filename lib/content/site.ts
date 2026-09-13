/**
 * Az oldal szövege, egyetlen helyen.
 *
 * **Egy adatnak egy helye van.** Ami itt áll, az sehol máshol nincs leírva:
 * a komponensek innen olvasnak. Az elérhetőség (e-mail, telefon) viszont
 * *nem* itt van, hanem az adminból állítható beállításokban — azt a tulajdonos
 * módosítja, nem a fejlesztő.
 *
 * A szövegek a korábbi oldalról származnak, mert a tartalom érvényes maradt:
 * ugyanaz a vállalkozás, ugyanazok a szolgáltatások. Ahol rövidítettem, ott a
 * jelentés nem változott.
 */

export const site = {
  name: 'Black Car Autókozmetika',
  shortName: 'Black Car',
  lang: 'hu',
  locale: 'hu_HU',
  /** A telephely városa. Az egész SEO erre a szóra épül. */
  city: 'Hatvan',
  url: 'https://blackcar60.hu',
  description:
    'Autókozmetika Hatvanban: teljes belső és külső takarítás, kárpittisztítás és ' +
    'lakkápolás személyautóra, kombira, egyterűre és kisteherautóra. Fix, méret ' +
    'szerinti árak.',
  tagline: 'Autókozmetika Hatvanban',
} as const;

/**
 * A vonzáskörzet.
 *
 * A strukturált adat `areaServed` mezőjébe és a helyi SEO szövegekbe is innen
 * kerülnek a települések. Mind a Hatvan körüli 20 km-en belül van, tehát ez
 * ellenőrizhető állítás, nem a találati lista felé szórt névlista.
 */
export const serviceArea = [
  'Hatvan',
  'Hort',
  'Lőrinci',
  'Heréd',
  'Nagykökényes',
  'Apc',
  'Petőfibánya',
  'Zagyvaszántó',
  'Boldog',
  'Tura',
  'Aszód',
  'Jászfényszaru',
] as const;

/**
 * A vállalkozás nyitva tartása.
 *
 * Időpontfoglalásos szolgáltatás: a nyitva tartás azt mondja meg, mikor lehet
 * *telefonon elérni* és mikor futnak a munkák. A strukturált adat is ezt kapja.
 */
export const openingHours = [
  { days: 'Hétfő – Péntek', from: '08:00', to: '17:00', schema: ['Mo', 'Tu', 'We', 'Th', 'Fr'] },
  { days: 'Szombat', from: '08:00', to: '13:00', schema: ['Sa'] },
  { days: 'Vasárnap', from: null, to: null, schema: ['Su'] },
] as const;

export type Pillar = { title: string; body: string };

/**
 * Amiért ide hozzák az autót.
 *
 * Négy állítás, és mindegyik a korábbi oldal szövegéből következik. Nincs
 * köztük kitalált szám és nincs olyan ígéret, amit a vállalkozás nem tett meg.
 */
export const pillars: Pillar[] = [
  {
    title: 'Gépi mosó nélkül',
    body:
      'A lakkhoz nem nyúl kefe. Szennyeződésoldó, nagynyomású öblítés és kézi ' +
      'átmosás — a falcok és az ajtó melletti ívek is sorra kerülnek, nem csak ' +
      'a látható felület.',
  },
  {
    title: 'Méret szerinti, fix ár',
    body:
      'Az ár a gépjármű méretéből és állapotából adódik, és előre kimondjuk. ' +
      'Nincs utólag hozzáadott tétel, és nincs „majd meglátjuk".',
  },
  {
    title: 'Kimondott időtartam',
    body:
      'A külső takarítás 2–3 óra, a belső 4–5 óra. Megmondjuk, mikorra lesz kész, ' +
      'hogy be tudja osztani a napját.',
  },
  {
    title: 'Visszatérőknek kedvezmény',
    body:
      'A féléves és éves csomag ugyanazt a munkát adja, olcsóbban — mert a ' +
      'rendszeresen ápolt autót kevesebb munka rendben tartani.',
  },
];

export type Faq = { question: string; answer: string };

/**
 * Kérdések és válaszok.
 *
 * A korábbi oldal Q&A szekciójából, plusz két kérdés, amit a szolgáltatás
 * leírásából meg lehet válaszolni (helyszín, gépjárműtípusok). Ez a lista adja
 * a `FAQPage` strukturált adatot is — tehát pontosan ennyi kérdés van, és a
 * válaszok itt teljesek, nem utalnak máshová.
 */
export const faqs: Faq[] = [
  {
    question: 'Hol található a Black Car Autókozmetika?',
    answer:
      'Hatvanban. A környező településekről — Hort, Lőrinci, Heréd, Apc, Petőfibánya, ' +
      'Tura, Aszód, Jászfényszaru — néhány perc az út. Az autót a megbeszélt ' +
      'időpontban hozza, és a munka végeztével viszi.',
  },
  {
    question: 'Mennyi időt vesz igénybe a kozmetikai folyamat?',
    answer:
      'A külső takarítás 2–3 óra: mosás, felnik, üvegfelületek, konzerválás. ' +
      'A belső takarítás 4–5 óra: ülések, kárpitok, műanyag felületek, csomagtér. ' +
      'A teljes takarítás a kettő együtt. Az időtartam a gépjármű méretétől és ' +
      'állapotától függ.',
  },
  {
    question: 'Mennyibe kerül egy átlagos kozmetikai szolgáltatás?',
    answer:
      'A leggyakoribb megrendelés egy kisebb városi autó teljes — külső és belső — ' +
      'takarítása, ami 40 ezer forint környékére esik. A külső takarítás 15 ezer, ' +
      'a belső 20 ezer forinttól indul. Az árat a gépjármű mérete és állapota ' +
      'határozza meg.',
  },
  {
    question: 'Milyen típusú gépjárművekkel foglalkoznak?',
    answer:
      'Személyautóval, kombival, terepjáróval, egyterű és hétszemélyes autóval, ' +
      'kisbusszal és kisebb teherautóval egyaránt. Legyen szó mindennapi autóról ' +
      'vagy céges járműről, ugyanaz a munka és ugyanaz a mérce.',
  },
  {
    question: 'Mitől más a Black Car Autókozmetika?',
    answer:
      'A cél, hogy minden vásárló elégedetten távozzon, és visszatérő vendég legyen. ' +
      'Ezért van több promóció és kedvezmény: megfizethetőbb, de prémium ellátás — ' +
      'így fejezzük ki a vásárlók iránti odafigyelésünket.',
  },
  {
    question: 'Kell előre időpontot egyeztetni?',
    answer:
      'Igen. Egy teljes takarítás a nap nagy részét kitölti, ezért egy napra csak ' +
      'korlátozott számú autó fér be. Telefonon vagy a közösségi oldalakon ' +
      'egyeztetünk időpontot.',
  },
];

/** A működő közösségi oldalak. A TikTok a korábbi oldalon üres hivatkozás volt,
 *  ezért nem szerepel: egy sehová sem vezető ikon rontja a bizalmat. */
export const socials = [
  {
    name: 'Instagram',
    handle: 'blackcar_hatvan',
    href: 'https://www.instagram.com/blackcar_hatvan/',
  },
  {
    name: 'Facebook',
    handle: 'Black Car Autókozmetika Hatvan',
    href: 'https://www.facebook.com/profile.php?id=100090849552390',
  },
] as const;
