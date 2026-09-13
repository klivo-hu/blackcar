import { Container } from '@/components/ui/container';
import { Section, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { ButtonExternal } from '@/components/ui/button';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { bundleTerms, bundles, formatThousands, maintenanceService } from '@/lib/content/pricing';
import { telHref } from '@/lib/format';

/**
 * A féléves és az éves csomag, valamint a fenntartó takarítás.
 *
 * **A fenntartó takarítás itt van, és nem a szolgáltatások között.** A korábbi
 * oldalon árazatlan kártyaként állt a három rendelhető szolgáltatás mellett,
 * ami félreérthető: úgy nézett ki, mint egy negyedik választható csomag,
 * miközben önállóan nem rendelhető. Itt a saját helyén van — a csomagok
 * magyarázataként —, és ki is mondja magáról, hogy mi.
 *
 * A csomagok **csak telefonon** köthetők, ezért a gomb telefonhívás, nem
 * foglalás. Ez akkor is így van, ha a foglalási rendszer be van kapcsolva: az
 * űrlap egyszeri időpontra való, egy féléves konstrukcióhoz pedig beszélni
 * kell.
 */
export function Bundles({ from, phone }: { from: SectionTone; phone: string }) {
  return (
    <Section tone="graphite" from={from} labelledBy="csomagok-cim">
      <Container width="wide">
        <SectionHeading
          id="csomagok-cim"
          title="Féléves és éves csomag"
          lead="A rendszeresen ápolt autót kevesebb munka rendben tartani — ezt a csomagok ára is tükrözi."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr_20rem]">
          {bundles.map((bundle, index) => (
            <Reveal as="div" key={bundle.slug} delay={staggerDelay(index)}>
              <Card tone="dark" className="flex h-full flex-col border-brass/30">
                <h3 className="text-h4 text-on-dark">{bundle.name}</h3>
                <p className="mt-2 text-body-sm text-on-dark-muted">{bundle.period}</p>

                <ul className="mt-6 flex-1 space-y-2.5 text-body text-on-dark-muted">
                  {bundle.includes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 10 16"
                        className="mt-1.5 h-3.5 w-2.5 shrink-0 text-brass"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="square"
                      >
                        <path d="M8 2 2 14" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-7 border-t border-steel pt-5">
                  <dt className="text-body-sm text-on-dark-muted">Csomagár</dt>
                  <dd className="font-display text-h3 text-on-dark">
                    {formatThousands(bundle.price)}
                  </dd>
                  <dt className="sr-only">Megtakarítás</dt>
                  <dd className="mt-2 text-body-sm text-brass">
                    Akár {formatThousands(bundle.saving)} megtakarítás
                  </dd>
                </dl>

                <ButtonExternal
                  href={telHref(phone)}
                  variant="primary"
                  tone="dark"
                  className="mt-6 w-full"
                >
                  Egyeztetés telefonon
                </ButtonExternal>
              </Card>
            </Reveal>
          ))}

          <Reveal as="div" delay={staggerDelay(2)}>
            <Card tone="dark" className="flex h-full flex-col">
              <h3 className="text-h5 text-on-dark">{maintenanceService.name}</h3>
              <p className="mt-3 text-body-sm text-on-dark-muted">{maintenanceService.summary}</p>
              <ul className="mt-5 flex-1 space-y-2 text-body-sm text-on-dark-muted">
                {maintenanceService.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>

        <p className="mt-8 max-w-prose text-body-sm text-on-dark-muted">{bundleTerms}</p>
      </Container>
    </Section>
  );
}
