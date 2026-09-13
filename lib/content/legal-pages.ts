import { getOrganization } from '@/lib/organization';
import { openingHours, serviceArea, site } from '@/lib/content/site';
import { bundleTerms, priceNote, services } from '@/lib/content/pricing';

/**
 * A jogi tájékoztatók.
 *
 * **Ezek minta-szövegek.** A tényleges közzététel előtt jogi szakemberrel kell
 * átnézetni őket — a `docs/JOGI-ADATOK.md` is ezzel kezdődik. A cégadatokat
 * (név, székhely, adószám, tárhelyszolgáltató, hatálybalépés) nem ez a fájl
 * tartalmazza: azok a `.env`-ből jönnek a `getOrganization()`-ön keresztül,
 * tehát egy adószám- vagy címváltozáshoz nem kell a kódhoz nyúlni, és nem
 * fordulhat elő, hogy az impresszum és a feltételek két különböző adatot mutat.
 *
 * **A dokumentum szerkezet, nem Markdown.** Így nincs elemző és nincs
 * `dangerouslySetInnerHTML` sem: a renderelő komponens tipizált szakaszokat
 * jár be. Három dokumentumhoz egy Markdown futószalag több kockázat, mint
 * amennyi kényelmet ad.
 *
 * A tájékoztatók **csak bekapcsolt foglalás mellett jelennek meg** az oldalon.
 * Amíg az oldal egyetlen személyes adatot sem vesz át, nincs miről
 * tájékoztatni; a dokumentumok viszont készen állnak, hogy a bekapcsolás
 * pillanatában azonnal ott legyenek.
 */

export type LegalBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'definitions'; items: { term: string; value: string }[] };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

export type LegalDocument = {
  slug: string;
  title: string;
  description: string;
  sections: LegalSection[];
};

/** A dokumentumok sorrendje és neve — a láblécnek is ez a forrása. */
export const legalPages = [
  { slug: 'foglalasi-feltetelek', title: 'Foglalási feltételek' },
  { slug: 'adatkezelesi-tajekoztato', title: 'Adatkezelési tájékoztató' },
  { slug: 'impresszum', title: 'Impresszum' },
] as const;

export type LegalSlug = (typeof legalPages)[number]['slug'];

function impresszum(): LegalDocument {
  const { company } = getOrganization();

  return {
    slug: 'impresszum',
    title: 'Impresszum',
    description: `A ${site.name} üzemeltetőjének adatai és a weboldal működésével kapcsolatos tájékoztatás.`,
    sections: [
      {
        heading: 'A szolgáltató adatai',
        blocks: [
          {
            kind: 'definitions',
            items: [
              { term: 'Név', value: company.legalName },
              { term: 'Székhely', value: company.seat },
              { term: 'Adószám', value: company.taxNumber },
              { term: 'Nyilvántartási szám', value: company.registrationNumber },
              { term: 'Képviselő', value: company.representative },
            ],
          },
        ],
      },
      {
        heading: 'Tárhelyszolgáltató',
        blocks: [{ kind: 'paragraph', text: company.hostingProvider }],
      },
      {
        heading: 'Felügyeleti szerv',
        blocks: [{ kind: 'paragraph', text: company.supervisoryAuthority }],
      },
      {
        heading: 'Az oldal célja',
        blocks: [
          {
            kind: 'paragraph',
            text:
              `A ${site.url} weboldal a ${site.name} szolgáltatásait mutatja be: külső, ` +
              `belső és teljes autókozmetikai takarítást ${site.city}ban és környékén. ` +
              'Az oldalon feltüntetett árak tájékoztató jellegűek, nem minősülnek ajánlattételnek.',
          },
        ],
      },
      {
        heading: 'Szerzői jog',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'Az oldalon szereplő fotók a vállalkozás által elvégzett munkákról készültek, ' +
              'és a szolgáltató tulajdonát képezik. Felhasználásuk előzetes írásos ' +
              'hozzájárulás nélkül nem megengedett.',
          },
        ],
      },
    ],
  };
}

function foglalasiFeltetelek(): LegalDocument {
  const { company } = getOrganization();
  const hours = openingHours
    .map((entry) => `${entry.days}: ${entry.from ? `${entry.from} – ${entry.to}` : 'zárva'}`)
    .join('; ');

  return {
    slug: 'foglalasi-feltetelek',
    title: 'Foglalási feltételek',
    description:
      'Hogyan működik az időpontfoglalás, mikor válik véglegessé, és mi történik lemondás esetén.',
    sections: [
      {
        heading: '1. A szolgáltató',
        blocks: [
          {
            kind: 'paragraph',
            text: `${company.legalName} (székhely: ${company.seat}, adószám: ${company.taxNumber}), a továbbiakban: Szolgáltató.`,
          },
        ],
      },
      {
        heading: '2. A foglalás jellege',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'A weboldalon leadott foglalás időpontkérés, nem visszaigazolt időpont. ' +
              'A Szolgáltató a beérkezett kérést munkanapon belül telefonon vagy e-mailben ' +
              'visszaigazolja; a foglalás ezzel a visszaigazolással válik véglegessé. ' +
              'Amíg visszaigazolás nem érkezett, a megadott időpont nincs lefoglalva.',
          },
          {
            kind: 'paragraph',
            text: `A Szolgáltató munkarendje: ${hours}.`,
          },
        ],
      },
      {
        heading: '3. A szolgáltatások és az áraik',
        blocks: [
          {
            kind: 'list',
            items: services.map(
              (service) =>
                `${service.name} — várható időtartam: ${service.duration}. Az ár a gépjármű méretétől és állapotától függ.`,
            ),
          },
          { kind: 'paragraph', text: priceNote },
          { kind: 'paragraph', text: bundleTerms },
        ],
      },
      {
        heading: '4. Az ár meghatározása',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'A végleges árat a Szolgáltató a gépjármű átvételekor, annak mérete és ' +
              'tényleges állapota alapján mondja ki, a munka megkezdése előtt. Ha a ' +
              'tényleges állapot a weboldalon szereplő sávnál magasabb árat indokol, a ' +
              'Szolgáltató ezt a munka megkezdése előtt jelzi, és a Megrendelő ilyenkor ' +
              'díjmentesen elállhat.',
          },
        ],
      },
      {
        heading: '5. Lemondás és távolmaradás',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'A visszaigazolt időpont díjmentesen lemondható vagy módosítható az időpontot ' +
              'megelőző 24 óráig, telefonon. Ezen belüli lemondás vagy előzetes jelzés ' +
              'nélküli távolmaradás esetén a Szolgáltató fenntartja a jogot, hogy a ' +
              'következő foglalást előlegfizetéshez kösse.',
          },
          {
            kind: 'paragraph',
            text:
              'A féléves és éves csomag foglalása az ár 40%-ának letétele után válik ' +
              'véglegessé. Lemondás esetén a letét a már igénybe vett alkalmakkal ' +
              'elszámolásra kerül.',
          },
        ],
      },
      {
        heading: '6. A gépjármű átadása és átvétele',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'A Megrendelő a gépjárművet a megbeszélt időpontban adja át, és a munka ' +
              'befejezésekor veszi át. Kérjük, a személyes tárgyakat és az értékeket az ' +
              'átadás előtt vegye ki a járműből: az autóban hagyott tárgyakért a Szolgáltató ' +
              'felelősséget nem vállal.',
          },
          {
            kind: 'paragraph',
            text:
              'A Szolgáltató a munka megkezdése előtt jelzi, ha a gépjárművön olyan meglévő ' +
              'sérülést (kőfelverődés, karcolás, szakadt kárpit, elhasználódott felület) ' +
              'észlel, amely a takarítás során láthatóbbá válhat vagy tovább sérülhet.',
          },
        ],
      },
      {
        heading: '7. Panaszkezelés',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'Panaszát a Szolgáltató elérhetőségein jelezheti. A Szolgáltató a panaszt ' +
              'megvizsgálja és álláspontjáról tájékoztatja. Fogyasztói jogvita esetén a ' +
              `Megrendelő a következő testülethez fordulhat: ${company.disputeResolution}.`,
          },
        ],
      },
      {
        heading: '8. Hatály',
        blocks: [
          {
            kind: 'paragraph',
            text: `A jelen feltételek ${company.effectiveDate} napjától hatályosak. A Szolgáltató fenntartja a módosítás jogát; a módosítás a közzététel napjától hatályos, a korábban visszaigazolt foglalásokra nem hat ki.`,
          },
        ],
      },
    ],
  };
}

function adatkezeles(email: string, phone: string): LegalDocument {
  const { company } = getOrganization();

  return {
    slug: 'adatkezelesi-tajekoztato',
    title: 'Adatkezelési tájékoztató',
    description:
      'Milyen adatot kérünk az időpontfoglaláshoz, miért, meddig őrizzük, és milyen jogok illetik meg Önt.',
    sections: [
      {
        heading: '1. Az adatkezelő',
        blocks: [
          {
            kind: 'definitions',
            items: [
              { term: 'Név', value: company.legalName },
              { term: 'Székhely', value: company.seat },
              { term: 'E-mail', value: email },
              { term: 'Telefon', value: phone },
            ],
          },
        ],
      },
      {
        heading: '2. Milyen adatot kezelünk és miért',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'Az időpontfoglaláshoz csak azt kérjük, ami az időpont egyeztetéséhez és a ' +
              'munka elvégzéséhez szükséges:',
          },
          {
            kind: 'definitions',
            items: [
              { term: 'Név', value: 'hogy tudjuk, kinek az autójáról van szó' },
              { term: 'Telefonszám', value: 'az időpont visszaigazolásához és egyeztetéséhez' },
              { term: 'E-mail cím', value: 'írásos visszajelzéshez, ha telefonon nem érjük el' },
              {
                term: 'Gépjármű típusa és mérete',
                value: 'a munka időigényének és árának meghatározásához',
              },
              { term: 'Kért nap és napszak', value: 'a beosztás egyeztetéséhez' },
              { term: 'Üzenet (nem kötelező)', value: 'amit Ön fontosnak tart elmondani' },
            ],
          },
          {
            kind: 'paragraph',
            text:
              'Az oldal nem használ analitikai, hirdetési vagy profilalkotó sütit, és nem ' +
              'ad át adatot hirdetési célra. Az oldal működéséhez sem használunk sütit; ' +
              'egyedül az admin felület használ bejelentkezési sütit, amely a látogatókat ' +
              'nem érinti.',
          },
        ],
      },
      {
        heading: '3. Az adatkezelés jogalapja',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'Az adatkezelés jogalapja a GDPR 6. cikk (1) bekezdés b) pontja: az Ön ' +
              'kérésére történő, a szerződés megkötését megelőző lépések megtétele. ' +
              'Ha a foglalásból megrendelés lesz, a számlázási adatokat jogi kötelezettség ' +
              'teljesítése [GDPR 6. cikk (1) c)] alapján kezeljük.',
          },
        ],
      },
      {
        heading: '4. Meddig őrizzük',
        blocks: [
          {
            kind: 'paragraph',
            text:
              `A foglalási adatokat ${company.bookingRetention} őrizzük, majd töröljük. ` +
              'A számviteli bizonylatokat a jogszabályban előírt ideig (jelenleg nyolc év) ' +
              'meg kell őriznünk; ezek törlését nem tudjuk teljesíteni.',
          },
        ],
      },
      {
        heading: '5. Ki fér hozzá',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'Az adatokhoz kizárólag az adatkezelő fér hozzá. Az adatok a weboldalt ' +
              `kiszolgáló szerveren tárolódnak; a tárhelyszolgáltató mint adatfeldolgozó: ` +
              `${company.hostingProvider}. Harmadik félnek adatot nem adunk át, és az ` +
              'Európai Gazdasági Térségen kívülre nem továbbítunk.',
          },
        ],
      },
      {
        heading: '6. Az Ön jogai',
        blocks: [
          {
            kind: 'list',
            items: [
              'Tájékoztatást kérhet arról, milyen adatát kezeljük.',
              'Kérheti a helytelen adat helyesbítését.',
              'Kérheti az adat törlését, ha nincs jogszabályi akadálya.',
              'Kérheti az adatkezelés korlátozását.',
              'Tiltakozhat az adatkezelés ellen.',
              'Kérheti adatai hordozható formában való kiadását.',
            ],
          },
          {
            kind: 'paragraph',
            text: `Kérését a ${email} címen vagy a ${phone} telefonszámon jelezheti. A kérést legkésőbb egy hónapon belül teljesítjük.`,
          },
        ],
      },
      {
        heading: '7. Jogorvoslat',
        blocks: [
          {
            kind: 'paragraph',
            text:
              'Ha úgy érzi, hogy az adatkezelés jogsértő, panasszal fordulhat a Nemzeti ' +
              'Adatvédelmi és Információszabadság Hatósághoz (1055 Budapest, Falk Miksa ' +
              'utca 9-11., ugyfelszolgalat@naih.hu), vagy bírósághoz fordulhat.',
          },
        ],
      },
      {
        heading: '8. Hatály',
        blocks: [
          {
            kind: 'paragraph',
            text: `A jelen tájékoztató ${company.effectiveDate} napjától hatályos. A szolgáltatás területe: ${serviceArea.join(', ')}.`,
          },
        ],
      },
    ],
  };
}

/**
 * Egy dokumentum előállítása.
 *
 * Az elérhetőség paraméterként érkezik, nem importként: az adminból
 * szerkeszthető, tehát futásidejű adat. Ha a modul maga olvasná a tárolóból,
 * kliens komponensből importálhatatlanná válna.
 */
export function getLegalDocument(
  slug: string,
  contact: { email: string; phone: string },
): LegalDocument | undefined {
  switch (slug) {
    case 'impresszum':
      return impresszum();
    case 'foglalasi-feltetelek':
      return foglalasiFeltetelek();
    case 'adatkezelesi-tajekoztato':
      return adatkezeles(contact.email, contact.phone);
    default:
      return undefined;
  }
}
