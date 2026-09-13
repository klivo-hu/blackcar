import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { CtaBand } from '@/components/sections/cta-band';
import { buildMetadata } from '@/lib/seo/metadata';
import { getSiteSettings } from '@/lib/store/settings';
import { getLegalDocument, legalPages, type LegalBlock } from '@/lib/content/legal-pages';

/**
 * A jogi tájékoztatók.
 *
 * **A lap akkor is elérhető, ha a foglalás ki van kapcsolva** — csak nem
 * hivatkozik rá semmi, és `noindex` alatt áll. Ez szándékos: a dokumentumok
 * készen vannak, a bekapcsolás pillanatában azonnal működnek, de amíg az oldal
 * egyetlen személyes adatot sem vesz át, egy indexelt adatkezelési tájékoztató
 * azt sugallná, hogy mégis gyűjtünk valamit.
 *
 * A `generateStaticParams` szándékosan **nincs itt**: a tájékoztató szövege az
 * adminból jövő elérhetőséget és a `.env` cégadatait tartalmazza, tehát
 * futásidejű adat. Statikusan generálva a build pillanatának értékei égnének
 * bele a HTML-be. (A keret `force-dynamic`-ját a `generateStaticParams`
 * felülírná — ezért nem elég a keretre bízni.)
 */

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const document = getLegalDocument(slug, settings);

  if (!document) return buildMetadata({ title: 'Nem található', description: '', noIndex: true });

  return buildMetadata({
    title: document.title,
    description: document.description,
    path: `/jogi/${document.slug}`,
    // Amíg nincs foglalás, nincs mit indexelni: a lap létezik, de nem
    // keresőtalálat.
    noIndex: !settings.bookingEnabled,
  });
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const document = getLegalDocument(slug, settings);

  if (!document) notFound();

  return (
    <>
      <Section tone="obsidian" className="pt-36 md:pt-44" labelledBy="jogi-cim">
        <Container width="prose">
          <p className="text-body-sm text-on-dark-muted">
            <Link
              href="/"
              className="underline underline-offset-4 transition-colors duration-ui ease-standard hover:text-on-dark"
            >
              Kezdőlap
            </Link>
            {' / '}
            <span>Jogi tájékoztatók</span>
          </p>

          <h1 id="jogi-cim" className="mt-6 text-h1 text-on-dark">
            {document.title}
          </h1>
          <p className="mt-5 text-body-lg text-on-dark-muted">{document.description}</p>

          {/* A társdokumentumok itt vannak, nem csak a láblécben: aki az egyiket
              olvassa, jó eséllyel a másikat is keresi. */}
          <ul className="mt-9 flex flex-wrap gap-3">
            {legalPages
              .filter((page) => page.slug !== document.slug)
              .map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/jogi/${page.slug}`}
                    className="inline-flex rounded-pill border border-steel px-4 py-2 text-body-sm text-on-dark-muted transition-colors duration-ui ease-standard hover:border-brass/50 hover:text-on-dark"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
          </ul>
        </Container>
      </Section>

      <Section tone="bone" from="obsidian">
        <Container width="prose">
          <div className="space-y-12">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-h4 text-ink">{section.heading}</h2>
                <div className="mt-5 space-y-5">
                  {section.blocks.map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-14 border-t border-line pt-8 text-body-sm text-muted">
            Ez a dokumentum tájékoztató jellegű minta. A végleges szöveget a közzététel előtt jogi
            szakemberrel javasolt átnézetni.
          </p>
        </Container>
      </Section>

      <CtaBand
        from="bone"
        email={settings.email}
        phone={settings.phone}
        bookingEnabled={settings.bookingEnabled}
      />
    </>
  );
}

/**
 * Egy szakasz egy blokkja.
 *
 * Három blokktípus van, és mind a három tipizált — nincs Markdown elemző és
 * nincs `dangerouslySetInnerHTML`. Így a jogi szöveg nem tud véletlenül
 * markuppá válni.
 */
function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return <p className="text-body text-ink-soft">{block.text}</p>;

    case 'list':
      return (
        <ul className="space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-body text-ink-soft">
              <span aria-hidden="true" className="mt-2.5 h-1 w-3 shrink-0 bg-brass-deep" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'definitions':
      return (
        <dl className="divide-y divide-line border-y border-line">
          {block.items.map((item) => (
            <div key={item.term} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-body-sm font-medium text-muted">{item.term}</dt>
              <dd className="text-body text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      );

    default:
      return null;
  }
}
