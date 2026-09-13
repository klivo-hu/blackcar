import type { Metadata } from 'next';
import stageImage from '@/assets/stage/szolgaltatasok.jpg';
import { PageHeader } from '@/components/site/page-header';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { ServiceDetail } from '@/components/sections/service-detail';
import { Bundles } from '@/components/sections/bundles';
import { Faq } from '@/components/sections/faq';
import { CtaBand } from '@/components/sections/cta-band';
import { ButtonExternal, ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getSiteSettings } from '@/lib/store/settings';
import { priceNote, services, vehicleSizes } from '@/lib/content/pricing';
import { site } from '@/lib/content/site';
import { telHref } from '@/lib/format';

export const metadata: Metadata = buildMetadata({
  title: `Autókozmetika árak ${site.city}ban — külső, belső és teljes takarítás`,
  description:
    'Külső takarítás 15 ezertől, belső 20 ezertől, teljes takarítás 40 ezer forinttól ' +
    `${site.city}ban. Méret szerinti árak városi autóra, kombira, egyterűre és ` +
    'kisteherautóra, féléves és éves csomaggal.',
  path: '/szolgaltatasok',
});

/**
 * Szolgáltatások és árak.
 *
 * **Ez az oldal a döntés helye**, ezért minden itt van, ami az árhoz kell: a
 * csomagok tartalma, a méret szerinti bontás, az időtartam, a csomagajánlatok
 * és a kérdések. Aki idáig eljut, ne kelljen egy negyedik oldalra átmennie
 * azért, hogy megtudja, mibe kerül az autója.
 *
 * A felületek sorrendje — obszidián → csont → grafit → csont → obszidián —
 * ugyanaz a váltakozó rend, mint a kezdőlapon, tehát a határok formája is
 * magától következik.
 */
export default async function ServicesPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(),
          breadcrumbJsonLd([
            { name: 'Kezdőlap', path: '/' },
            { name: 'Szolgáltatások és árak', path: '/szolgaltatasok' },
          ]),
        ]}
      />

      <PageHeader
        id="szolgaltatasok-cim"
        title="Szolgáltatások és árak"
        lead={`Három szolgáltatás, kimondott árral és időtartammal. Az ár a gépjármű méretéből és állapotából adódik — nem utólag derül ki.`}
        image={stageImage}
      >
        {settings.bookingEnabled ? (
          <ButtonLink href="/#idopontfoglalas" variant="primary" tone="dark" size="lg">
            Időpontfoglalás
          </ButtonLink>
        ) : (
          <ButtonExternal href={telHref(settings.phone)} variant="primary" tone="dark" size="lg">
            {settings.phone}
          </ButtonExternal>
        )}
        <ButtonLink href="/referenciak" variant="secondary" tone="dark" size="lg" arrow>
          Elvégzett munkák
        </ButtonLink>
      </PageHeader>

      <Section tone="bone" from="obsidian" labelledBy="reszletek-cim">
        <Container width="wide">
          <h2 id="reszletek-cim" className="sr-only">
            A szolgáltatások részletesen
          </h2>

          {/* Méretkategóriák egyszer, a táblázatok fölött. Enélkül minden
              árlistánál el kellene magyarázni, mit jelent a „kombi". */}
          <dl className="grid gap-x-8 gap-y-4 border-b border-line pb-10 sm:grid-cols-2 lg:grid-cols-4">
            {vehicleSizes.map((size) => (
              <div key={size.id}>
                <dt className="font-display text-h6 uppercase tracking-wide text-ink">
                  {size.label}
                </dt>
                <dd className="mt-1 text-body-sm text-muted">{size.note}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-14 space-y-16 lg:space-y-24">
            {services.map((service, index) => (
              <ServiceDetail key={service.slug} service={service} index={index} />
            ))}
          </div>

          <p className="mt-14 max-w-prose border-t border-line pt-8 text-body-sm text-muted">
            {priceNote}
          </p>
        </Container>
      </Section>

      <Bundles from="bone" phone={settings.phone} />

      <Faq
        from="graphite"
        tone="bone"
        title="Mielőtt behozza"
        lead="A leggyakoribb kérdések az árról, az időtartamról és a helyszínről."
      />

      <CtaBand
        from="bone"
        email={settings.email}
        phone={settings.phone}
        bookingEnabled={settings.bookingEnabled}
      />
    </>
  );
}
