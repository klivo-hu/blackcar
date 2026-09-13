import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A szekciófejléc.
 *
 * **Minden szekciócím balra igazított.** Középre zárt címsor kitör az oldal
 * ritmusából, és hosszú magyar szavaknál rongyos, kétoldalt szakadozott
 * tömböt ad. A kivétel nélküli szabály itt olcsóbb, mint az esetenkénti
 * mérlegelés.
 *
 * A cím fölött **nincs apró, csupa nagybetűs címke**. A hierarchiát a méret, a
 * szín és a térköz adja — egy „szemöldök" csak megismételné a címsort kisebben.
 *
 * A `lead` az a mondat, ami eldönti, érdemes-e tovább olvasni. Prózai
 * szélességre van fogva (`max-w-prose`), mert a szekció teljes szélességében
 * futó bekezdés sorvégeit a szem elveszíti.
 */
export function SectionHeading({
  id,
  title,
  lead,
  align = 'left',
  tone = 'dark',
  className,
  children,
}: {
  id?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** `wide` a teljes szélességet használja — nagy rácsok fölött. */
  align?: 'left' | 'wide';
  tone?: 'dark' | 'light';
  className?: string;
  /** Cselekvés a fejléc mellett (például „Összes referencia"). */
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between',
        align === 'left' && 'max-w-prose sm:max-w-none',
        className,
      )}
    >
      <div className={cn(align === 'left' && 'max-w-prose')}>
        <h2 id={id} className={cn('text-h2', tone === 'dark' ? 'text-on-dark' : 'text-ink')}>
          {title}
        </h2>
        {lead ? (
          <p
            className={cn(
              'mt-5 text-body-lg',
              tone === 'dark' ? 'text-on-dark-muted' : 'text-muted',
            )}
          >
            {lead}
          </p>
        ) : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}
