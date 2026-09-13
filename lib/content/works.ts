import type { StaticImageData } from 'next/image';
import alfa1 from '@/assets/munkak/alfa1.jpg';
import alfa2 from '@/assets/munkak/alfa2.jpg';
import alfa3 from '@/assets/munkak/alfa3.jpg';
import alfa4 from '@/assets/munkak/alfa4.jpg';
import c1 from '@/assets/munkak/c1.jpg';
import c2 from '@/assets/munkak/c2.jpg';
import c3 from '@/assets/munkak/c3.jpg';
import c4 from '@/assets/munkak/c4.jpg';
import ford1 from '@/assets/munkak/ford1.jpg';
import ford2 from '@/assets/munkak/ford2.jpg';
import ford3 from '@/assets/munkak/ford3.jpg';
import ford4 from '@/assets/munkak/ford4.jpg';

/**
 * A referenciák — valódi, elvégzett munkák.
 *
 * **A képek a vállalkozás saját fotói.** Nincs közöttük generált vagy vásárolt
 * kép, és nincs „előtte" felvétel sem, mert olyan nem készült: egy utólag
 * sötétített „előtte" kép hazugság lenne. Amit a látogató lát, az az átadott
 * állapot.
 *
 * A képek **statikus importtal** jönnek, nem a `public/` mappából. Így a Next
 * build időben ismeri a méretarányt — nincs elrendezés-ugrás —, és maga
 * állítja elő a homályos helyőrzőt. Nincs kézzel karbantartott méret- vagy
 * blur-táblázat, ami elcsúszhatna a fájloktól.
 *
 * A fotók álló tájolásúak (3:4), mert telefonnal készültek a műhelyben. Ez nem
 * hiányosság, hanem a galéria formája: az oldal álló képekre épül, nem
 * fekvőkre kényszeríti őket vágással.
 */

export type WorkPhoto = { image: StaticImageData; alt: string };

export type Work = {
  slug: string;
  vehicle: string;
  /** A méretkategória, ugyanazzal a szóhasználattal, mint az árlistában. */
  category: string;
  /** Az elvégzett szolgáltatás neve. */
  service: string;
  /** A ténylegesen fizetett ár, ezer forintban. */
  price: number;
  summary: string;
  photos: WorkPhoto[];
};

export const works: Work[] = [
  {
    slug: 'alfa-romeo-mito',
    vehicle: 'Alfa Romeo MiTo',
    category: 'Városi személyautó',
    service: 'Belső takarítás',
    price: 20,
    summary:
      'Normál méretű városi autó, teljes belső takarítással. Az ülések, a kárpitok ' +
      'és a műszerfal egyaránt sorra kerültek.',
    photos: [
      {
        image: alfa1,
        alt: 'Az Alfa Romeo MiTo vezetőoldala a belső takarítás után: kormány, műszerfal és első ülések',
      },
      { image: alfa2, alt: 'Az Alfa Romeo MiTo első ülései és középkonzolja tisztítás után' },
      {
        image: alfa3,
        alt: 'Az Alfa Romeo MiTo utastere a nyitott ajtó felől, letisztított küszöbbel',
      },
      { image: alfa4, alt: 'Az Alfa Romeo MiTo műszerfala, kormánya és váltója portalanítás után' },
    ],
  },
  {
    slug: 'citroen-c4',
    vehicle: 'Citroën C4',
    category: 'Városi személyautó',
    service: 'Teljes takarítás',
    price: 35,
    summary:
      'Normál méretű városi autó, teljes belső és külső takarítás után került vissza ' +
      'a tulajdonosához. Az ülésvédők a munka végéig fent maradtak.',
    photos: [
      {
        image: c1,
        alt: 'A Citroën C4 műszerfala és kormánya a takarítás után, felhelyezett ülésvédővel',
      },
      { image: c2, alt: 'A Citroën C4 letisztított ajtókárpitja nyitott ajtónál' },
      { image: c3, alt: 'A Citroën C4 utastere a középkonzollal és a letisztított lábtérrel' },
      { image: c4, alt: 'A Citroën C4 középkonzolja és váltója közelről, tisztítás után' },
    ],
  },
  {
    slug: 'ford-mondeo',
    vehicle: 'Ford Mondeo',
    category: 'Kombi',
    service: 'Belső takarítás',
    price: 30,
    summary:
      'Kombi kivitelű gépjármű. A teljes belső takarítás során az elhanyagolt beltér ' +
      'visszanyerte a régi formáját — a csomagtértől a lábtérig.',
    photos: [
      { image: ford1, alt: 'A Ford Mondeo kitisztított csomagtere, felporszívózott kárpittal' },
      { image: ford2, alt: 'A Ford Mondeo vezetőoldali lábtere a pedálokkal, tisztítás után' },
      { image: ford3, alt: 'A Ford Mondeo középkonzolja, váltója és kezelőszervei letisztítva' },
      { image: ford4, alt: 'A Ford Mondeo lábtere gumiszőnyeggel és letisztított ajtókárpittal' },
    ],
  },
];

export function workBySlug(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}
