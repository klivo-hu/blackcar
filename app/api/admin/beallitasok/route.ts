import { validateSettings } from '@/lib/content/settings';
import { getSiteSettings, updateSiteSettings } from '@/lib/store/settings';
import { isSameOrigin, requireApiSession } from '@/lib/auth/session';

/**
 * A beállítások olvasása és mentése.
 *
 * A middleware már kiszűrte az azonosítatlan kéréseket, mielőtt idáig
 * eljutnának. A `requireApiSession` a **második réteg**: ha ez az útvonal
 * valaha kiesne a middleware mintájából, akkor sem nyílna ki. A védelem
 * megkettőzése itt olcsó, a hiánya viszont csendes.
 */

export const dynamic = 'force-dynamic';

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
}

export async function GET(): Promise<Response> {
  const session = await requireApiSession();
  if (!session.ok) return session.response;

  return json(await getSiteSettings(), 200);
}

export async function PUT(request: Request): Promise<Response> {
  const session = await requireApiSession();
  if (!session.ok) return session.response;

  if (!isSameOrigin(request)) return json({ error: 'Érvénytelen kérés.' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Hibás kérés.' }, 400);
  }

  const result = validateSettings(payload);
  if (!result.ok) return json({ errors: result.errors }, 422);

  // A `validateSettings` a **teljes** objektumot adja vissza, nem részhalmazt:
  // így egy hiányzó mező nem tud némán a korábbi értéken maradni akkor, amikor
  // a szerkesztő épp törölni akarta.
  const saved = await updateSiteSettings(result.value);
  return json(saved, 200);
}
