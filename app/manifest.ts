import type { MetadataRoute } from 'next';
import { site } from '@/lib/content/site';

/**
 * A webalkalmazás-jegyzék.
 *
 * A `display: 'browser'` szándékos: ez egy weboldal, nem alkalmazás. A
 * `standalone` elrejtené a címsávot, amivel a látogató elveszítené a
 * megosztható URL-t és a vissza gombot — cserébe semmit nem kapna, mert nincs
 * offline működés.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — autókozmetika ${site.city}ban`,
    short_name: site.shortName,
    description: site.description,
    lang: site.lang,
    start_url: '/',
    display: 'browser',
    background_color: '#0A0A0B',
    theme_color: '#0A0A0B',
    icons: [{ src: '/icon', sizes: '32x32', type: 'image/png' }],
  };
}
