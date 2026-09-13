'use client';

import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { formatRange, services } from '@/lib/content/pricing';
import { ButtonLink } from '@/components/ui/button';

/**
 * A nyitóképernyő alján futó szolgáltatásválasztó.
 *
 * **Miért ez van itt, és nem két gomb.** Aki autókozmetikát keres, két dolgot
 * akar tudni: mennyibe kerül, és mennyi ideig tart. A klasszikus
 * „főcím + két gomb" nyitóképernyő mindkettőre egy kattintással később válaszol.
 * Ez a sáv azonnal megmutatja, és közben elvégzi a besorolást is: mire a
 * látogató a foglaláshoz ér, már eldöntötte, mit kér.
 *
 * Az ár és az időtartam a `lib/content/pricing.ts`-ből jön, nincs itt átírva.
 *
 * **Valódi `tablist`**, nem három gomb egymás mellett: a nyílbillentyűk
 * lépkednek, a Home és az End a szélekre ugrik, és csak a kiválasztott fül
 * kap Tab-fókuszt. Ez a minta az, amit a képernyőolvasó „3 közül a 2." alakban
 * mond ki — három sima gomb esetén nem tudná, hogy választásról van szó.
 */
export function ServicePicker({
  bookingEnabled,
  bookingHref,
  bookingLabel,
}: {
  bookingEnabled: boolean;
  bookingHref: string;
  bookingLabel: string;
}) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const service = services[active] ?? services[0];
  if (!service) return null;

  const focusTab = (index: number) => {
    const next = (index + services.length) % services.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusTab(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusTab(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(services.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="border-t border-steel bg-obsidian/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-wide px-5 sm:px-8">
        <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch">
          {/* A fülek **minden méreten egy sorban** állnak. Egymás alá tördelve
              a nyitóképernyő aljáról a képernyőn kívülre tolnák az árat —
              vagyis pont azt, amiért ez a sáv létezik. Ezért rövid a felirat:
              a teljes név a panelben szerepel. */}
          <div
            role="tablist"
            aria-label="Szolgáltatás választása"
            className="flex shrink-0 lg:border-r lg:border-steel"
          >
            {services.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.slug}
                  ref={(node) => {
                    tabsRef.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${index}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  // Roving tabindex: a fülcsoportba egy Tab visz be, utána a
                  // nyilak lépkednek. Három külön tabstop fölöslegesen
                  // lassítaná a billentyűs használatot.
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={cn(
                    'relative flex-1 px-4 py-4 text-left font-display text-h6 uppercase tracking-wide transition-colors duration-ui ease-standard sm:flex-none sm:px-6 lg:py-6',
                    selected ? 'text-brass' : 'text-on-dark-muted hover:text-on-dark',
                  )}
                >
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                  {/* A kiválasztás jele sárgaréz vonal. A `scaleX` animál, nem
                      a szélesség — így nem számoltat újra elrendezést. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-0 left-4 right-4 h-0.5 origin-left bg-brass transition-transform duration-ui ease-standard sm:left-6 sm:right-6',
                      selected ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${active}`}
            className="flex flex-1 flex-col gap-4 border-t border-steel py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-6 lg:border-t-0 lg:pl-8"
          >
            <p className="font-display text-h6 uppercase tracking-wide text-on-dark sm:sr-only">
              {service.name}
            </p>

            <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <div>
                <dt className="text-body-sm text-on-dark-muted">Ár</dt>
                <dd className="font-display text-h4 text-on-dark">{formatRange(service.range)}</dd>
              </div>
              <div>
                <dt className="text-body-sm text-on-dark-muted">Időtartam</dt>
                <dd className="font-display text-h4 text-on-dark">{service.duration}</dd>
              </div>
            </dl>

            {/* Kis nézeten a két gomb **egymás alatt, teljes szélességben**
                áll. Egy sorban a két magyar felirat 375 pixelen kifutna a
                lapból, és a `flex-wrap` is csak a másodikat törné le — ettől a
                sor ránézésre elromlottnak látszana. */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <ButtonLink
                href={`/szolgaltatasok#${service.slug}`}
                variant="secondary"
                tone="dark"
                size="md"
                arrow
                className="w-full sm:w-auto"
              >
                Mit tartalmaz
              </ButtonLink>
              <ButtonLink
                href={bookingHref}
                variant="primary"
                tone="dark"
                size="md"
                className="w-full sm:w-auto"
              >
                {bookingLabel}
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Amíg a foglalás ki van kapcsolva, a látogatónak tudnia kell, hogy a
            telefon az út — nem azért nincs foglalás gomb, mert elromlott. */}
        {bookingEnabled ? null : (
          <p className="pb-5 text-body-sm text-on-dark-muted lg:pb-6">
            Időpontot jelenleg telefonon és a közösségi oldalainkon egyeztetünk.
          </p>
        )}
      </div>
    </div>
  );
}
