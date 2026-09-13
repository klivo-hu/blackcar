import type { Metadata } from 'next';
import { Hero } from '@/components/sections/hero';
import { Pillars } from '@/components/sections/pillars';
import { ServicesGrid } from '@/components/sections/services-grid';
import { WorksTeaser } from '@/components/sections/works-teaser';
import { Faq } from '@/components/sections/faq';
import { BookingSection } from '@/components/sections/booking-section';
import { CtaBand } from '@/components/sections/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { faqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getSiteSettings } from '@/lib/store/settings';
import { telHref } from '@/lib/format';
import { site } from '@/lib/content/site';

export const metadata: Metadata = buildMetadata({
  title: `Autókozmetika ${site.city}ban — ${site.name}`,
  description: site.description,
  path: '/',
  absoluteTitle: true,
});

/**
 * A kezdőlap.
 *
 * **A felületek sorrendje itt dől el, egyetlen helyen.** Minden szekció a
 * *fölötte* lévő felületről érkezik (`from`), és ebből következik a határ
 * formája is. Ezért nem dönthet egy kapcsolható szekció saját magáról: ha a
 * foglalás szekció maga döntene a láthatóságáról, az alatta lévő záró
 * felhívás rossz színről indítaná a határát, és látható varrás maradna.
 *
 * A sorrend, és ami miatt épp ez:
 *
 *   obszidián  nyitóképernyő — a színpad, ahol a döntés elkezdődik
 *   grafit     miért mi — a munkamenet, mielőtt az árról lenne szó
 *   csont      szolgáltatások és árak — a világos felület olvasnivalónak való
 *   grafit     referenciák — a fotók sötét felületen ülnek a legjobban
 *   csont      kérdések és válaszok — megint olvasnivaló
 *   grafit     foglalás (ha be van kapcsolva)
 *   obszidián  záró felhívás, ami a láblécbe fut át
 *
 * Két szomszédos szekció soha nem azonos felületű — akkor a határ önmagába
 * rajzolna, és láthatatlan sávként csak helyet foglalna.
 */
export default async function HomePage() {
  const settings = await getSiteSettings();

  // A foglalás gombja két helyre mutathat, és ezt egyszer döntjük el: vagy a
  // foglalási szekcióra, vagy a telefonszámra. Két külön elágazás két külön
  // komponensben előbb-utóbb szétcsúszna.
  const bookingHref = settings.bookingEnabled ? '#idopontfoglalas' : telHref(settings.phone);
  const bookingLabel = settings.bookingEnabled ? 'Időpontfoglalás' : 'Hívjon minket';

  return (
    <>
      <JsonLd data={faqJsonLd()} />

      <Hero
        bookingEnabled={settings.bookingEnabled}
        bookingHref={bookingHref}
        bookingLabel={bookingLabel}
      />
      <Pillars from="obsidian" />
      <ServicesGrid from="graphite" tone="bone" />
      <WorksTeaser from="bone" />
      <Faq from="graphite" tone="bone" />

      {settings.bookingEnabled ? (
        <>
          <BookingSection from="bone" phone={settings.phone} />
          <CtaBand from="graphite" email={settings.email} phone={settings.phone} bookingEnabled />
        </>
      ) : (
        <CtaBand from="bone" email={settings.email} phone={settings.phone} bookingEnabled={false} />
      )}
    </>
  );
}
