import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { LogoMark } from '@/components/site/logo';
import { SocialLinks } from '@/components/site/social-links';
import { legalPages } from '@/lib/content/legal-pages';
import { openingHours, serviceArea, site } from '@/lib/content/site';
import { telHref } from '@/lib/format';

/**
 * A lábléc.
 *
 * Négy oszlop: a márka, az elérhetőség, a navigáció és a vonzáskörzet. Az
 * utolsó nem díszítés: a „Hatvan és környéke" keresésekre ez a felsorolás a
 * tényleges válasz, és minden benne szereplő település 20 km-en belül van.
 *
 * **A jogi hivatkozások csak bekapcsolt foglalás mellett jelennek meg.** Amíg
 * az oldal egyetlen személyes adatot sem vesz át, nincs miről tájékoztatni, és
 * egy ott álló adatkezelési tájékoztató azt sugallná, hogy mégis gyűjtünk
 * valamit. A döntést az oldal hozza meg és adja le propként — a lábléc nem
 * olvas a tárolóból.
 */
export function SiteFooter({
  email,
  phone,
  bookingEnabled,
}: {
  email: string;
  phone: string;
  bookingEnabled: boolean;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-obsidian text-on-dark" data-surface="obsidian">
      <Container width="wide" className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <LogoMark className="h-auto w-40 text-on-dark" />
            <p className="mt-5 max-w-xs text-body-sm text-on-dark-muted">
              {site.tagline}. Teljes külső és belső ápolás személyautótól a kisteherautóig, méret
              szerinti, előre kimondott áron.
            </p>
            <SocialLinks className="mt-6" />
          </div>

          <div>
            <h2 className="text-h6 uppercase tracking-[0.12em] text-brass">Elérhetőség</h2>
            <ul className="mt-4 space-y-3 text-body-sm">
              <li>
                <a
                  href={telHref(phone)}
                  className="text-on-dark transition-colors duration-ui ease-standard hover:text-brass"
                >
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="break-all text-on-dark transition-colors duration-ui ease-standard hover:text-brass"
                >
                  {email}
                </a>
              </li>
              <li className="pt-2 text-on-dark-muted">
                {openingHours.map((entry) => (
                  <span key={entry.days} className="block">
                    {entry.days}: {entry.from ? `${entry.from} – ${entry.to}` : 'Zárva'}
                  </span>
                ))}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-h6 uppercase tracking-[0.12em] text-brass">Navigáció</h2>
            <ul className="mt-4 space-y-3 text-body-sm">
              {[
                { href: '/', label: 'Kezdőlap' },
                { href: '/szolgaltatasok', label: 'Szolgáltatások és árak' },
                { href: '/referenciak', label: 'Referenciák' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-on-dark-muted transition-colors duration-ui ease-standard hover:text-on-dark"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {bookingEnabled
                ? legalPages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={`/jogi/${page.slug}`}
                        className="text-on-dark-muted transition-colors duration-ui ease-standard hover:text-on-dark"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))
                : null}
            </ul>
          </div>

          <div>
            <h2 className="text-h6 uppercase tracking-[0.12em] text-brass">Hatvan és környéke</h2>
            <p className="mt-4 text-body-sm text-on-dark-muted">{serviceArea.join(' · ')}</p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-steel pt-8 text-body-sm text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p>Az oldalon szereplő fotók a vállalkozás saját munkáiról készültek.</p>
        </div>
      </Container>
    </footer>
  );
}
