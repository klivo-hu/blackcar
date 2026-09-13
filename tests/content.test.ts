import { describe, expect, it } from 'vitest';
import { bundles, formatRange, services, vehicleSizes } from '@/lib/content/pricing';
import { faqs, serviceArea, site } from '@/lib/content/site';
import { works } from '@/lib/content/works';
import { legalPages } from '@/lib/content/legal-pages';

/**
 * A tartalom épségének tesztjei.
 *
 * Ezek nem a kód logikáját mérik, hanem azt, hogy a **tartalom** ne tudjon
 * csendben elromlani. Egy hiányzó alt szöveg, egy elgépelt szolgáltatásnév vagy
 * két azonos `slug` nem okoz fordítási hibát: az oldal felépül, és a hiba csak
 * hetekkel később derül ki — a keresőben, vagy egy képernyőolvasóval.
 *
 * Ez az a fajta ellenőrzés, ami a szerkesztést biztonságossá teszi: az árakhoz
 * és a referenciákhoz hozzá lehet nyúlni anélkül, hogy végig kellene kattintani
 * az oldalt.
 */

describe('árak és szolgáltatások', () => {
  it('minden szolgáltatásnak egyedi a slugja', () => {
    const slugs = services.map((service) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('a sáv alsó határa nem nagyobb a felsőnél', () => {
    for (const service of services) {
      expect(service.range.from).toBeLessThanOrEqual(service.range.to);
    }
  });

  it('a méret szerinti árak a kimondott sávon belül vannak', () => {
    // Ez a kettő két külön helyen áll a lapon (kártya és táblázat). Ha
    // elcsúsznak, a látogató két különböző árat lát ugyanarra a munkára.
    for (const service of services) {
      if (!service.bySize) continue;

      for (const size of vehicleSizes) {
        const price = service.bySize[size.id];
        expect(price).toBeGreaterThanOrEqual(service.range.from);
        expect(price).toBeLessThanOrEqual(service.range.to);
      }
    }
  });

  it('a méret szerinti ár minden kategóriára meg van adva, ha van bontás', () => {
    for (const service of services) {
      if (!service.bySize) continue;
      for (const size of vehicleSizes) {
        expect(typeof service.bySize[size.id]).toBe('number');
      }
    }
  });

  it('a rövid név tényleg rövidebb, és nem üres', () => {
    for (const service of services) {
      expect(service.short.length).toBeGreaterThan(0);
      expect(service.short.length).toBeLessThan(service.name.length);
    }
  });

  it('a csomagok ára és megtakarítása pozitív', () => {
    for (const bundle of bundles) {
      expect(bundle.price).toBeGreaterThan(0);
      expect(bundle.saving).toBeGreaterThan(0);
      expect(bundle.includes.length).toBeGreaterThan(0);
    }
  });

  it('az ársáv azonos határoknál nem ismétli magát', () => {
    expect(formatRange({ from: 15, to: 15 })).toBe('15 e Ft');
    expect(formatRange({ from: 15, to: 35 })).toBe('15 – 35 e Ft');
  });
});

describe('referenciák', () => {
  it('minden munkának egyedi a slugja', () => {
    const slugs = works.map((work) => work.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('minden fotónak van értelmes alt szövege', () => {
    // Az üres `alt` itt hiba lenne, nem választás: ezek tartalmi képek, nem
    // dekoráció. A hosszküszöb a „kep1.jpg" típusú kitöltést szűri.
    for (const work of works) {
      expect(work.photos.length).toBeGreaterThan(0);
      for (const photo of work.photos) {
        expect(photo.alt.length).toBeGreaterThan(20);
      }
    }
  });

  it('a fizetett ár pozitív', () => {
    for (const work of works) {
      expect(work.price).toBeGreaterThan(0);
    }
  });

  it('a megnevezett szolgáltatás létező szolgáltatás neve', () => {
    const names = new Set(services.map((service) => service.name));
    for (const work of works) {
      expect(names.has(work.service)).toBe(true);
    }
  });
});

describe('kérdések és válaszok', () => {
  it('minden kérdés egyedi', () => {
    const questions = faqs.map((faq) => faq.question);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it('a válaszok önmagukban teljesek', () => {
    // Ezekből épül a `FAQPage` strukturált adat, amit az AI-keresők idéznek.
    // Egy „lásd fent" válasz a találati listában értelmezhetetlen.
    for (const faq of faqs) {
      expect(faq.answer.length).toBeGreaterThan(60);
      expect(faq.answer).not.toMatch(/lásd (fent|lent|a fenti)/i);
    }
  });
});

describe('helyi SEO', () => {
  it('a vonzáskörzet a telephely városával kezdődik', () => {
    expect(serviceArea[0]).toBe(site.city);
  });

  it('a leírás és a mottó megnevezi a várost', () => {
    expect(site.description).toContain(site.city);
    expect(site.tagline).toContain(site.city);
  });
});

describe('jogi oldalak', () => {
  it('minden slug egyedi és URL-barát', () => {
    const slugs = legalPages.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
