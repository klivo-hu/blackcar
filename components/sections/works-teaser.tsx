import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { ButtonLink } from '@/components/ui/button';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { works } from '@/lib/content/works';

/**
 * Referencia-előzetes a kezdőlapon.
 *
 * Három elvégzett munka, autónként egy fotóval. A fotók **álló tájolásúak**,
 * mert telefonnal készültek a műhelyben — a rács ezt nem vágja fekvőre, hanem
 * erre épül. Egy 16:9-re nyírt álló fotóból pont az veszne el, ami rajta van.
 *
 * A kártyák **lépcsőzve** állnak: a középső lejjebb csúszik nagy nézeten. Egy
 * egyenes sor három álló képből merev lenne; az eltolás mozgást ad a rácsnak,
 * és a szem sorrendben olvassa őket, nem egyszerre.
 */
export function WorksTeaser({ from }: { from: SectionTone }) {
  return (
    <Section tone="graphite" from={from} labelledBy="referenciak-cim">
      <Container width="wide">
        <SectionHeading
          id="referenciak-cim"
          title="Elvégzett munkák"
          lead="Saját fotók, valódi megrendelések. Az ár, ami mellettük áll, a ténylegesen kifizetett összeg volt."
        >
          <ButtonLink href="/referenciak" variant="secondary" tone="dark" arrow>
            Összes referencia
          </ButtonLink>
        </SectionHeading>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work, index) => {
            const photo = work.photos[0];
            if (!photo) return null;

            return (
              <Reveal
                as="li"
                key={work.slug}
                variant="figure"
                delay={staggerDelay(index)}
                // A középső kártya lejjebb ül — csak ott, ahol három oszlop van.
                className={index === 1 ? 'lg:mt-14' : undefined}
              >
                <Link
                  href={`/referenciak#${work.slug}`}
                  className="group/work block overflow-hidden rounded-card border border-steel bg-slate transition-[transform,border-color] duration-ui ease-standard hover:-translate-y-1 hover:border-brass/50"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={photo.image}
                      alt={photo.alt}
                      placeholder="blur"
                      quality={82}
                      sizes="(min-width: 1024px) 30rem, (min-width: 640px) 45vw, 90vw"
                      className="h-full w-full object-cover transition-transform duration-page ease-standard group-hover/work:scale-[1.04]"
                    />
                    {/* A kép alját sötétítjük, hogy a rátett felirat mindig
                        olvasható legyen — a fotók világossága jelenetenként
                        más, és ezt nem bízhatjuk a szerencsére. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-obsidian to-transparent"
                    />
                    <span className="absolute bottom-4 left-4 right-4 font-display text-h5 uppercase tracking-wide text-on-dark">
                      {work.vehicle}
                    </span>
                  </div>

                  <dl className="flex items-baseline justify-between gap-4 px-5 py-4 text-body-sm">
                    <dt className="sr-only">Szolgáltatás</dt>
                    <dd className="text-on-dark-muted">{work.service}</dd>
                    <dt className="sr-only">Ár</dt>
                    <dd className="font-display text-h6 text-brass">{work.price} e Ft</dd>
                  </dl>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
