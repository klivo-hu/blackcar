import { validateBooking } from '@/lib/validation';
import { createBooking } from '@/lib/store/bookings';
import { getSiteSettings } from '@/lib/store/settings';
import { clientKey, rateLimit } from '@/lib/auth/rate-limit';
import { isSameOrigin } from '@/lib/auth/session';

/**
 * Az időpontfoglalás fogadása.
 *
 * Ez az oldal egyetlen nyilvános írási végpontja, tehát a védelem itt
 * összpontosul. Négy réteg, mindegyik más támadást zár ki:
 *
 * 1. **A főkapcsoló.** Ha a foglalás ki van kapcsolva, a végpont nem létezőnek
 *    mutatja magát. Enélkül a kikapcsolás csak a felületet tüntetné el, az
 *    adatgyűjtés pedig továbbra is menne egy közvetlen kéréssel — pont az,
 *    amit a kapcsoló meg akar akadályozni.
 * 2. **Azonos origó.** Egy más oldalról érkező beküldés nem legitim.
 * 3. **Sebességkorlát.** Öt foglalás tíz percenként IP-címenként: a valós
 *    használatnak bőven elég, egy elárasztásnak nem.
 * 4. **Ellenőrzés.** A `lib/validation.ts` dönti el, mi kerülhet lemezre.
 *
 * A `force-dynamic` itt nem optimalizálási kérdés: a beállítás olvasása és az
 * írás futásidejű művelet.
 */

export const dynamic = 'force-dynamic';

/** Tíz percenként öt foglalás IP-címenként. */
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store', ...headers },
  });
}

export async function POST(request: Request): Promise<Response> {
  const settings = await getSiteSettings();

  // Kikapcsolt foglalásnál a végpont nem létezik. A 404 — és nem a 403 — azért
  // helyes, mert nincs miről tárgyalni: nem jogosultság hiányzik, hanem a
  // szolgáltatás nincs bekapcsolva.
  if (!settings.bookingEnabled) {
    return json({ error: 'Az online foglalás jelenleg nem elérhető.' }, 404);
  }

  if (!isSameOrigin(request)) {
    return json({ error: 'Érvénytelen kérés.' }, 403);
  }

  const limit = rateLimit(clientKey(request, 'foglalas'), LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return json(
      { error: 'Túl sok foglalási kísérlet. Próbálja újra később, vagy hívjon minket.' },
      429,
      { 'retry-after': String(limit.retryAfterSeconds) },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Hibás kérés.' }, 400);
  }

  const result = validateBooking(payload);
  if (!result.ok) {
    return json({ errors: result.errors }, 422);
  }

  try {
    await createBooking(result.value);
  } catch (error) {
    // A kivétel részletei a szerver naplójába mennek, nem a válaszba: egy
    // fájlrendszer-hiba szövege útvonalakat szivárogtatna ki.
    console.error('[foglalas] a mentés nem sikerült', error);
    return json({ error: 'A foglalást most nem sikerült rögzíteni. Kérjük, hívjon minket.' }, 500);
  }

  // A válasz szándékosan üres a nyugtán kívül: a felület mindent tud, amit
  // mutatnia kell, és egy visszaküldött rekord csak felesleges adatot tenne a
  // hálózatra.
  return json({ ok: true }, 201);
}
