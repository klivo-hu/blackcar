/**
 * Az oldal nyilvános origója.
 *
 * A `NEXT_PUBLIC_SITE_URL` **build időben** ég bele a kliens bundle-be, ezért
 * a Dockerfile build argumentumként kapja meg. Ha itt rossz érték áll, minden
 * canonical URL, OG tag és sitemap bejegyzés máshová mutat — és ez csak hetekkel
 * később, a keresőben derül ki.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blackcar60.hu';

/** Abszolút URL egy oldalhoz tartozó útvonalból. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, siteUrl).toString();
}
