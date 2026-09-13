import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

/**
 * Admin session tokens — HS256 JWTs issued and verified with `jose`.
 *
 * `jose` is used rather than `jsonwebtoken` because it is built on Web Crypto,
 * so the *same* verification code runs in the Node runtime (route handlers,
 * server components) and in Edge middleware. A second implementation for the
 * edge would be a second place for an auth bug to hide.
 *
 * The token is stateless. That is a deliberate trade: no session table to keep,
 * at the cost of not being able to revoke an individual token before it expires.
 * The TTL is short (8h) and rotating `ADMIN_JWT_SECRET` invalidates every token
 * at once, which is the escape hatch that matters.
 */

const ISSUER = 'blackcar60.hu';
const AUDIENCE = 'blackcar-admin';
const ALGORITHM = 'HS256';

/** Eight hours — long enough for a working day, short enough to limit damage. */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

/**
 * Two cookie names, chosen per request by whether the connection is secure.
 *
 * The `__Host-` prefix is a real security control: the browser refuses the
 * cookie unless it is `Secure`, has `Path=/` and carries no `Domain`, which
 * pins it to this exact origin and blocks a subdomain from injecting one.
 *
 * But the same rule makes it *unusable* over plain HTTP — the browser drops
 * the cookie without any error. Selecting the name from `NODE_ENV` therefore
 * breaks admin login on any production build not yet behind TLS (a container
 * on `http://localhost:3000`, a server before the certificate is issued): the
 * user submits correct credentials, gets a 200, and lands back on the login
 * page with no indication why.
 *
 * So the choice is made from the actual request protocol instead. HTTPS gets
 * the hardened prefixed cookie; plain HTTP gets a working one.
 */
export const SECURE_SESSION_COOKIE = '__Host-blackcar_session';
export const SESSION_COOKIE = 'blackcar_session';

export type AdminClaims = JWTPayload & {
  /** Subject — the admin username. */
  sub: string;
  role: 'admin';
};

/**
 * Reads the signing secret. Throwing (rather than falling back to a default)
 * is intentional: a site running on a guessable secret is worse than a site
 * that refuses to start.
 */
function secretKey(): Uint8Array {
  const value = process.env.ADMIN_JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      'ADMIN_JWT_SECRET is missing or shorter than 32 characters. Generate one with `npm run gen:secret`.',
    );
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: ALGORITHM, typ: 'JWT' })
    .setSubject(username)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setJti(crypto.randomUUID())
    .sign(secretKey());
}

/**
 * Verifies signature, algorithm, issuer, audience and expiry.
 *
 * Pinning `algorithms` closes the "alg: none" and RS256→HS256 confusion classes
 * of attack — without it a verifier can be tricked into accepting a token it
 * should reject. Returns `null` rather than throwing so callers can branch.
 */
export async function verifySessionToken(token: string | undefined): Promise<AdminClaims | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: [ALGORITHM],
      clockTolerance: 5,
    });

    if (payload.role !== 'admin' || typeof payload.sub !== 'string') return null;
    return payload as AdminClaims;
  } catch {
    // Expired, tampered, wrong secret — all indistinguishable to the caller.
    return null;
  }
}

/**
 * Whether the request reached us over HTTPS.
 *
 * Behind a reverse proxy the connection to the app is usually plain HTTP even
 * when the client used TLS, so the forwarded header is the authoritative
 * signal. It is proxy-controlled, not client-controlled, in any correct
 * deployment — and the failure mode if it is wrong is a non-prefixed cookie,
 * never an authentication bypass.
 */
export function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-proto');
  if (forwarded) return forwarded.split(',')[0]?.trim() === 'https';

  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return false;
  }
}

/** The cookie name to *write* for this request. */
export function sessionCookieName(secure: boolean): string {
  return secure ? SECURE_SESSION_COOKIE : SESSION_COOKIE;
}

/**
 * Cookie attributes for the session.
 *
 * `sameSite: 'strict'` — the admin panel is never linked from anywhere else,
 * so strict costs nothing and removes cross-site request forgery entirely.
 */
export function sessionCookieOptions(secure: boolean): {
  httpOnly: true;
  sameSite: 'strict';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

/**
 * Reads the session token from a cookie jar, whichever name it was stored
 * under. Both are checked because a deployment can move between HTTP and HTTPS
 * (certificate issued, proxy added) while a session is still live, and the
 * secure name is preferred so an HTTPS cookie always wins.
 */
export function readSessionCookie(jar: {
  get(name: string): { value: string } | undefined;
}): string | undefined {
  return jar.get(SECURE_SESSION_COOKIE)?.value ?? jar.get(SESSION_COOKIE)?.value;
}
