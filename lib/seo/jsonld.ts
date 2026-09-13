import { absoluteUrl } from '@/lib/site-url';
import { faqs, openingHours, serviceArea, site, socials } from '@/lib/content/site';
import { services } from '@/lib/content/pricing';
import { works } from '@/lib/content/works';
import { getOrganization, isPlaceholder } from '@/lib/organization';

/**
 * Strukturált adat (JSON-LD).
 *
 * Ez az a réteg, amit sem a Google, sem az AI-alapú keresők nem „olvasnak ki"
 * találgatásból: itt mondjuk meg gépi formában, mi ez a vállalkozás, hol van,
 * mit csinál és mennyiért. Egyetlen modulban él, mert az `@id` hivatkozásoknak
 * egyezniük kell — szétszórva ez az első, ami elromlik.
 *
 * **A kitöltetlen mezők kimaradnak.** A `.env`-ben hiányzó adat helyén az
 * oldalon `[szögletes zárójeles]` helyőrző áll; az a látogatónak szól, és ott
 * hasznos. A strukturált adatot viszont gépek olvassák: ott a helyőrző nem
 * hiányként jelenne meg, hanem a vállalkozás **tényleges adataként**. Amit nem
 * tudunk, azt inkább nem állítjuk.
 */

const BUSINESS_ID = absoluteUrl('/#autokozmetika');
const WEBSITE_ID = absoluteUrl('/#website');

/**
 * A vállalkozás.
 *
 * A típus `AutoWash`, nem a általános `LocalBusiness`: ez a schema.org
 * pontosan az autómosásra és -kozmetikára való alkategória, és a keresők a
 * szűkebb típusból többet tudnak kezdeni. A `LocalBusiness` az ősosztálya,
 * tehát semmi nem vész el vele.
 */
export function localBusinessJsonLd() {
  const { company, geo } = getOrganization();

  const address = [company.postcode, company.city, company.street].some(isPlaceholder)
    ? undefined
    : {
        '@type': 'PostalAddress',
        addressCountry: 'HU',
        addressRegion: 'Heves',
        postalCode: company.postcode,
        addressLocality: company.city,
        streetAddress: company.street,
      };

  const coordinates =
    geo.latitude && geo.longitude
      ? { '@type': 'GeoCoordinates', latitude: geo.latitude, longitude: geo.longitude }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoWash',
    '@id': BUSINESS_ID,
    name: site.name,
    url: absoluteUrl('/'),
    description: site.description,
    image: absoluteUrl('/opengraph-image'),
    logo: absoluteUrl('/icon'),
    priceRange: '15 000 – 85 000 HUF',
    currenciesAccepted: 'HUF',
    ...(address ? { address } : {}),
    ...(coordinates ? { geo: coordinates } : {}),
    ...(isPlaceholder(company.legalName) ? {} : { legalName: company.legalName }),
    ...(isPlaceholder(company.taxNumber) ? {} : { taxID: company.taxNumber }),
    // A vonzáskörzet nem szórt névlista: minden település 20 km-en belül van.
    areaServed: serviceArea.map((name) => ({
      '@type': 'City',
      name,
      containedInPlace: { '@type': 'Country', name: 'Magyarország' },
    })),
    openingHoursSpecification: openingHours
      .filter((entry) => entry.from !== null)
      .map((entry) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: entry.schema,
        opens: entry.from,
        closes: entry.to,
      })),
    sameAs: socials.map((social) => social.href),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Autókozmetikai szolgáltatások',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        '@id': absoluteUrl(`/szolgaltatasok#${service.slug}`),
        name: service.name,
        description: service.summary,
        priceCurrency: 'HUF',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: service.range.from * 1000,
          maxPrice: service.range.to * 1000,
          priceCurrency: 'HUF',
          valueAddedTaxIncluded: true,
        },
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          serviceType: 'Autókozmetika',
          provider: { '@id': BUSINESS_ID },
          areaServed: { '@type': 'City', name: site.city },
        },
      })),
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: site.name,
    description: site.description,
    inLanguage: 'hu-HU',
    publisher: { '@id': BUSINESS_ID },
  };
}

/**
 * A kérdések és válaszok.
 *
 * A `faqs` tömbből épül, tehát a keresőnek mutatott válasz **nem tud eltérni**
 * attól, amit a látogató olvas. Ez nemcsak tisztesség kérdése: az eltérő
 * strukturált adat a rich result elvesztésével jár.
 */
export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': absoluteUrl('/#gyik'),
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** A referenciaoldal listája — a keresőnek is sorrendben. */
export function worksJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': absoluteUrl('/referenciak#lista'),
    name: 'Elvégzett munkák',
    itemListElement: works.map((work, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${work.vehicle} — ${work.service}`,
      url: absoluteUrl(`/referenciak#${work.slug}`),
    })),
  };
}

/** Morzsamenü. Az egyoldalas kezdőlapon nincs rá szükség, csak aloldalon. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}
