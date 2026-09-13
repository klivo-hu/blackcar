/**
 * @type {import('next').NextConfig}
 *
 * A biztonsági fejlécek itt állnak, nem middleware-ben: így minden válaszra
 * érvényesek — a statikus fájlokra és a képekre is, amiket a middleware nem lát.
 */

/**
 * Content-Security-Policy.
 *
 * A `script-src` `'unsafe-inline'`-ja a Next.js App Router követelménye: a
 * keretrendszer inline szkriptként ágyazza be a bootstrapot és a streamelt RSC
 * payloadot. A szigorúbb megoldás a nonce lenne, az viszont minden oldalt
 * dinamikus rendereléshez kötne — vagyis feladnánk a statikus generálást a
 * teljes marketing oldalon. Az oldal nem jelenít meg felhasználótól érkező
 * HTML-t (a foglalás üzenete escapelve megy ki), ezért ez a csere nem éri meg.
 *
 * A `style-src` inline engedélye a React inline `style` propjai miatt kell:
 * a szekcióelválasztók és a lépcsőzött megjelenés CSS egyedi tulajdonságokon
 * keresztül kapják az értékeiket.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" +
    (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // Clickjacking. Modern böngészőben a `frame-ancestors` felülírja; a régiek
  // kedvéért marad.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Megakadályozza, hogy a böngésző más MIME típusként értelmezze a választ.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Két év, aldomainekkel. A böngésző csak HTTPS felett értelmezi, sima HTTP-n
  // figyelmen kívül hagyja — ezért küldhető feltétel nélkül.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig = {
  reactStrictMode: true,
  // Önálló szerver build — ezt várja a deploy Dockerfile.
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // A használt minőségeket fel kell sorolni; a Next 16 csak ezeket engedi.
    // 82 a tartalmi képeké, 60 a homályos helyőrzőké.
    qualities: [60, 82],
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Az admin felületet sem proxy, sem böngésző nem cache-elheti, és
        // keresőbe sem kerülhet.
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
