import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';

/**
 * A robots.txt.
 *
 * Az admin felület és a foglalási végpont tiltva van. A tiltás nem biztonsági
 * intézkedés — azt a middleware és a munkamenet-ellenőrzés végzi —, hanem azt
 * előzi meg, hogy a belépő oldal keresőtalálatként jelenjen meg a márkanévre.
 *
 * Az AI-keresők botjai **nincsenek kizárva**: az oldal célja, hogy megtalálják
 * és idézzék. Aki autókozmetikát keres Hatvanban, az ugyanúgy kérdezhet egy
 * nyelvi modellt, mint a Google-t.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
