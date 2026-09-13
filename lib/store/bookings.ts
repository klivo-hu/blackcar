import { revalidateTag, unstable_cache } from 'next/cache';
import { createCollection, createId } from './json-store';
import type { VehicleSizeId } from '@/lib/content/pricing';

/**
 * A beérkezett időpontfoglalások.
 *
 * A foglalás **kérés, nem visszaigazolás**: a rendszer rögzíti az igényt, a
 * tulajdonos pedig telefonon egyeztet és véglegesít. Ezt az oldal is kimondja
 * az űrlapnál — egy automatikusan „visszaigazolt" időpont, amit senki nem
 * nézett meg, rosszabb, mint egy őszinte kérés.
 *
 * Ezért nincs időpont-ütközés vizsgálat sem: nem naptárat kezelünk, hanem
 * megkereséseket veszünk át. A valódi beosztás a tulajdonos fejében és
 * telefonján van, és ez egy egyautós műhelynél helyes így.
 */

export type BookingStatus = 'uj' | 'egyeztetve' | 'lezart';

export type Booking = {
  id: string;
  createdAt: string;
  status: BookingStatus;
  name: string;
  email: string;
  phone: string;
  /** A kért nap, `YYYY-MM-DD`. */
  date: string;
  /** Napszak — pontos órát nem kérünk, mert a munka hossza változó. */
  daypart: 'delelott' | 'delutan';
  /** A szolgáltatás `slug`-ja a `lib/content/pricing.ts`-ből. */
  service: string;
  vehicleSize: VehicleSizeId;
  /** A gépjármű megnevezése, ahogy az ügyfél írta. */
  vehicle: string;
  message: string;
};

const bookings = createCollection<Booking>('bookings.json');

export const BOOKINGS_TAG = 'bookings';

const readBookings = unstable_cache(
  async () => bookings.read(),
  ['bc-bookings', bookings.fingerprint()],
  { tags: [BOOKINGS_TAG] },
);

/** A foglalások, a legfrissebbel az élen. */
export async function listBookings(): Promise<Booking[]> {
  const items = await readBookings();
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type NewBooking = Omit<Booking, 'id' | 'createdAt' | 'status'>;

export async function createBooking(input: NewBooking): Promise<Booking> {
  const booking: Booking = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
    status: 'uj',
  };

  await bookings.mutate((items) => ({ items: [...items, booking], result: booking }));
  revalidateTag(BOOKINGS_TAG);
  return booking;
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
  const updated = await bookings.mutate((items) => {
    const current = items.find((item) => item.id === id);
    // A rekord megléte a szűkítés is: ezután a `current` biztosan `Booking`,
    // tehát nincs szükség indexelésre és típusállításra.
    if (!current) return { items, result: null };

    const changed: Booking = { ...current, status };
    return {
      items: items.map((item) => (item.id === id ? changed : item)),
      result: changed,
    };
  });

  if (updated) revalidateTag(BOOKINGS_TAG);
  return updated;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const removed = await bookings.mutate((items) => {
    const next = items.filter((item) => item.id !== id);
    return { items: next, result: next.length !== items.length };
  });

  if (removed) revalidateTag(BOOKINGS_TAG);
  return removed;
}
