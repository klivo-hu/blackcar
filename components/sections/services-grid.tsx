import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { formatRange, priceNote, services } from '@/lib/content/pricing';

/**
 * A három szolgáltatás, árral.
 *
 * A kártyák **nem egyformák**: a teljes takarítás — a leggyakoribb megrendelés
 * — szélesebb helyet kap és kiemelt keretet. Három azonos súlyú kártya nem
 * segít választani; a hangsúly maga is tanács.
 *
 * A kártya teljes felülete kattintható a „megnyújtott hivatkozás" mintával: a
 * cím hivatkozása egy áttetsző réteget feszít a kártyára. Így egyetlen
 * hivatkozás van a kártyán — nem három egymásba ágyazott —, a képernyőolvasó
 * pedig a cím szövegét olvassa fel, nem azt, hogy „hivatkozás, hivatkozás".
 */
export function ServicesGrid({ from, tone = 'bone' }: { from: SectionTone; tone?: SectionTone }) {
  const light = tone === 'bone';

  return (
    <Section tone={tone} from={from} labelledBy="szolgaltatasok-cim">
      <Container width="wide">
        <SectionHeading
          id="szolgaltatasok-cim"
          tone={light ? 'light' : 'dark'}
          title="Szolgáltatások"
          lead="Külön a külső, külön a belső, vagy a kettő egyben. Az ár a gépjármű méretétől és állapotától függ."
        >
          <ButtonLink
            href="/szolgaltatasok"
            variant="secondary"
            tone={light ? 'light' : 'dark'}
            arrow
          >
            Teljes árlista
          </ButtonLink>
        </SectionHeading>

        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            // A teljes takarítás a leggyakoribb választás: két oszlopot kap a
            // középső törésponton, hogy ne egy sorban harmadikként végezze.
            const featured = service.slug === 'teljes-takaritas';

            return (
              <Reveal
                as="li"
                key={service.slug}
                delay={staggerDelay(index)}
                className={featured ? 'md:col-span-2 lg:col-span-1' : undefined}
              >
                <Card
                  as="article"
                  tone={light ? 'light' : 'dark'}
                  interactive
                  className={[
                    'flex h-full flex-col',
                    featured && (light ? 'border-brass-deep/40' : 'border-brass/40'),
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <h3 className="text-h4">
                    <Link
                      href={`/szolgaltatasok#${service.slug}`}
                      // A megnyújtott hivatkozás: a `::after` kitölti a
                      // kártyát, tehát bárhol kattintható, de a fókuszgyűrű és
                      // a felolvasott szöveg a címé marad.
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {service.name}
                    </Link>
                  </h3>

                  <p className={`mt-3 text-body ${light ? 'text-muted' : 'text-on-dark-muted'}`}>
                    {service.summary}
                  </p>

                  <ul
                    className={`mt-6 flex-1 space-y-2.5 text-body-sm ${light ? 'text-ink-soft' : 'text-on-dark-muted'}`}
                  >
                    {service.includes.slice(0, 4).map((item) => (
                      <li key={item} className="flex gap-3">
                        <Mark light={light} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <dl
                    className={`mt-7 flex items-end justify-between border-t pt-5 ${light ? 'border-line' : 'border-steel'}`}
                  >
                    <div>
                      <dt className={`text-body-sm ${light ? 'text-muted' : 'text-on-dark-muted'}`}>
                        Ár
                      </dt>
                      <dd className="font-display text-h4">{formatRange(service.range)}</dd>
                    </div>
                    <div className="text-right">
                      <dt className={`text-body-sm ${light ? 'text-muted' : 'text-on-dark-muted'}`}>
                        Időtartam
                      </dt>
                      <dd className="font-display text-h5">{service.duration}</dd>
                    </div>
                  </dl>
                </Card>
              </Reveal>
            );
          })}
        </ul>

        <p
          className={`mt-8 max-w-prose text-body-sm ${light ? 'text-muted' : 'text-on-dark-muted'}`}
        >
          {priceNote}
        </p>
      </Container>
    </Section>
  );
}

/**
 * A tételjelölő: rövid ferde vonal, nem pipa.
 *
 * A pipa azt állítaná, hogy valami kész van; ez egy felsorolás jelölője. A
 * ferdeség ugyanaz a szög, ami a szekcióhatárokon és a nyitóképernyő fotóján
 * is visszatér.
 */
function Mark({ light }: { light: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 16"
      className={`mt-1.5 h-3.5 w-2.5 shrink-0 ${light ? 'text-brass-deep' : 'text-brass'}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <path d="M8 2 2 14" />
    </svg>
  );
}
