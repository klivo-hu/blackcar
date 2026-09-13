import { AdminShell } from '@/components/admin/admin-shell';
import { AdminPanel } from '@/components/admin/ui';
import { SettingsEditor } from '@/components/admin/settings-editor';
import { BookingTable } from '@/components/admin/booking-table';
import { requireSession } from '@/lib/auth/session';
import { getSiteSettings } from '@/lib/store/settings';
import { listBookings } from '@/lib/store/bookings';

/**
 * Az admin panel.
 *
 * **Egyetlen oldal, nem menürendszer.** Két dolgot lehet itt csinálni: a
 * beállításokat állítani, és a beérkezett foglalásokat kezelni. Egy
 * navigációval szétszabdalt panel két lapból két kattintást csinálna, és a
 * szerkesztőnek meg kellene tanulnia, mi hol van.
 *
 * A `requireSession()` a **második** védelmi réteg: a middleware már
 * visszafordította az azonosítatlan kérést, mielőtt ez a komponens lefutna.
 * Ha ez az útvonal valaha kiesne a middleware mintájából, akkor sem szivárogna
 * ki semmi.
 *
 * A foglalások listája csak akkor jelenik meg, ha van mit mutatni **vagy** a
 * foglalás be van kapcsolva: egy üres postaláda kikapcsolt rendszer mellett
 * csak zaj.
 */
export default async function AdminPage() {
  const session = await requireSession('/admin');
  const [settings, bookings] = await Promise.all([getSiteSettings(), listBookings()]);

  const open = bookings.filter((booking) => booking.status === 'uj').length;
  const showBookings = settings.bookingEnabled || bookings.length > 0;

  return (
    <AdminShell user={session.sub}>
      <h1 className="text-h2 text-on-dark">Beállítások</h1>
      <p className="mt-4 max-w-prose text-body text-on-dark-muted">
        Itt állítható az oldalon megjelenő elérhetőség, és itt kapcsolható be vagy ki az online
        időpontfoglalás. A szolgáltatások, az árak és a referenciák a kódban élnek — azokat
        fejlesztő módosítja.
      </p>

      <div className="mt-10">
        <SettingsEditor initial={settings} />
      </div>

      {showBookings ? (
        <div className="mt-10">
          <AdminPanel
            title="Beérkezett foglalások"
            description={
              settings.bookingEnabled
                ? 'A foglalás időpontkérés. A visszahívás után állítsd „egyeztetve" állapotba, hogy lásd, mi van még hátra.'
                : 'Az online foglalás jelenleg ki van kapcsolva, tehát új kérés nem érkezik. A korábbiak itt maradnak, amíg nem törlöd őket.'
            }
            actions={
              open > 0 ? (
                <span className="inline-flex items-center rounded-pill border border-brass/60 bg-brass/10 px-4 py-2 text-body-sm font-medium text-brass">
                  {open} új
                </span>
              ) : null
            }
          >
            <BookingTable bookings={bookings} />
          </AdminPanel>
        </div>
      ) : null}
    </AdminShell>
  );
}
