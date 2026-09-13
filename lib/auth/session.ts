import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken, readSessionCookie, type AdminClaims } from './jwt';

/**
 * Server-side session helpers for admin pages and route handlers.
 *
 * Middleware already blocks unauthenticated requests to `/admin` and
 * `/api/admin` before a page renders. These helpers are the second layer: they
 * run inside the server component, so a route that is ever removed from the
 * middleware matcher still cannot leak data. Defence in depth is cheap here.
 */

export async function getSession(): Promise<AdminClaims | null> {
  const store = await cookies();
  return verifySessionToken(readSessionCookie(store));
}

/** Redirects to the login page unless a valid session exists. */
export async function requireSession(returnTo?: string): Promise<AdminClaims> {
  const session = await getSession();
  if (session) return session;

  const target = returnTo
    ? `/admin/belepes?tovabb=${encodeURIComponent(returnTo)}`
    : '/admin/belepes';
  redirect(target);
}

/**
 * Route-handler guard. Returns the claims, or a 401 `Response` to return as-is.
 *
 * Route handlers cannot `redirect()` usefully — an API client needs a status
 * code, not an HTML login page.
 */
export async function requireApiSession(): Promise<
  { ok: true; session: AdminClaims } | { ok: false; response: Response }
> {
  const session = await getSession();
  if (session) return { ok: true, session };

  return {
    ok: false,
    response: Response.json({ error: 'Nincs jogosultság.' }, { status: 401 }),
  };
}

/**
 * Rejects cross-origin state-changing requests.
 *
 * `SameSite=strict` on the session cookie is the primary CSRF defence; this is
 * the belt to that pair of braces, and it also catches non-browser clients that
 * replay a stolen cookie from another origin.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  // Same-origin non-CORS requests may omit Origin entirely — that is not a
  // cross-site request, so it is allowed.
  if (!origin) return true;

  const host = request.headers.get('host');
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
