import { IntroCurtain } from '@/components/site/intro-curtain';
import { MotionDriver } from '@/components/motion/motion-driver';
import { SiteNav } from '@/components/site/site-nav';
import { SiteFooter } from '@/components/site/site-footer';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { getSiteSettings } from '@/lib/store/settings';

/**
 * A nyilvános oldal kerete.
 *
 * **`force-dynamic`, és ez szándékos.** Az elérhetőség és a foglalás
 * kapcsolója az adminból jön, tehát futásidejű adat. Build időben renderelve
 * az akkori értékek égnének bele a HTML-be, és onnantól semmilyen szerkesztés
 * nem látszana — a tünet néma lenne: a build sikeres, az oldal hiánytalan,
 * csak épp elavult. A tartalom zöme statikus konstans, tehát a dinamikus
 * renderelés ára itt elhanyagolható.
 *
 * A `JsonLd` a keretben van, nem oldalanként: a vállalkozás és a weboldal
 * leírása minden oldalon ugyanaz, és így nem tud két oldal két különböző
 * nyitvatartást állítani.
 */
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <JsonLd data={[localBusinessJsonLd(), websiteJsonLd()]} />

      {/* A kihagyó hivatkozás az első fókuszálható elem: billentyűzettel egy
          Tab visz a tartalomhoz, a teljes navigáció átlépésével. */}
      <a href="#main" className="skip-link">
        Ugrás a tartalomra
      </a>

      <IntroCurtain />
      <MotionDriver />

      <SiteNav bookingEnabled={settings.bookingEnabled} phone={settings.phone} />

      {/* A `intro-stage` osztály miatt a tartalom a függöny alól érkezik. A
          függöny nélkül (aloldal, csökkentett mozgás) ez az osztály semmit nem
          csinál — a CSS-ben a `[data-intro='run']` alatt él. */}
      <main id="main" className="intro-stage">
        {children}
      </main>

      <SiteFooter
        email={settings.email}
        phone={settings.phone}
        bookingEnabled={settings.bookingEnabled}
      />
    </>
  );
}
