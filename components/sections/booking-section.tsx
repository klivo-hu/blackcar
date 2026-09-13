import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { BookingForm } from '@/components/sections/booking-form';
import { openingHours } from '@/lib/content/site';
import { telHref } from '@/lib/format';

/**
 * Az időpontfoglalás szekció.
 *
 * **Csak akkor kerül a lapra, ha a foglalás be van kapcsolva.** A döntést az
 * oldal hozza meg, nem ez a komponens — egy kapcsolható szekció, ami maga dönt
 * a láthatóságáról, rossz felületről indítaná az alatta lévő szekció határát,
 * és látható varrás maradna (lásd `components/ui/section.tsx`).
 *
 * A bal oldalon az áll, amit a látogatónak a kitöltés *előtt* tudnia kell:
 * mi történik a beküldés után, mikor dolgozunk, és hogy telefonon is lehet.
 * Ezek nélkül az űrlap egy fekete doboz, amibe az ember nem szívesen ír bele.
 */
export function BookingSection({ from, phone }: { from: SectionTone; phone: string }) {
  return (
    <Section id="idopontfoglalas" tone="graphite" from={from} labelledBy="foglalas-cim">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[24rem_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              id="foglalas-cim"
              title="Időpontfoglalás"
              lead="Küldje el, mire van szüksége, és mikor lenne jó. Visszahívjuk, egyeztetjük az árat és az időt."
            />

            <ol className="mt-10 space-y-5">
              {[
                'Elküldi a kérését ezen az űrlapon.',
                'Felhívjuk a megadott számon, és egyeztetjük az időpontot.',
                'A foglalás a visszahívással válik véglegessé.',
              ].map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-pill border border-brass/50 font-display text-body-sm text-brass"
                  >
                    {index + 1}
                  </span>
                  <span className="text-body text-on-dark-muted">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-steel pt-6 text-body-sm text-on-dark-muted">
              <p>
                Inkább telefonálna?{' '}
                <a
                  href={telHref(phone)}
                  className="text-brass underline underline-offset-4 transition-colors duration-ui ease-standard hover:text-on-dark"
                >
                  {phone}
                </a>
              </p>
              <p className="mt-3">
                {openingHours
                  .filter((entry) => entry.from)
                  .map((entry) => `${entry.days}: ${entry.from} – ${entry.to}`)
                  .join(' · ')}
              </p>
              <p className="mt-3">
                Adatait a{' '}
                <Link
                  href="/jogi/adatkezelesi-tajekoztato"
                  className="underline underline-offset-4 transition-colors duration-ui ease-standard hover:text-on-dark"
                >
                  tájékoztatóban
                </Link>{' '}
                leírtak szerint kezeljük. Hirdetési célra nem adjuk tovább.
              </p>
            </div>
          </div>

          <BookingForm />
        </div>
      </Container>
    </Section>
  );
}
