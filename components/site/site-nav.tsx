'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { site } from '@/lib/content/site';
import { telHref } from '@/lib/format';
import { LogoMark } from '@/components/site/logo';
import { ButtonLink } from '@/components/ui/button';

/**
 * A fejléc.
 *
 * **Rögzített, de nem tolakodó.** A lap tetején átlátszó — a nyitóképernyő
 * egybefüggő marad —, görgetés után viszont sötét hátteret és alsó élt kap,
 * hogy a tartalom fölött olvasható maradjon. A váltás egy `scroll` figyelőből
 * jön, ami csak akkor ír állapotot, ha az *tényleg* változott: enélkül minden
 * görgetési eseményre újrarenderelne az egész fejléc.
 *
 * **A mobil menü valódi párbeszédpanel-viselkedést kap.** Nyitva a törzs nem
 * görgethető, az Esc zár, és a fókusz a panelbe kerül. Egy „csak lenyílik"
 * menü billentyűzettel használhatatlan: a Tab kimenne a panel mögé, a láthatatlan
 * tartalomba.
 *
 * Kliens komponens, mert görgetést és billentyűzetet figyel. A tartalma
 * (hivatkozások, telefonszám) propból jön, tehát a szerkeszthető adat nem
 * ragad be a kliens bundle-be.
 */

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: '/', label: 'Kezdőlap' },
  { href: '/szolgaltatasok', label: 'Szolgáltatások és árak' },
  { href: '/referenciak', label: 'Referenciák' },
];

/** Az elsődleges cselekvés célja attól függ, be van-e kapcsolva a foglalás. */
function primaryAction(bookingEnabled: boolean, phone: string) {
  return bookingEnabled
    ? { href: '/#idopontfoglalas', label: 'Időpontfoglalás' }
    : { href: telHref(phone), label: 'Hívjon minket' };
}

export function SiteNav({ bookingEnabled, phone }: { bookingEnabled: boolean; phone: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Görgetési állapot.
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 16;
      // Csak változáskor írunk állapotot — lásd a komponens leírását.
      setScrolled((current) => (current === next ? current : next));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Oldalváltáskor a menü záródik. Enélkül a navigáció megtörténne, de a panel
  // ottmaradna a friss oldal fölött.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Nyitott menü: Esc zár, a törzs nem görög, a fókusz a panelbe kerül.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const action = primaryAction(bookingEnabled, phone);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-panel ease-standard',
        scrolled || open
          ? 'border-b border-steel bg-obsidian/92 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-wide items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="group/logo flex items-center gap-3 text-on-dark"
          aria-label={`${site.name} — kezdőlap`}
        >
          <LogoMark className="h-auto w-24 transition-transform duration-ui ease-standard group-hover/logo:-translate-y-0.5 sm:w-28" />
          <span className="sr-only">{site.name}</span>
        </Link>

        <nav aria-label="Fő navigáció" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative rounded-pill px-4 py-2 text-body-sm font-medium transition-colors duration-ui ease-standard',
                      active ? 'text-on-dark' : 'text-on-dark-muted hover:text-on-dark',
                    )}
                  >
                    {item.label}
                    {/* Az aktív oldal jelölése sárgaréz alávonás. A `scaleX`
                        animál, nem a szélesség: az elrendezést nem érinti. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-x-4 bottom-1 h-px origin-left bg-brass transition-transform duration-ui ease-standard',
                        active ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={telHref(phone)}
            className="text-body-sm font-medium text-on-dark-muted transition-colors duration-ui ease-standard hover:text-on-dark"
          >
            {phone}
          </a>
          <ButtonLink href={action.href} variant="primary" tone="dark" size="md">
            {action.label}
          </ButtonLink>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {/* A hívás kis nézeten **a fejlécben** van, nem lebegő gombként a lap
              alján. A lebegő gomb a nyitóképernyő alján futó választósáv
              gombjaira ült rá, és a takarás ott a legrosszabb, ahol az ár áll.
              Itt viszont a görgetés végig magával viszi, és semmit nem fed el. */}
          <a
            href={telHref(phone)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-brass text-obsidian transition-transform duration-feedback ease-standard active:scale-95"
          >
            <span className="sr-only">Hívás: {phone}</span>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-5 w-5">
              <path d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
            </svg>
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={panelId}
            className="inline-flex h-11 w-11 items-center justify-center rounded-pill border border-steel text-on-dark"
          >
            <span className="sr-only">{open ? 'Menü bezárása' : 'Menü megnyitása'}</span>
            <MenuGlyph open={open} />
          </button>
        </div>
      </div>

      {/* A panel mindig a fában van, csak rejtve — így a nyitás animálható, és
          nincs az az egy képkocka, amin a tartalom ugrik egyet. */}
      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        className="border-t border-steel bg-obsidian lg:hidden"
      >
        <nav aria-label="Fő navigáció" className="px-5 py-6 sm:px-8">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between rounded-card px-4 py-3.5 font-display text-h5 uppercase tracking-wide transition-colors duration-ui ease-standard',
                    pathname === item.href ? 'bg-slate text-brass' : 'text-on-dark hover:bg-slate',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 border-t border-steel pt-6">
            <ButtonLink href={action.href} variant="primary" tone="dark" size="lg">
              {action.label}
            </ButtonLink>
            <a
              href={telHref(phone)}
              className="text-center text-body-sm text-on-dark-muted transition-colors duration-ui ease-standard hover:text-on-dark"
            >
              {phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

/**
 * A menü ikon.
 *
 * Két vonal, amiből nyitáskor kereszt lesz. Az átmenet `transform`-on fut,
 * tehát nem számoltat újra elrendezést — és a két állapot között *átmegy*,
 * nem átugrik, ami elárulja, hogy ugyanaz a gomb csukja be.
 */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-4 w-5">
      <span
        className={cn(
          'absolute left-0 h-0.5 w-full bg-current transition-transform duration-ui ease-standard',
          open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0.5',
        )}
      />
      <span
        className={cn(
          'absolute left-0 h-0.5 w-full bg-current transition-transform duration-ui ease-standard',
          open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0.5',
        )}
      />
    </span>
  );
}
