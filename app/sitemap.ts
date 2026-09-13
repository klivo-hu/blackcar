import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';
import { legalPages } from '@/lib/content/legal-pages';
import { getSiteSettings } from '@/lib/store/settings';

/**
 * A sitemap.
 *
 * **A jogi oldalak csak bekapcsolt foglalás mellett kerülnek bele.** Kikapcsolt
 * állapotban `noindex` alatt állnak, és egy sitemapben szereplő, de indexelésre
 * tiltott URL ellentmondás: a Search Console külön hibaként jelzi.
 *
 * A `lastModified` a kiszolgálás ideje. Kézzel karbantartott dátumok helyett
 * ez az őszinte válasz: az oldalak tartalma a kóddal és a beállításokkal
 * változik, és egy beégetett régi dátum azt állítaná, hogy azóta nem
 * történt semmi.
 */
// A beállítások futásidejűek: a jogi oldalak a foglalás kapcsolójától függően
// kerülnek bele. Statikusan generálva a build pillanatának állapota égne be, és
// a bekapcsolás után is a régi lista menne ki a keresőnek.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    {
      url: absoluteUrl('/szolgaltatasok'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/referenciak'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  if (settings.bookingEnabled) {
    for (const page of legalPages) {
      pages.push({
        url: absoluteUrl(`/jogi/${page.slug}`),
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.3,
      });
    }
  }

  return pages;
}
