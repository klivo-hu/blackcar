/**
 * Az adminból állítható beállítások — típus és alapértelmezés.
 *
 * Ez a modul **szándékosan nem importál semmit a szerverről**: a szerkesztő
 * felület kliens komponens, és ugyanezt a típust használja. A tároló
 * (`lib/store/settings.ts`) húz be `revalidateTag`-et, ami csak szerveren
 * létezik — ha a kettő egy fájlban lenne, a build elszállna.
 *
 * Ami itt van, azt a **tulajdonos** módosítja, nem a fejlesztő: elérhetőség és
 * a foglalás kapcsolója. Szöveg ide nem kerül; az a `lib/content/site.ts`-ben él.
 */

export type SiteSettings = {
  /**
   * A foglalási rendszer főkapcsolója.
   *
   * **Alapból kikapcsolt.** Amíg ki van kapcsolva, az oldal egyetlen űrlapot sem
   * jelenít meg és semmilyen személyes adatot nem vesz át — ezért a jogi
   * tájékoztatók sem jelennek meg, mert nincs mit tájékoztatni. Bekapcsoláskor
   * a foglalási szekció, az adatkezelési tájékoztató és a foglalási feltételek
   * egyszerre jelennek meg. A kettő nem választható szét: adatot kérni
   * tájékoztatás nélkül jogszerűtlen.
   */
  bookingEnabled: boolean;

  /** A látogatónak megjelenő e-mail cím. */
  email: string;

  /**
   * A látogatónak megjelenő telefonszám, olvasható formában.
   * A `tel:` hivatkozást a `lib/format.ts` állítja elő belőle.
   */
  phone: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  // Kikapcsolva indul. A bekapcsolás tudatos döntés, nem alapértelmezés.
  bookingEnabled: false,
  email: 'blackcarautokozmetika@gmail.com',
  phone: '+36 70 907 0585',
};

/**
 * A beállítások ellenőrzése a mentés előtt.
 *
 * A hívó a nyers, kliensről érkező objektumot adja át. A visszatérés vagy a
 * tisztított érték, vagy a hiba oka — kivétel nélkül, hogy a route handler
 * eldönthesse, mit válaszoljon.
 */
export type SettingsValidation =
  { ok: true; value: SiteSettings } | { ok: false; errors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Számjegyek, szóköz, kötőjel, zárójel és egy opcionális vezető pluszjel. */
const PHONE_PATTERN = /^\+?[\d\s()-]{7,24}$/;

export function validateSettings(input: unknown): SettingsValidation {
  const errors: Record<string, string> = {};

  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: { form: 'Hiányzó adat.' } };
  }

  const raw = input as Record<string, unknown>;

  const bookingEnabled = raw.bookingEnabled;
  if (typeof bookingEnabled !== 'boolean') {
    errors.bookingEnabled = 'A kapcsoló értéke csak igaz vagy hamis lehet.';
  }

  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Adj meg érvényes e-mail címet.';
  }

  const phone = typeof raw.phone === 'string' ? raw.phone.trim() : '';
  if (!PHONE_PATTERN.test(phone)) {
    errors.phone = 'Adj meg érvényes telefonszámot.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, value: { bookingEnabled: bookingEnabled as boolean, email, phone } };
}
