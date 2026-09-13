import Image from 'next/image';
import ctaStage from '@/assets/stage/cta.jpg';
import { Container } from '@/components/ui/container';
import { SectionDivider, type Surface } from '@/components/divider/section-divider';
import { ButtonExternal, ButtonLink } from '@/components/ui/button';
import { SocialLinks } from '@/components/site/social-links';
import { openingHours, site } from '@/lib/content/site';
import { telHref } from '@/lib/format';

/**
 * A záró felhívás.
 *
 * **Itt nincs űrlap.** Ha a foglalás ki van kapcsolva, ez a szekció a lap
 * utolsó szava: telefonszám, e-mail cím, közösségi oldalak és a munkarend —
 * pontosan az, amivel a látogató el tud indulni. Bekapcsolt foglalás mellett
 * a foglalási szekció áll fölötte, és ez marad a másodlagos út annak, aki
 * inkább telefonál.
 *
 * A szekció nem `Section`-t használ, mert **nincs alsó térköze**: közvetlenül
 * a láblécbe fut át, ugyanazon a felületen. A kettő együtt alkotja a lap
 * lezárását, nem két külön fekete sáv egymás alatt.
 */
export function CtaBand({
  from,
  email,
  phone,
  bookingEnabled,
}: {
  from: Surface;
  email: string;
  phone: string;
  bookingEnabled: boolean;
}) {
  return (
    <>
      <SectionDivider from={from} to="obsidian" />
      <section
        aria-labelledby="kapcsolat-cim"
        data-surface="obsidian"
        data-sheen
        className="relative isolate overflow-hidden bg-obsidian py-20 md:py-24 lg:py-30"
      >
        <Image
          src={ctaStage}
          alt=""
          aria-hidden="true"
          quality={82}
          sizes="100vw"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen"
          style={{
            background:
              'radial-gradient(32rem 32rem at var(--sheen-x, 30%) var(--sheen-y, 50%), rgb(var(--brass) / 0.15), transparent 65%)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-obsidian/90 via-obsidian/75 to-obsidian"
        />

        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-end lg:gap-16">
            <div>
              <h2 id="kapcsolat-cim" className="text-h2 text-on-dark">
                Hozza be az autót {site.city}ba
              </h2>
              <p className="mt-6 max-w-prose text-body-lg text-on-dark-muted">
                Mondja el, milyen autóról van szó és mire van szüksége — megmondjuk az árat és azt,
                mikorra lesz kész.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonExternal href={telHref(phone)} variant="primary" tone="dark" size="lg">
                  {phone}
                </ButtonExternal>
                {bookingEnabled ? (
                  <ButtonLink href="/#idopontfoglalas" variant="secondary" tone="dark" size="lg">
                    Időpontfoglalás
                  </ButtonLink>
                ) : null}
              </div>
            </div>

            <dl className="grid gap-8 sm:grid-cols-2">
              <div>
                <dt className="text-h6 uppercase tracking-[0.12em] text-brass">E-mail</dt>
                <dd className="mt-3">
                  <a
                    href={`mailto:${email}`}
                    className="break-all text-body text-on-dark transition-colors duration-ui ease-standard hover:text-brass"
                  >
                    {email}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-h6 uppercase tracking-[0.12em] text-brass">Munkarend</dt>
                <dd className="mt-3 space-y-1 text-body text-on-dark-muted">
                  {openingHours.map((entry) => (
                    <span key={entry.days} className="block">
                      {entry.days}: {entry.from ? `${entry.from} – ${entry.to}` : 'zárva'}
                    </span>
                  ))}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-h6 uppercase tracking-[0.12em] text-brass">
                  Közösségi oldalak
                </dt>
                <dd className="mt-3">
                  <SocialLinks />
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>
    </>
  );
}
