import type { Metadata } from 'next';

/**
 * Az admin gyökere.
 *
 * A `noindex` itt is ki van mondva, pedig a `next.config.mjs` már küld
 * `X-Robots-Tag` fejlécet az `/admin/*` útvonalakra. A kettő nem
 * fölösleges ismétlés: a fejléc a HTTP válaszon utazik, a meta címke a
 * dokumentumban — egy félrekonfigurált proxy az egyiket elnyelheti.
 *
 * A `dynamic = 'force-dynamic'` azt zárja ki, hogy egy admin oldal bármelyik
 * változata gyorsítótárba kerüljön. Egy előrenderelt admin lap a legrosszabb
 * fajta hiba: sikeresnek látszik, és közben más adatát mutatja.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Szerkesztés',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
