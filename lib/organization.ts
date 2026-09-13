/**
 * Cégadatok a jogi dokumentumokhoz — **kizárólag a `.env` fájlból**.
 *
 * Ez a modul a jogi adatok egyetlen forrása: ami itt megjelenik, az jelenik meg
 * az impresszumban, a foglalási feltételekben, az adatkezelési tájékoztatóban és
 * a keresőknek küldött strukturált adatban.
 *
 * **Nincs mögötte admin felület.** Az elérhetőséget (e-mail, telefon) a
 * tulajdonos szerkeszti az adminban, mert az napi működés; a székhely, az
 * adószám és a nyilvántartási szám viszont nem változik hetente, és két
 * szerkesztési hely két egymásnak ellentmondó impresszumot jelentene. A `.env`
 * átírása után a konténert újra kell indítani.
 *
 * **Kitöltetlen érték helyén `[szögletes zárójeles]` helyőrző marad.** Ez
 * szándékos: azonnal látszik az oldalon, tehát nem lehet véletlenül
 * kitöltetlen cégadatokkal élesíteni. Kitalált adatot a modul soha nem ad
 * vissza — sem itt, sem a strukturált adatban.
 *
 * A modul függőségmentes, ezért szerver- és kliensoldalon egyaránt
 * importálható.
 */

export type Company = {
  legalName: string;
  /** Irányítószám, például `3000`. */
  postcode: string;
  /** Település, például `Hatvan`. */
  city: string;
  /** Közterület és házszám — a cím maradéka. */
  street: string;
  /** A teljes székhely egy sorban. Származtatott mező, nincs saját `.env` sora. */
  seat: string;
  taxNumber: string;
  registrationNumber: string;
  representative: string;
  hostingProvider: string;
  supervisoryAuthority: string;
  disputeResolution: string;
  /** Meddig őrizzük a foglalási adatokat. */
  bookingRetention: string;
  effectiveDate: string;
};

/** A földrajzi koordináták a `LocalBusiness` strukturált adathoz. */
export type Geo = { latitude: string; longitude: string };

export type Organization = { company: Company; geo: Geo };

/**
 * A környezeti változók olvasása.
 *
 * A `process.env.X` alakot **nem lehet dinamikus kulccsal írni**: a Next.js a
 * kliens bundle-ben szövegesen cseréli le ezeket a hivatkozásokat, és egy
 * `process.env[valtozo]` alakot nem ismer fel. Ezért van itt explicit
 * leképezés, kulcsonként egy sorral.
 */
function fromEnv(): Record<keyof Company | keyof Geo, string | undefined> {
  return {
    // A `seat` származtatott mező, nincs mögötte saját sor — a `getOrganization`
    // állítja elő a három címrészből.
    seat: undefined,
    legalName: process.env.COMPANY_LEGAL_NAME,
    postcode: process.env.COMPANY_POSTCODE,
    city: process.env.COMPANY_CITY,
    street: process.env.COMPANY_STREET,
    taxNumber: process.env.COMPANY_TAX_NUMBER,
    registrationNumber: process.env.COMPANY_REGISTRATION_NUMBER,
    representative: process.env.COMPANY_REPRESENTATIVE,
    hostingProvider: process.env.COMPANY_HOSTING_PROVIDER,
    supervisoryAuthority: process.env.COMPANY_SUPERVISORY_AUTHORITY,
    disputeResolution: process.env.COMPANY_DISPUTE_RESOLUTION,
    bookingRetention: process.env.COMPANY_BOOKING_RETENTION,
    effectiveDate: process.env.COMPANY_EFFECTIVE_DATE,
    latitude: process.env.COMPANY_LATITUDE,
    longitude: process.env.COMPANY_LONGITUDE,
  };
}

/** Amit a szerkesztőnek ki kell töltenie, ha az érték hiányzik. */
const PLACEHOLDER: Record<keyof Company | keyof Geo, string> = {
  legalName: '[cégnév / egyéni vállalkozó neve]',
  postcode: '[irányítószám]',
  city: '[település]',
  street: '[utca, házszám]',
  seat: '[székhely]',
  taxNumber: '[adószám]',
  registrationNumber: '[nyilvántartási szám]',
  representative: '[képviselő neve]',
  hostingProvider: '[tárhelyszolgáltató neve és elérhetősége]',
  supervisoryAuthority: '[felügyeleti szerv]',
  disputeResolution: '[békéltető testület]',
  bookingRetention: '[megőrzési idő]',
  effectiveDate: '[hatálybalépés dátuma]',
  latitude: '',
  longitude: '',
};

function value(raw: string | undefined, key: keyof Company | keyof Geo): string {
  const trimmed = raw?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : PLACEHOLDER[key];
}

/** Igaz, ha az érték kitöltetlen — tehát helyőrző, nem adat. */
export function isPlaceholder(text: string): boolean {
  return text.startsWith('[') && text.endsWith(']');
}

export function getOrganization(): Organization {
  const env = fromEnv();

  const postcode = value(env.postcode, 'postcode');
  const city = value(env.city, 'city');
  const street = value(env.street, 'street');

  return {
    company: {
      legalName: value(env.legalName, 'legalName'),
      postcode,
      city,
      street,
      seat: `${postcode} ${city}, ${street}`,
      taxNumber: value(env.taxNumber, 'taxNumber'),
      registrationNumber: value(env.registrationNumber, 'registrationNumber'),
      representative: value(env.representative, 'representative'),
      hostingProvider: value(env.hostingProvider, 'hostingProvider'),
      supervisoryAuthority: value(env.supervisoryAuthority, 'supervisoryAuthority'),
      disputeResolution: value(env.disputeResolution, 'disputeResolution'),
      bookingRetention: value(env.bookingRetention, 'bookingRetention'),
      effectiveDate: value(env.effectiveDate, 'effectiveDate'),
    },
    geo: {
      latitude: value(env.latitude, 'latitude'),
      longitude: value(env.longitude, 'longitude'),
    },
  };
}
