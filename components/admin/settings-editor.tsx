'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminField, AdminPanel, adminInputClass } from '@/components/admin/ui';
import { validateSettings, type SiteSettings } from '@/lib/content/settings';

/**
 * A beállítások szerkesztője.
 *
 * Két dolgot állít: a látogatónak megjelenő elérhetőséget, és a foglalási
 * rendszer főkapcsolóját.
 *
 * **A kapcsoló következményét a felület kimondja**, nem apró betűvel: a
 * bekapcsolás egyszerre hozza elő a foglalási űrlapot *és* a jogi
 * tájékoztatókat, mert adatot kérni tájékoztatás nélkül jogszerűtlen. A
 * szerkesztőnek tudnia kell, mit kapcsol be — nem elég, hogy a kód helyesen
 * működik.
 *
 * A mentés előtt ugyanaz a `validateSettings` fut, ami a szerveren: az
 * azonnali visszajelzésért. A döntés ettől függetlenül a szerveré — ez itt
 * kényelem, nem védelem.
 */
export function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettings>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setState('idle');
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const check = validateSettings(values);
    if (!check.ok) {
      setErrors(check.errors);
      setState('error');
      setMessage('Nézd át a jelölt mezőket.');
      return;
    }

    setErrors({});
    setState('saving');

    try {
      const response = await fetch('/api/admin/beallitasok', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(check.value),
      });

      if (response.ok) {
        setState('saved');
        setMessage('A beállítások mentve. Az oldalon azonnal látszik.');
        // A nyilvános oldal szerveren renderelődik, tehát a szerkesztő a saját
        // böngészőjében is csak frissítés után látná az új értéket.
        router.refresh();
        return;
      }

      const body = (await response.json().catch(() => ({}))) as {
        errors?: Record<string, string>;
        error?: string;
      };
      if (body.errors) setErrors(body.errors);
      setState('error');
      setMessage(body.error ?? 'A mentés nem sikerült.');
    } catch {
      setState('error');
      setMessage('Nem sikerült kapcsolódni a kiszolgálóhoz.');
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <AdminPanel
        title="Foglalási rendszer"
        description="Amíg ki van kapcsolva, az oldal egyetlen űrlapot sem jelenít meg és semmilyen személyes adatot nem vesz át."
      >
        <label className="flex cursor-pointer items-start gap-4 rounded-card border border-steel bg-obsidian p-5">
          <input
            type="checkbox"
            checked={values.bookingEnabled}
            onChange={(event) => update('bookingEnabled', event.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--brass))]"
          />
          <span>
            <span className="block font-display text-h6 uppercase tracking-wide text-on-dark">
              Online időpontfoglalás bekapcsolása
            </span>
            <span className="mt-2 block text-body-sm text-on-dark-muted">
              Bekapcsolva megjelenik a foglalási űrlap a kezdőlapon, a fejléc és a záró szekció
              gombjai a foglalásra mutatnak, és a láblécbe bekerülnek a jogi tájékoztatók — a
              foglalási feltételek, az adatkezelési tájékoztató és az impresszum. A három együtt
              jár: adatot kérni tájékoztatás nélkül nem lehet.
            </span>
            <span className="mt-2 block text-body-sm text-on-dark-muted">
              Kikapcsolva a látogató a telefonszámot és a közösségi oldalakat kapja, a jogi oldalak
              pedig kikerülnek a keresőből és a láblécből.
            </span>
          </span>
        </label>

        {values.bookingEnabled && !initial.bookingEnabled ? (
          <p className="mt-5 rounded-card border border-brass/50 bg-brass/10 px-4 py-3 text-body-sm text-on-dark">
            Mentés előtt nézd át a jogi tájékoztatókat: a cégadatok a kiszolgáló
            <code className="mx-1 text-brass">.env</code> fájljából jönnek, és ami nincs kitöltve,
            az szögletes zárójelben jelenik meg az oldalon.
          </p>
        ) : null}
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel
          title="Elérhetőség"
          description="Ez jelenik meg a fejlécben, a láblécben, a záró szekcióban és a strukturált adatban."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField
              id="beallitas-telefon"
              label="Telefonszám"
              hint="Ahogy meg kell jelennie. A hívható hivatkozást a rendszer állítja elő belőle."
              error={errors.phone}
            >
              <input
                id="beallitas-telefon"
                type="tel"
                value={values.phone}
                onChange={(event) => update('phone', event.target.value)}
                className={adminInputClass(Boolean(errors.phone))}
              />
            </AdminField>

            <AdminField id="beallitas-email" label="E-mail cím" error={errors.email}>
              <input
                id="beallitas-email"
                type="email"
                value={values.email}
                onChange={(event) => update('email', event.target.value)}
                className={adminInputClass(Boolean(errors.email))}
              />
            </AdminField>
          </div>
        </AdminPanel>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" tone="dark" size="lg" disabled={state === 'saving'}>
          {state === 'saving' ? 'Mentés…' : 'Mentés'}
        </Button>

        {message ? (
          <p
            role="status"
            className={
              state === 'error' ? 'text-body-sm text-danger' : 'text-body-sm text-on-dark-muted'
            }
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
