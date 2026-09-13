import { NextResponse, type NextRequest } from 'next/server';
import { readSessionCookie, verifySessionToken } from '@/lib/auth/jwt';

/**
 * Az admin kapu.
 *
 * Ez a szélen (edge) fut, még mielőtt bármelyik admin oldal vagy API végpont
 * elérhető lenne — így egy azonosítatlan kérés soha nem éri el az adattárat, és
 * nem jut el odáig, hogy egy hibaüzeneten keresztül adat szivárogjon ki.
 *
 * Ez a kettőből az *első* réteg. Minden admin oldal külön meghívja a
 * `requireSession()`-t, és minden admin végpont a `requireApiSession()`-t —
 * tehát ha egy útvonal kiesik az alábbi mintából, az teljesítményt ront, nem
 * biztonságot.
 *
 * Kétféle válasz, aszerint, hogy a hívó mit tud kezdeni vele:
 * - `/api/admin/*` → 401 JSON. Egy HTML belépő oldalt a kliens sikertelen API
 *   válaszként értelmezne, és zavaros hibát mutatna.
 * - minden más → 303 átirányítás a belépő oldalra, az eredeti útvonallal, hogy
 *   belépés után oda kerüljön a felhasználó, ahová indult.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // A belépő oldalnak és a munkamenet végpontnak elérhetőnek kell maradnia,
  // különben nincs mód munkamenetet szerezni.
  if (pathname === '/admin/belepes' || pathname === '/api/admin/session') {
    return NextResponse.next();
  }

  const session = await verifySessionToken(readSessionCookie(request.cookies));

  if (session) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Nincs jogosultság. Jelentkezz be újra.' },
      { status: 401, headers: { 'cache-control': 'no-store' } },
    );
  }

  const loginUrl = new URL('/admin/belepes', request.url);
  // Csak az útvonalat visszük tovább, soha nem abszolút URL-t — az utóbbi
  // nyílt átirányítássá tenné a belépő oldalt.
  if (pathname !== '/admin') {
    loginUrl.searchParams.set('tovabb', `${pathname}${search}`);
  }

  return NextResponse.redirect(loginUrl, 303);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
