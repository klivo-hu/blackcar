import { absoluteUrl } from '@/lib/site-url';
import { faqs, openingHours, serviceArea, site, socials } from '@/lib/content/site';
import { bundles, priceNote, services, vehicleSizes } from '@/lib/content/pricing';
import { works } from '@/lib/content/works';
import { getSiteSettings } from '@/lib/store/settings';

/**
 * `llms.txt` — a vállalkozás összefoglalója gépi olvasóknak.
 *
 * **Mire jó, és mire nem.** A Google keresője ezt a fájlt nem használja, tehát
 * a klasszikus SEO-ra nincs hatása; a strukturált adat (`lib/seo/jsonld.ts`) és
 * a lapok szövege végzi azt a munkát. Amit ez ad: a nyelvi modellek és az
 * AI-keresők egyetlen kérésből, félreértés nélkül megkapják az árakat, a
 * nyitvatartást és a vonzáskörzetet — ahelyett, hogy három oldal HTML-jéből
 * próbálnák kikövetkeztetni. Olcsó, és a rossz válasz drágább.
 *
 * A tartalom **ugyanabból a forrásból** épül, mint az oldal. Nincs külön
 * karbantartott szöveg, tehát nem tud eltérni attól, amit a látogató lát —
 * ami egy idézhető összefoglalónál az egyetlen dolog, ami tényleg számít.
 */

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const settings = await getSiteSettings();

  const hours = openingHours
    .map((entry) => `- ${entry.days}: ${entry.from ? `${entry.from}–${entry.to}` : 'zárva'}`)
    .join('\n');

  const serviceBlocks = services
    .map((service) => {
      const sizes = service.bySize
        ? vehicleSizes
            .map((size) => `  - ${size.label}: ${service.bySize?.[size.id]} ezer Ft`)
            .join('\n')
        : '  - Méret szerinti bontás nincs megadva; az ár a gépjármű méretéből és állapotából adódik.';

      return [
        `### ${service.name}`,
        '',
        service.summary,
        '',
        `- Ár: ${service.range.from}–${service.range.to} ezer Ft`,
        `- Időtartam: ${service.duration}`,
        `- Tartalom: ${service.includes.join('; ')}`,
        '- Méret szerinti ár:',
        sizes,
      ].join('\n');
    })
    .join('\n\n');

  const bundleBlock = bundles
    .map(
      (bundle) =>
        `- ${bundle.name} (${bundle.period}): ${bundle.includes.join(', ')} — ${bundle.price} ezer Ft`,
    )
    .join('\n');

  const faqBlock = faqs.map((faq) => `### ${faq.question}\n\n${faq.answer}`).join('\n\n');

  const workBlock = works
    .map(
      (work) =>
        `- ${work.vehicle} (${work.category}) — ${work.service}, ${work.price} ezer Ft: ${work.summary}`,
    )
    .join('\n');

  const body = `# ${site.name}

> ${site.description}

Autókozmetikai szolgáltatás ${site.city}ban (Heves vármegye, Magyarország).
Külső, belső és teljes takarítás személyautóra, kombira, egyterűre és
kisteherautóra, gépi mosó nélkül.

## Elérhetőség

- Telefon: ${settings.phone}
- E-mail: ${settings.email}
- Weboldal: ${absoluteUrl('/')}
${socials.map((social) => `- ${social.name}: ${social.href}`).join('\n')}

## Nyitvatartás

${hours}

## Vonzáskörzet

${serviceArea.join(', ')} — minden település ${site.city}tól 20 km-en belül.

## Szolgáltatások és árak

${serviceBlocks}

### Csomagok

${bundleBlock}

${priceNote}

## Időpontfoglalás

${
  settings.bookingEnabled
    ? `Időpont kérhető a weboldalon (${absoluteUrl('/#idopontfoglalas')}) vagy telefonon.
A weboldalon leadott foglalás időpontkérés: a szolgáltató visszahívással
igazolja vissza, és a foglalás ezzel válik véglegessé.`
    : `A weboldalon jelenleg nincs online foglalás. Időpont telefonon
(${settings.phone}) és a közösségi oldalakon egyeztethető.`
}

## Elvégzett munkák

${workBlock}

## Kérdések és válaszok

${faqBlock}

## Oldalak

- ${absoluteUrl('/')} — kezdőlap
- ${absoluteUrl('/szolgaltatasok')} — szolgáltatások és árak
- ${absoluteUrl('/referenciak')} — elvégzett munkák
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      // Egy óra: elég friss ahhoz, hogy egy árváltozás gyorsan átmenjen, és
      // elég hosszú ahhoz, hogy a botok ne minden kérésnél újragenerálják.
      'cache-control': 'public, max-age=3600',
    },
  });
}
