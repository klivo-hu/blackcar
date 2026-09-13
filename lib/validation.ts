import { services, vehicleSizes, type VehicleSizeId } from '@/lib/content/pricing';
import type { NewBooking } from '@/lib/store/bookings';

/**
 * A foglalási űrlap ellenőrzése.
 *
 * **Ez a bizalmi határ.** A böngészőben futó ellenőrzés kényelmi funkció: a
 * `required` attribútumot bárki kikapcsolja a fejlesztői eszközökkel, a
 * végpontot pedig űrlap nélkül is meg lehet hívni. Amit ez a modul átenged, az
 * kerül lemezre — tehát minden mező típusát, hosszát és értékkészletét itt
 * kell megvizsgálni, nem az űrlapon.
 *
 * A visszatérés soha nem kivétel: a hívó route handlernek mezőre bontott
 * hibalistára van szüksége, hogy a felhasználó lássa, *melyik* mező rossz.
 */

export type FieldErrors = Record<string, string>;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

/**
 * Mezőhosszak.
 *
 * A felső korlát nem formai kérdés: korlát nélkül egy hurokba tett kérés
 * megabájtos üzenetekkel tölti meg az adatfájlt, és a lista megnyitása
 * időtúllépésbe fut. Az alsó korlát a nyilvánvalóan hamis kitöltést szűri.
 */
const LIMITS = {
  name: { min: 2, max: 80 },
  email: { min: 5, max: 160 },
  phone: { min: 7, max: 24 },
  vehicle: { min: 2, max: 80 },
  message: { min: 0, max: 1500 },
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,24}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Hány napra előre lehet foglalni. Ennél távolabbi dátum nem beosztás, hanem elgépelés. */
const MAX_DAYS_AHEAD = 180;

function text(raw: unknown): string {
  // A `\u0000` kiszűrése azért kell, mert a JSON elnyeli, a fájlt olvasó
  // eszközök viszont megakadhatnak rajta. A vezérlőkarakter itt szándékos —
  // pontosan azt keressük, amire a szabály figyelmeztetni szokott.
  // eslint-disable-next-line no-control-regex
  return typeof raw === 'string' ? raw.replace(/\u0000/g, '').trim() : '';
}

/**
 * A kért nap ellenőrzése.
 *
 * Az összehasonlítás **karakterláncon** történik, nem `Date` objektumokon. Egy
 * `new Date('2026-03-04')` UTC éjfélt jelent, a szerver viszont más
 * időzónában futhat — így egy mai dátum „tegnapinak" látszana, és a foglalás
 * indoklás nélkül elutasítaná. Az ISO dátum rendezhető, tehát a szöveges
 * összehasonlítás pontosan azt jelenti, amit gondolunk.
 */
function validateDate(value: string, errors: FieldErrors): void {
  if (!DATE_PATTERN.test(value)) {
    errors.date = 'Válassz napot.';
    return;
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;

  if (value < today) {
    errors.date = 'A kért nap nem lehet a múltban.';
    return;
  }

  const limit = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  const latest = `${limit.getFullYear()}-${`${limit.getMonth() + 1}`.padStart(2, '0')}-${`${limit.getDate()}`.padStart(2, '0')}`;

  if (value > latest) {
    errors.date = 'Legfeljebb fél évre előre tudunk időpontot rögzíteni.';
  }
}

export function validateBooking(input: unknown): ValidationResult<NewBooking> {
  const errors: FieldErrors = {};

  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: { form: 'Hiányzó adat.' } };
  }

  const raw = input as Record<string, unknown>;

  const name = text(raw.name);
  if (name.length < LIMITS.name.min) errors.name = 'Add meg a teljes neved.';
  else if (name.length > LIMITS.name.max) errors.name = 'A név túl hosszú.';

  const email = text(raw.email);
  if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email.max) {
    errors.email = 'Adj meg érvényes e-mail címet.';
  }

  const phone = text(raw.phone);
  if (!PHONE_PATTERN.test(phone)) errors.phone = 'Adj meg érvényes telefonszámot.';

  const vehicle = text(raw.vehicle);
  if (vehicle.length < LIMITS.vehicle.min) errors.vehicle = 'Írd be az autó típusát.';
  else if (vehicle.length > LIMITS.vehicle.max) errors.vehicle = 'A megnevezés túl hosszú.';

  const message = text(raw.message);
  if (message.length > LIMITS.message.max) errors.message = 'Az üzenet túl hosszú.';

  validateDate(text(raw.date), errors);

  const daypart = text(raw.daypart);
  if (daypart !== 'delelott' && daypart !== 'delutan') {
    errors.daypart = 'Válassz napszakot.';
  }

  // A szolgáltatás és a méret nem szabad szöveg: a lehetséges értékek a
  // tartalomból jönnek, tehát az ellenőrzés is onnan. Így egy új szolgáltatás
  // felvételekor nincs második lista, amit frissíteni kellene.
  const service = text(raw.service);
  if (!services.some((item) => item.slug === service)) {
    errors.service = 'Válassz szolgáltatást.';
  }

  const vehicleSize = text(raw.vehicleSize);
  if (!vehicleSizes.some((item) => item.id === vehicleSize)) {
    errors.vehicleSize = 'Válassz méretkategóriát.';
  }

  // A hozzájárulás nem adat, hanem feltétel: hiánya nem mezőhiba, hanem az,
  // hogy a foglalást nem vehetjük át.
  if (raw.consent !== true) {
    errors.consent = 'A foglaláshoz el kell fogadnod a feltételeket és a tájékoztatót.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      email,
      phone,
      vehicle,
      message,
      date: text(raw.date),
      daypart: daypart as NewBooking['daypart'],
      service,
      vehicleSize: vehicleSize as VehicleSizeId,
    },
  };
}
