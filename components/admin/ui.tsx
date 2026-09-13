import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Az admin felület apró építőelemei.
 *
 * A panel **ugyanazokból a tokenekből** épül, mint a nyilvános oldal — nincs
 * második design rendszer egy „belső" felülethez. Ami más: itt nincs mozgás,
 * nincs fénycsík és nincs megjelenés görgetésre. Egy szerkesztőfelületen a
 * mozgás nem hangulat, hanem késleltetés: a szerkesztő ugyanazt a listát nézi
 * naponta tízszer.
 */

export function AdminPanel({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-panel border border-steel bg-slate">
      <header className="flex flex-col gap-4 border-b border-steel p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div>
          <h2 className="text-h4 text-on-dark">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-prose text-body-sm text-on-dark-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}

/** Az adminon belüli beviteli mezők. Ugyanaz a forma, mint a foglalási űrlapon. */
export function adminInputClass(hasError = false): string {
  return cn(
    'h-11 w-full rounded-card border bg-obsidian px-4 text-body text-on-dark',
    'transition-colors duration-ui ease-standard',
    hasError ? 'border-danger' : 'border-steel focus:border-brass',
  );
}

export function AdminField({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-body-sm font-medium text-on-dark">
        {label}
      </label>
      {hint ? <p className="mt-1 text-body-sm text-on-dark-muted">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-body-sm text-danger">{error}</p> : null}
    </div>
  );
}

/**
 * Állapotjelölő a foglalásoknál.
 *
 * A színen kívül a **szöveg** is hordozza az állapotot — színvakon egy zöld és
 * egy szürke pötty ugyanaz. A keret is eltér, tehát három független jel van:
 * szöveg, szín, kontúr.
 */
export function StatusTag({ status }: { status: 'uj' | 'egyeztetve' | 'lezart' }) {
  const label = { uj: 'Új', egyeztetve: 'Egyeztetve', lezart: 'Lezárt' }[status];
  const style = {
    uj: 'border-brass/60 bg-brass/10 text-brass',
    egyeztetve: 'border-success/60 bg-success/10 text-on-dark',
    lezart: 'border-steel bg-obsidian text-on-dark-muted',
  }[status];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-pill border px-3 py-1 text-body-sm font-medium',
        style,
      )}
    >
      {label}
    </span>
  );
}
