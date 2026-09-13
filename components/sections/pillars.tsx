import { Container } from '@/components/ui/container';
import { Section, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { pillars } from '@/lib/content/site';

/**
 * Amiért ide hozzák az autót.
 *
 * **Nem kártyarács.** Négy állítás fut egymás alatt egy vonalon, számozva,
 * ahogy egy munkalap tételei — a sorrend maga is információ, és a szem egy
 * oszlopban végigfut rajtuk ahelyett, hogy négy egyforma dobozt kellene
 * összehasonlítania.
 *
 * A bal oldali szám nem díszítés: ez a lista fogódzója, és ez adja a
 * szekciónak azt a ritmust, amit egy rács nem tudna.
 */
export function Pillars({ from }: { from: SectionTone }) {
  return (
    <Section tone="graphite" from={from} labelledBy="miert-cim">
      <Container width="wide">
        <SectionHeading
          id="miert-cim"
          title="Miért a Black Car"
          lead="Négy dolog, ami minden megrendelésnél ugyanúgy történik. Nem ígéret: ez a munkamenet."
        />

        <ol className="mt-14 border-t border-steel">
          {pillars.map((pillar, index) => (
            <Reveal
              as="li"
              key={pillar.title}
              delay={staggerDelay(index)}
              className="group/row grid gap-4 border-b border-steel py-8 sm:grid-cols-[4rem_1fr] sm:gap-8 lg:grid-cols-[6rem_22rem_1fr] lg:py-10"
            >
              <span
                aria-hidden="true"
                className="font-display text-h4 text-brass transition-transform duration-ui ease-standard group-hover/row:translate-x-1"
              >
                {`0${index + 1}`}
              </span>
              <h3 className="text-h5 text-on-dark">{pillar.title}</h3>
              <p className="max-w-prose text-body text-on-dark-muted sm:col-span-2 lg:col-span-1 lg:col-start-3">
                {pillar.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
