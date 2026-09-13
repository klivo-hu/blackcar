'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { services, vehicleSizes } from '@/lib/content/pricing';
import { todayIso } from '@/lib/format';
import { Button } from '@/components/ui/button';

/**
 * Az időpontfoglaló űrlap.
 *
 * **Ez nem kapcsolatfelvételi űrlap.** Egyetlen dolga van: időpontkérést
 * rögzíteni. Ezért kér gépjárműtípust és méretet is — enélkül a tulajdonos
 * nem tudná megmondani sem az árat, sem azt, hány óra kell rá —, és ezért
 * nincs benne „tárgy" mező.
 *
 * **A foglalás kérés, nem visszaigazolás.** Az űrlap ezt ki is mondja, a
 * siker-üzenet pedig megismétli. Egy automatikusan „lefoglalt" időpont, amit
 * senki nem nézett meg, rosszabb, mint egy őszinte kérés: az ügyfél hiába
 * jönne el.
 *
 * **A kliensoldali ellenőrzés kényelem, nem védelem.** Ami számít, az a
 * `lib/validation.ts` a szerveren; az itteni `required` és `type` attribútumok
 * csak azért vannak, hogy a hiba a beküldés előtt kiderüljön. A szerver
 * mezőnkénti hibáit ugyanaz a felület mutatja meg, tehát nincs két
 * hibamegjelenítési út.
 */

type Status =
  { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

const DAYPARTS = [
  { id: 'delelott', label: 'Délelőtt' },
  { id: 'delutan', label: 'Délután' },
] as const;

export function BookingForm() {
  const baseId = useId();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const field = (name: string) => `${baseId}-${name}`;
  const errorId = (name: string) => `${baseId}-${name}-hiba`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ kind: 'sending' });
    setErrors({});

    try {
      const response = await fetch('/api/foglalas', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          vehicle: data.get('vehicle'),
          vehicleSize: data.get('vehicleSize'),
          service: data.get('service'),
          date: data.get('date'),
          daypart: data.get('daypart'),
          message: data.get('message'),
          consent: data.get('consent') === 'on',
        }),
      });

      const payload: unknown = await response.json().catch(() => ({}));

      if (response.ok) {
        form.reset();
        setStatus({ kind: 'sent' });
        return;
      }

      const body = payload as { errors?: Record<string, string>; error?: string };
      if (body.errors) setErrors(body.errors);

      setStatus({
        kind: 'error',
        message:
          body.error ??
          (body.errors
            ? 'Nézd át a pirossal jelölt mezőket.'
            : 'A foglalást most nem sikerült elküldeni. Kérjük, hívjon minket.'),
      });
    } catch {
      // Hálózati hiba: a felhasználónak van másik útja, mondjuk meg neki.
      setStatus({
        kind: 'error',
        message:
          'Nem sikerült kapcsolódni. Ellenőrizze az internetkapcsolatát, vagy hívjon minket.',
      });
    }
  }

  if (status.kind === 'sent') {
    return (
      <div
        // A `status` szerepkör miatt a képernyőolvasó felolvassa a megjelenő
        // üzenetet anélkül, hogy megszakítaná, amit épp mond.
        role="status"
        className="rounded-panel border border-brass/40 bg-slate p-8 sm:p-10"
      >
        <h3 className="text-h4 text-on-dark">Megkaptuk a kérését</h3>
        <p className="mt-4 max-w-prose text-body text-on-dark-muted">
          A foglalás még nem végleges: felhívjuk a megadott számon, egyeztetjük az időpontot, és
          csak utána rögzítjük. Ha sürgős, hívjon minket nyugodtan — a számunk a lap alján van.
        </p>
        <Button
          className="mt-7"
          variant="secondary"
          tone="dark"
          onClick={() => setStatus({ kind: 'idle' })}
        >
          Új foglalás
        </Button>
      </div>
    );
  }

  const sending = status.kind === 'sending';

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      className="rounded-panel border border-steel bg-slate p-6 sm:p-8 lg:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={field('name')} errorId={errorId('name')} label="Teljes név" error={errors.name}>
          <input
            id={field('name')}
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            className={inputClass(Boolean(errors.name))}
          />
        </Field>

        <Field
          id={field('phone')}
          errorId={errorId('phone')}
          label="Telefonszám"
          hint="Ezen a számon hívjuk vissza."
          error={errors.phone}
        >
          <input
            id={field('phone')}
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            maxLength={24}
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>

        <Field
          id={field('email')}
          errorId={errorId('email')}
          label="E-mail cím"
          error={errors.email}
          className="sm:col-span-2"
        >
          <input
            id={field('email')}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={160}
            className={inputClass(Boolean(errors.email))}
          />
        </Field>

        <Field
          id={field('vehicle')}
          errorId={errorId('vehicle')}
          label="Gépjármű típusa"
          hint="Például: Opel Astra kombi, 2016."
          error={errors.vehicle}
        >
          <input
            id={field('vehicle')}
            name="vehicle"
            type="text"
            required
            maxLength={80}
            className={inputClass(Boolean(errors.vehicle))}
          />
        </Field>

        <Field
          id={field('vehicleSize')}
          errorId={errorId('vehicleSize')}
          label="Méretkategória"
          error={errors.vehicleSize}
        >
          <select
            id={field('vehicleSize')}
            name="vehicleSize"
            required
            defaultValue={vehicleSizes[0].id}
            className={inputClass(Boolean(errors.vehicleSize))}
          >
            {vehicleSizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id={field('service')}
          errorId={errorId('service')}
          label="Kért szolgáltatás"
          error={errors.service}
        >
          <select
            id={field('service')}
            name="service"
            required
            defaultValue={services[0]?.slug}
            className={inputClass(Boolean(errors.service))}
          >
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id={field('date')} errorId={errorId('date')} label="Kért nap" error={errors.date}>
          <input
            id={field('date')}
            name="date"
            type="date"
            required
            // A `min` a böngésző naptárában is letiltja a múltat, tehát a
            // hibát meg sem lehet ejteni. A szerver ettől függetlenül ellenőriz.
            min={todayIso()}
            className={inputClass(Boolean(errors.date))}
          />
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="text-body-sm font-medium text-on-dark">Napszak</legend>
          <p className="mt-1 text-body-sm text-on-dark-muted">
            Pontos órát az egyeztetéskor beszélünk meg — a munka hossza az autótól függ.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {DAYPARTS.map((part, index) => (
              <label
                key={part.id}
                className="group/part inline-flex cursor-pointer items-center gap-2.5 rounded-pill border border-steel px-5 py-2.5 text-body-sm text-on-dark-muted transition-colors duration-ui ease-standard hover:border-brass/50 has-[:checked]:border-brass has-[:checked]:text-on-dark"
              >
                <input
                  type="radio"
                  name="daypart"
                  value={part.id}
                  defaultChecked={index === 0}
                  className="h-4 w-4 accent-[rgb(var(--brass))]"
                />
                {part.label}
              </label>
            ))}
          </div>
          {errors.daypart ? <FieldError id={errorId('daypart')} message={errors.daypart} /> : null}
        </fieldset>

        <Field
          id={field('message')}
          errorId={errorId('message')}
          label="Üzenet"
          hint="Nem kötelező. Ha van valami, amire külön figyeljünk, itt írja le."
          error={errors.message}
          className="sm:col-span-2"
        >
          <textarea
            id={field('message')}
            name="message"
            rows={4}
            maxLength={1500}
            className={cn(inputClass(Boolean(errors.message)), 'h-auto resize-y py-3')}
          />
        </Field>
      </div>

      <div className="mt-7 border-t border-steel pt-6">
        <label className="flex cursor-pointer items-start gap-3 text-body-sm text-on-dark-muted">
          <input
            type="checkbox"
            name="consent"
            required
            aria-describedby={errors.consent ? errorId('consent') : undefined}
            className="mt-1 h-4.5 w-4.5 shrink-0 accent-[rgb(var(--brass))]"
          />
          <span>
            Elfogadom a{' '}
            <Link
              href="/jogi/foglalasi-feltetelek"
              className="text-brass underline underline-offset-4"
            >
              foglalási feltételeket
            </Link>
            , és megismertem az{' '}
            <Link
              href="/jogi/adatkezelesi-tajekoztato"
              className="text-brass underline underline-offset-4"
            >
              adatkezelési tájékoztatót
            </Link>
            .
          </span>
        </label>
        {errors.consent ? <FieldError id={errorId('consent')} message={errors.consent} /> : null}
      </div>

      {status.kind === 'error' ? (
        <p
          role="alert"
          className="mt-6 rounded-card border border-danger/50 bg-danger/10 px-4 py-3 text-body-sm text-on-dark"
        >
          {status.message}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" tone="dark" size="lg" disabled={sending}>
          {sending ? 'Küldés…' : 'Időpont kérése'}
        </Button>
        <p className="text-body-sm text-on-dark-muted">
          A foglalás a visszahívásunkkal válik véglegessé.
        </p>
      </div>
    </form>
  );
}

/** Az űrlapmezők közös burkolata: címke, súgó, hibaüzenet — egy helyen. */
function Field({
  id,
  errorId,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  errorId: string;
  label: string;
  hint?: string;
  error?: string | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-body-sm font-medium text-on-dark">
        {label}
      </label>
      {hint ? <p className="mt-1 text-body-sm text-on-dark-muted">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? <FieldError id={errorId} message={error} /> : null}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-2 text-body-sm text-danger">
      {message}
    </p>
  );
}

/**
 * A beviteli mezők megjelenése.
 *
 * Sötét felületen a mező **sötétebb**, mint a kártya, nem világosabb: így
 * mélyedésnek látszik, amibe írni lehet, nem egy kiemelt lapnak. A hibás mező
 * kerete piros — de a hiba szövegben is ott van alatta, mert a színvakok
 * számára egy piros keret önmagában nem információ.
 */
function inputClass(hasError: boolean): string {
  return cn(
    'h-12 w-full rounded-card border bg-obsidian px-4 text-body text-on-dark',
    'placeholder:text-on-dark-muted/70',
    'transition-colors duration-ui ease-standard',
    hasError ? 'border-danger' : 'border-steel hover:border-steel/80 focus:border-brass',
  );
}
