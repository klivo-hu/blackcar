import { Container } from '@/components/ui/container';
import { Section, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { faqs } from '@/lib/content/site';

/**
 * Kérdések és válaszok.
 *
 * **Natív `<details>`, nem kézzel írt lenyíló.** Így JavaScript nélkül is
 * működik, a billentyűzet és a képernyőolvasó pedig azt kapja, amit a
 * böngésző gyárilag tud — az „egyedi accordion" ennek legfeljebb a
 * közelítése, és általában rosszabb. A nyitás-zárás simítását a
 * `::details-content` átmenete adja (lásd `globals.css`); ahol a böngésző ezt
 * nem ismeri, ott a lenyíló egyszerűen azonnal nyílik, és semmi nem romlik el.
 *
 * Ugyanez a lista adja a `FAQPage` strukturált adatot: egy kérdés egy helyen
 * van leírva, tehát a keresőnek mutatott válasz nem tud eltérni attól, amit a
 * látogató olvas.
 *
 * A szekció tónusa paraméter, mert a kezdőlapon és a szolgáltatások oldalon is
 * szerepel, de más felületre kerül — a felületek váltakozásának szabályát az
 * oldal tartja be, nem a szekció.
 */
export function Faq({
  from,
  tone = 'bone',
  title = 'Kérdések és válaszok',
  lead = 'A leggyakoribb kérdések, teljes válasszal. Ha valami kimaradt, hívjon minket.',
}: {
  from: SectionTone;
  tone?: SectionTone;
  title?: string;
  lead?: string;
}) {
  const light = tone === 'bone';

  return (
    <Section tone={tone} from={from} labelledBy="gyik-cim">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <SectionHeading
            id="gyik-cim"
            tone={light ? 'light' : 'dark'}
            title={title}
            lead={lead}
            className="lg:sticky lg:top-28 lg:block lg:self-start"
          />

          <ul className={`border-t ${light ? 'border-line' : 'border-steel'}`}>
            {faqs.map((faq, index) => (
              <Reveal
                as="li"
                key={faq.question}
                delay={staggerDelay(index, 40)}
                className={`border-b ${light ? 'border-line' : 'border-steel'}`}
              >
                <details className="faq group/faq">
                  <summary
                    className={`flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-h5 transition-colors duration-ui ease-standard ${
                      light ? 'text-ink hover:text-brass-deep' : 'text-on-dark hover:text-brass'
                    }`}
                  >
                    {faq.question}
                    <Chevron light={light} />
                  </summary>
                  <div className="faq__body">
                    <p
                      className={`max-w-prose pb-7 text-body ${light ? 'text-muted' : 'text-on-dark-muted'}`}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

/**
 * A nyitás jele: pluszjelből mínuszjel.
 *
 * A függőleges szár forog el nyitáskor, tehát egyetlen `transform` animál. A
 * lefelé mutató nyíl helyett azért plusz/mínusz, mert az „több szöveg /
 * kevesebb szöveg" viszonyt mondja ki, nem irányt.
 */
function Chevron({ light }: { light: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative mt-2 block h-4 w-4 shrink-0 ${light ? 'text-brass-deep' : 'text-brass'}`}
    >
      <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current" />
      <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-current transition-transform duration-ui ease-standard group-open/faq:rotate-90" />
    </span>
  );
}
