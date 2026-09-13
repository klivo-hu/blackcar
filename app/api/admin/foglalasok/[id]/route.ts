import { deleteBooking, setBookingStatus, type BookingStatus } from '@/lib/store/bookings';
import { isSameOrigin, requireApiSession } from '@/lib/auth/session';

/**
 * Egy foglalás állapotának módosítása és törlése.
 *
 * A törlés itt **valódi törlés**, nem rejtés: a foglalás személyes adatot
 * tartalmaz, és az adatkezelési tájékoztató azt ígéri, hogy törölhető. Egy
 * „archivált" állapot, ami valójában megőriz mindent, ennek az ígéretnek
 * ellentmondana.
 */

export const dynamic = 'force-dynamic';

const STATUSES: BookingStatus[] = ['uj', 'egyeztetve', 'lezart'];

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params): Promise<Response> {
  const session = await requireApiSession();
  if (!session.ok) return session.response;

  if (!isSameOrigin(request)) return json({ error: 'Érvénytelen kérés.' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Hibás kérés.' }, 400);
  }

  const { status } = (payload ?? {}) as Record<string, unknown>;
  if (typeof status !== 'string' || !STATUSES.includes(status as BookingStatus)) {
    return json({ error: 'Ismeretlen állapot.' }, 422);
  }

  const { id } = await params;
  const updated = await setBookingStatus(id, status as BookingStatus);
  if (!updated) return json({ error: 'A foglalás nem található.' }, 404);

  return json(updated, 200);
}

export async function DELETE(request: Request, { params }: Params): Promise<Response> {
  const session = await requireApiSession();
  if (!session.ok) return session.response;

  if (!isSameOrigin(request)) return json({ error: 'Érvénytelen kérés.' }, 403);

  const { id } = await params;
  const removed = await deleteBooking(id);
  if (!removed) return json({ error: 'A foglalás nem található.' }, 404);

  return json({ ok: true }, 200);
}
