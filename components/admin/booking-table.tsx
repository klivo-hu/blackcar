'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatusTag } from '@/components/admin/ui';
import { formatDate, formatDateTime, telHref } from '@/lib/format';
import { serviceBySlug, vehicleSizes } from '@/lib/content/pricing';
import type { Booking, BookingStatus } from '@/lib/store/bookings';

/**
 * A beérkezett foglalások.
 *
 * **Nem táblázat, hanem kártyák.** Egy foglalásnak kilenc mezője van; kilenc
 * oszlop telefonon olvashatatlan, és a szerkesztő jó eséllyel telefonról nézi
 * meg, amikor csörög a telefon. A kártya minden mérethez ugyanúgy áll.
 *
 * **A telefonszám és az e-mail hivatkozás**: a legelső dolog, amit a
 * szerkesztő tenni akar, az a visszahívás. Egy kimásolható, de nem hívható
 * szám minden egyes alkalommal három felesleges mozdulat.
 *
 * A törlés megerősítést kér. Ez az egyetlen visszafordíthatatlan művelet a
 * felületen, és a szomszédja egy ártalmatlan állapotváltás — a kettő közötti
 * elcsúszott koppintás különben adatot veszítene.
 */

const NEXT_STATUS: Record<BookingStatus, { value: BookingStatus; label: string } | null> = {
  uj: { value: 'egyeztetve', label: 'Egyeztetve' },
  egyeztetve: { value: 'lezart', label: 'Lezárás' },
  lezart: { value: 'uj', label: 'Újranyitás' },
};

const DAYPART = { delelott: 'Délelőtt', delutan: 'Délután' } as const;

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(id: string, init: RequestInit) {
    setBusy(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/foglalasok/${id}`, init);
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'A művelet nem sikerült.');
        return;
      }
      router.refresh();
    } catch {
      setError('Nem sikerült kapcsolódni a kiszolgálóhoz.');
    } finally {
      setBusy(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-steel px-5 py-8 text-center text-body text-on-dark-muted">
        Még nincs beérkezett foglalás.
      </p>
    );
  }

  return (
    <div>
      {error ? (
        <p
          role="alert"
          className="mb-5 rounded-card border border-danger/50 bg-danger/10 px-4 py-3 text-body-sm text-on-dark"
        >
          {error}
        </p>
      ) : null}

      <ul className="space-y-4">
        {bookings.map((booking) => {
          const service = serviceBySlug(booking.service);
          const size = vehicleSizes.find((item) => item.id === booking.vehicleSize);
          const next = NEXT_STATUS[booking.status];
          const working = busy === booking.id;

          return (
            <li
              key={booking.id}
              className="rounded-card border border-steel bg-obsidian p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-h5 text-on-dark">{booking.name}</h3>
                  <p className="mt-1 text-body-sm text-on-dark-muted">
                    Beérkezett: {formatDateTime(booking.createdAt)}
                  </p>
                </div>
                <StatusTag status={booking.status} />
              </div>

              <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <Row label="Kért nap">
                  {formatDate(booking.date)} — {DAYPART[booking.daypart]}
                </Row>
                <Row label="Szolgáltatás">{service?.name ?? booking.service}</Row>
                <Row label="Méret">{size?.label ?? booking.vehicleSize}</Row>
                <Row label="Gépjármű">{booking.vehicle}</Row>
                <Row label="Telefon">
                  <a
                    href={telHref(booking.phone)}
                    className="text-brass underline underline-offset-4"
                  >
                    {booking.phone}
                  </a>
                </Row>
                <Row label="E-mail">
                  <a
                    href={`mailto:${booking.email}`}
                    className="break-all text-brass underline underline-offset-4"
                  >
                    {booking.email}
                  </a>
                </Row>
              </dl>

              {booking.message ? (
                <div className="mt-5 border-t border-steel pt-4">
                  <h4 className="text-body-sm text-on-dark-muted">Üzenet</h4>
                  {/* `whitespace-pre-line`: az ügyfél sortörései megmaradnak.
                      A szöveg React gyerekként megy ki, tehát escapelve —
                      markupként soha nem értelmeződik. */}
                  <p className="mt-1 whitespace-pre-line text-body text-on-dark">
                    {booking.message}
                  </p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3 border-t border-steel pt-5">
                {next ? (
                  <Button
                    variant="secondary"
                    tone="dark"
                    disabled={working}
                    onClick={() =>
                      void call(booking.id, {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ status: next.value }),
                      })
                    }
                  >
                    {next.label}
                  </Button>
                ) : null}

                <Button
                  variant="danger"
                  tone="dark"
                  disabled={working}
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Biztosan törlöd ${booking.name} foglalását? Ez nem vonható vissza.`,
                      )
                    ) {
                      return;
                    }
                    void call(booking.id, { method: 'DELETE' });
                  }}
                >
                  Törlés
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-body-sm text-on-dark-muted">{label}</dt>
      <dd className="mt-0.5 text-body text-on-dark">{children}</dd>
    </div>
  );
}
