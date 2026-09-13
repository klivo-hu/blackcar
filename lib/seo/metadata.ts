import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site-url';
import { site } from '@/lib/content/site';

/**
 * Oldalankénti metaadat egyetlen helyről.
 *
 * Minden oldal ezen keresztül állítja be a címét és a leírását, hogy három
 * dolog ne csússzon el egymástól: a canonical URL, az OG kép és a cím
 * sablonja. Ezek azok, amiket kézzel írva előbb-utóbb elfelejt az ember, és a
 * hiba csak hetekkel később, a keresőben derül ki.
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  image,
  noIndex = false,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  /**
   * A gyökér elrendezés minden címhez hozzáfűzi a márkanevet. A főoldal címe
   * már tartalmazza, ezért ott ezt ki kell kapcsolni — különben
   * „… | Black Car Autókozmetika | Black Car Autókozmetika" lenne a fülön.
   */
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl('/opengraph-image');

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    openGraph: {
      type: 'website',
      url,
      siteName: site.name,
      locale: site.locale,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
