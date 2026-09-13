'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Az oldal egyetlen mozgásvezérlője.
 *
 * Két dolgot csinál, mindkettőt egy helyen, egyszer:
 *
 * 1. **Megjelenés görgetésre.** Egyetlen `IntersectionObserver` figyeli az
 *    összes `[data-reveal]` elemet, és láthatóvá váláskor kiteszi rájuk a
 *    `data-revealed` jelzőt, majd azonnal le is iratkozik róluk — a megjelenés
 *    egyszeri esemény, nem oda-vissza kapcsolgatás.
 * 2. **Mutatókövetés a fénylő felületeken.** A kurzor helyzetét a *célelem*
 *    saját koordinátáira váltja, és két CSS változóként ráírja.
 *
 * **Az írás közvetlenül az elemekre megy, nem a `<html>` egy változójába.** A
 * gyökéren megváltozó egyedi tulajdonság az egész dokumentumra újraszámoltatja
 * a stílust, méghozzá minden képkockán — ettől akad a felület. Néhány elem
 * stílusát írni ehhez képest semmi.
 *
 * Mindkettő némán kimarad, ha a látogató csökkentett mozgást kért: ilyenkor a
 * CSS eleve mindent láthatóra és mozdulatlanra állít, tehát nincs mit vezérelni.
 *
 * Ez a komponens semmit nem renderel. Kliens komponens, mert böngésző-eseményre
 * iratkozik fel — ez az a kivétel, amiért a „szerver az alapértelmezés" szabály
 * alól felmentést kap.
 */

/** Ennyivel a nézet alja fölött indul a megjelenés, hogy a mozgás akkor érjen
 *  véget, amikor az elem tényleg olvasható helyre ér. */
const REVEAL_MARGIN = '0px 0px -12% 0px';

/** A fénykövető felületek jelölője. */
const SHEEN_SELECTOR = '[data-sheen]';

export function MotionDriver() {
  const pathname = usePathname();

  // Megjelenés-figyelő. Útvonalanként újraindul, mert navigáció után új elemek
  // kerülnek a fába.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = 'true';
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: REVEAL_MARGIN, threshold: 0.01 },
    );

    const observeAll = () => {
      for (const node of document.querySelectorAll<HTMLElement>(
        '[data-reveal]:not([data-revealed])',
      )) {
        observer.observe(node);
      }
    };

    observeAll();

    // Az árkalkulátor és az admin listák menet közben cserélik a tartalmat.
    // Egy figyelő olcsóbb, mint minden ilyen helyen kézzel újraindítani a
    // megfigyelést — és nem is felejthető el.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  // Mutatókövetés.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Érintőképernyőn nincs lebegő kurzor: a követés ott csak fölösleges munka.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let pending: { target: HTMLElement; x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const { target, x, y } = pending;
      target.style.setProperty('--sheen-x', `${x.toFixed(2)}%`);
      target.style.setProperty('--sheen-y', `${y.toFixed(2)}%`);
    };

    const onMove = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.(SHEEN_SELECTOR);
      if (!(target instanceof HTMLElement)) return;

      const box = target.getBoundingClientRect();
      pending = {
        target,
        x: ((event.clientX - box.left) / box.width) * 100,
        y: ((event.clientY - box.top) / box.height) * 100,
      };

      // Képkockánként legfeljebb egy írás. Enélkül egy gyors kurzormozgás
      // néhány száz stílusírást indítana másodpercenként.
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
