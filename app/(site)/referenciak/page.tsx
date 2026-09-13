import type { Metadata } from 'next';
import stageImage from '@/assets/stage/referenciak.jpg';
import { PageHeader } from '@/components/site/page-header';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/heading';
import { WorkGallery } from '@/components/works/work-gallery';
import { CtaBand } from '@/components/sections/cta-band';
import { ButtonLink } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/cn';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd, worksJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getSiteSettings } from '@/lib/store/settings';
import { works } from '@/lib/content/works';
import { site } from '@/lib/content/site';

export const metadata: Metadata = buildMetadata({
  title: 'Elvégzett munkák — referenciák',
  description:
    `Valódi munkák a ${site.name} műhelyéből ${site.city}ban: Alfa Romeo MiTo, ` +
    'Citroën C4 és Ford Mondeo belső és teljes takarítása, saját fotókkal és a ' +
    'ténylegesen kifizetett árral.',
  path: '/referenciak',
});

/**
 * Referenciák.
 *
 * **Csak valódi munkák, saját fotókkal.** Nincs „előtte" felvétel, mert olyan
 * nem készült; egy utólag sötétített „előtte" kép hazugság lenne. Amit a
 * látogató lát, az az átadott állapot — és mellette az az összeg, amit az
 * ügyfél ténylegesen fizetett.
 *
 * A lapon **nincs vélemény és nincs csillagos értékelés**. Ha lesz valódi
 * visszajelzés, annak itt a helye; kitalálni egyet a bizalom ellentéte.
 *
 * A munkák váltakozó oldalon állnak, mert három egyforma, azonos elrendezésű
 * blokk egymás alatt katalógusnak látszana, nem elbeszélésnek. A váltakozást a
 * `order` végzi, tehát a DOM sorrendje mindenhol ugyanaz marad.
 */
export default async function WorksPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <JsonLd
        data={[
          worksJsonLd(),
          breadcrumbJsonLd([
            { name: 'Kezdőlap', path: '/' },
            { name: 'Referenciák', path: '/referenciak' },
          ]),
        ]}
      />

      <PageHeader
        id="referenciak-oldal-cim"
        title="Elvégzett munkák"
        lead="Néhány autó, ami a közelmúltban megfordult nálunk. A fotók sajátok, az árak azok, amiket az ügyfél fizetett."
        image={stageImage}
      >
        <ButtonLink href="/szolgaltatasok" variant="primary" tone="dark" size="lg" arrow>
          Szolgáltatások és árak
        </ButtonLink>
      </PageHeader>

      <Section tone="bone" from="obsidian" labelledBy="munkak-cim" id="lista">
        <Container width="wide">
          <h2 id="munkak-cim" className="sr-only">
            A munkák listája
          </h2>

          <ul className="space-y-20 lg:space-y-30">
            {works.map((work, index) => (
              <Reveal
                as="li"
                key={work.slug}
                id={work.slug}
                className="scroll-mt-28 border-t border-line pt-12 first:border-t-0 first:pt-0"
              >
                <article className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
                  {/* Váltakozó oldal: minden második munkánál a galéria kerül
                      balra. Az elrendezést a `order` állítja, nem a DOM
                      sorrendje — így a felolvasás és a Tab-sorrend mindenhol
                      ugyanaz marad: előbb a leírás, utána a fotók. */}
                  <div className={cn('lg:sticky lg:top-28', index % 2 === 1 && 'lg:order-2')}>
                    <h3 className="text-h2 text-ink">{work.vehicle}</h3>

                    <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-3">
                      <div>
                        <dt className="text-body-sm text-muted">Kategória</dt>
                        <dd className="mt-1 font-display text-h6 uppercase tracking-wide text-ink">
                          {work.category}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-body-sm text-muted">Szolgáltatás</dt>
                        <dd className="mt-1 font-display text-h6 uppercase tracking-wide text-ink">
                          {work.service}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-body-sm text-muted">Fizetett ár</dt>
                        <dd className="mt-1 font-display text-h6 uppercase tracking-wide text-brass-deep">
                          {work.price} e Ft
                        </dd>
                      </div>
                    </dl>

                    <p className="mt-7 max-w-prose text-body-lg text-muted">{work.summary}</p>
                  </div>

                  <div className={index % 2 === 1 ? 'lg:order-1' : undefined}>
                    <WorkGallery work={work} />
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="graphite" from="bone" labelledBy="menet-cim">
        <Container width="wide">
          <SectionHeading
            id="menet-cim"
            title="Így zajlik egy megrendelés"
            lead="Négy lépés, az egyeztetéstől az átadásig. Nincs benne meglepetés — az ár és az időpont a munka megkezdése előtt eldől."
          />

          <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Egyeztetés',
                body: 'Telefonon vagy a közösségi oldalakon megbeszéljük, milyen autóról van szó és mire van szüksége.',
              },
              {
                title: 'Átvétel és ár',
                body: 'Az autó átvételekor megnézzük az állapotát, és kimondjuk a végleges árat. Ez utólag nem változik.',
              },
              {
                title: 'A munka',
                body: 'A csomag tételei sorra, kézzel. A külső 2–3, a belső 4–5 óra, mérettől függően.',
              },
              {
                title: 'Átadás',
                body: 'Közösen végignézzük az elkészült autót. Ha valami maradt, ott helyben javítjuk.',
              },
            ].map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 60}>
                <span
                  aria-hidden="true"
                  className="font-display text-h3 text-brass"
                >{`0${index + 1}`}</span>
                <h3 className="mt-3 text-h5 text-on-dark">{step.title}</h3>
                <p className="mt-3 text-body text-on-dark-muted">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <CtaBand
        from="graphite"
        email={settings.email}
        phone={settings.phone}
        bookingEnabled={settings.bookingEnabled}
      />
    </>
  );
}
