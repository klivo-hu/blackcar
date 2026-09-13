import { cookies } from 'next/headers';
import {
  createSessionToken,
  isSecureRequest,
  sessionCookieName,
  sessionCookieOptions,
  SECURE_SESSION_COOKIE,
  SESSION_COOKIE,
} from '@/lib/auth/jwt';
import { verifyPassword, verifyUsername } from '@/lib/auth/password';
import { clientKey, rateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { isSameOrigin } from '@/lib/auth/session';

/**
 * Be- és kijelentkezés.
 *
 * **Ez a végpont kimarad a middleware kapujából** — muszáj, különben nem
 * lenne mód munkamenetet szerezni. Ezért minden ellenőrzés itt, kézzel
 * történik.
 *
 * **A hibaüzenet mindig ugyanaz.** „Hibás felhasználónév vagy jelszó" — soha
 * nem derül ki, melyik volt rossz. A `verifyUsername` és a `verifyPassword`
 * emellett időfüggetlenül hasonlít, tehát a *válaszidőből* sem lehet
 * visszafejteni, hogy létezik-e a felhasználó.
 *
 * **A sebességkorlát a tényleges védelem a jelszótöréssel szemben.** Öt
 * kísérlet tizenöt percenként IP-címenként; sikeres belépés után a számláló
 * nullázódik, hogy egy elgépelés ne büntesse a jogos használót.
 */

export const dynamic = 'force-dynamic';

/** Tizenöt percenként öt kísérlet. */
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store', ...headers },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return json({ error: 'Érvénytelen kérés.' }, 403);
  }

  const key = clientKey(request, 'belepes');
  const limit = rateLimit(key, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return json({ error: 'Túl sok sikertelen kísérlet. Próbáld újra később.' }, 429, {
      'retry-after': String(limit.retryAfterSeconds),
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Hibás kérés.' }, 400);
  }

  const { username, password } = (payload ?? {}) as Record<string, unknown>;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return json({ error: 'Hibás felhasználónév vagy jelszó.' }, 401);
  }

  // Mindkét ellenőrzés lefut, akkor is, ha az első már megbukott: a korai
  // kilépés mérhetően gyorsabb választ adna hibás felhasználónévre, és ebből
  // ki lehetne találni a helyeset.
  const userOk = verifyUsername(username);
  const passOk = await verifyPassword(password);

  if (!userOk || !passOk) {
    return json({ error: 'Hibás felhasználónév vagy jelszó.' }, 401);
  }

  resetRateLimit(key);

  const secure = isSecureRequest(request);
  const token = await createSessionToken(username);
  const store = await cookies();
  store.set(sessionCookieName(secure), token, sessionCookieOptions(secure));

  return json({ ok: true }, 200);
}

/**
 * Kijelentkezés.
 *
 * **Mindkét süti nevét töröljük**, nem csak az aktuális protokollhoz tartozót.
 * Egy telepítés menet közben átkerülhet HTTP-ről HTTPS-re (kiadott
 * tanúsítvány, elé tett proxy), és ilyenkor a másik néven maradt süti
 * ottragadna — a felhasználó kijelentkezne, mégis bent maradna.
 */
export async function DELETE(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return json({ error: 'Érvénytelen kérés.' }, 403);
  }

  const store = await cookies();
  for (const name of [SECURE_SESSION_COOKIE, SESSION_COOKIE]) {
    store.set(name, '', { ...sessionCookieOptions(isSecureRequest(request)), maxAge: 0 });
  }

  return json({ ok: true }, 200);
}
