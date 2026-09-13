'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Work } from '@/lib/content/works';

/**
 * Egy munka fotói.
 *
 * **Nagy kép és alatta miniatűrök**, nem világítódoboz. A világítódoboz
 * mobilon rosszabb, mint amit megold: elfedi a lapot, a záráshoz külön gombot
 * kell megtalálni, és a görgetési pozíció szokott elveszni tőle. Itt a kép
 * mindig a szövegkörnyezetében marad, és egy koppintás cseréli.
 *
 * A miniatűrök **gombok**, nem hivatkozások: nem navigálnak, hanem a felület
 * állapotát változtatják. A kiválasztott gomb `aria-pressed`-del jelzi magát,
 * tehát a képernyőolvasó is tudja, melyik látszik épp.
 *
 * A váltás nem animált elhalványítás: a kép **azonnal** cserélődik. Egy
 * átúsztatás itt késleltetné azt, amiért a látogató kattintott, és két fotó
 * egymáson pillanatnyi kásás képet adna.
 */
export function WorkGallery({ work }: { work: Work }) {
  const [active, setActive] = useState(0);
  const photo = work.photos[active] ?? work.photos[0];
  if (!photo) return null;

  return (
    <div>
      <figure>
        <div className="relative aspect-[3/4] overflow-hidden rounded-card border border-line bg-bone">
          <Image
            src={photo.image}
            alt={photo.alt}
            placeholder="blur"
            quality={82}
            sizes="(min-width: 1024px) 34rem, 92vw"
            className="h-full w-full object-cover"
          />
        </div>
        <figcaption className="mt-3 text-body-sm text-muted">{photo.alt}</figcaption>
      </figure>

      <ul className="mt-4 grid grid-cols-4 gap-3">
        {work.photos.map((item, index) => {
          const selected = index === active;
          return (
            <li key={item.image.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={selected}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-card border-2 transition-[border-color,transform] duration-ui ease-standard',
                  selected
                    ? 'border-brass-deep'
                    : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <span className="sr-only">
                  {work.vehicle} — {index + 1}. fotó
                </span>
                <Image
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  placeholder="blur"
                  quality={60}
                  sizes="8rem"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
