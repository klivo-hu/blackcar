import Image from 'next/image';
import heroStage from '@/assets/stage/hero.jpg';
import heroCar from '@/assets/stage/hero-car.jpg';
import { site } from '@/lib/content/site';
import { ServicePicker } from '@/components/sections/service-picker';

/**
 * A nyitóképernyő.
 *
 * **A kompozíció nem „főcím középen, alatta két gomb".** A lap egy sötét
 * műtermi színpad: a cím a bal alsó sarokban ül, a jobb oldalt egy lakkfelület
 * zárja le ferde éllel — ugyanabban a szögben, amiben a szekcióhatárok törnek —,
 * és a képernyő alján végigfut a szolgáltatásválasztó. A szem így balról jobbra
 * és fentről lefelé halad: mit csinálunk, hogy néz ki, mennyibe kerül.
 *
 * **A fény a mutatót követi.** A háttéren egy halk fényfolt ül, ami a kurzor
 * után mozog: ugyanaz a mozdulat, amivel a lakkot ellenőrzik a műhelyfény
 * alatt. Nem díszítés — ez teszi a felületet *felületté* ahelyett, hogy sík
 * fekete maradna. A követést a `MotionDriver` végzi, egyetlen figyelővel az
 * egész oldalra; érintőképernyőn és csökkentett mozgás mellett elmarad, és a
 * folt középen áll.
 *
 * A magasság `svh`-ban van, nem `vh`-ban: mobil böngészőben a `vh` a
 * *kirajzolt* nézetnél nagyobb, tehát a választósáv a lap alján lelógna a
 * címsor alá, és a látogató azt hinné, nincs is ott.
 */
export function Hero({
  bookingEnabled,
  bookingHref,
  bookingLabel,
}: {
  bookingEnabled: boolean;
  bookingHref: string;
  bookingLabel: string;
}) {
  return (
    <section
      aria-labelledby="hero-cim"
      data-surface="obsidian"
      data-sheen
      className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden bg-obsidian pt-20 lg:min-h-[92svh]"
    >
      {/* A színpad háttere. `priority`, mert ez a legnagyobb tartalmi elem a
          nyitóképen — lusta betöltéssel a Largest Contentful Paint rá várna. */}
      <Image
        src={heroStage}
        alt=""
        aria-hidden="true"
        priority
        quality={82}
        sizes="100vw"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
      />

      {/* A fényfolt. Alapból középen áll; a `--sheen-x` / `--sheen-y`
          változókat a mutató mozgatja. `mix-blend-screen`: a fény *hozzáad* a
          felülethez, nem kitakarja — egy sima fehér folt szürke paca lenne. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen"
        style={{
          background:
            'radial-gradient(38rem 38rem at var(--sheen-x, 50%) var(--sheen-y, 40%), rgb(var(--brass) / 0.16), transparent 65%)',
        }}
      />

      {/* Alsó sötétítés: a cím és a választósáv fölött a kép sosem világosodhat
          annyira, hogy a fehér szöveg 4,5:1 alá essen. Ez nem hangulat, hanem
          a kontraszt garanciája egy olyan kép fölött, amit nem mi szabunk meg. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-obsidian via-obsidian/80 to-obsidian/30"
      />

      <div className="mx-auto grid w-full max-w-wide flex-1 grid-cols-1 items-end gap-10 px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-20">
        <div className="lg:col-span-7 xl:col-span-6">
          <h1 id="hero-cim" className="text-display text-on-dark">
            Autókozmetika
            <span className="block text-brass">{site.city}ban</span>
          </h1>

          <p className="mt-6 max-w-xl text-body text-on-dark-muted sm:mt-7 sm:text-body-lg">
            Segítünk autója állapotának megőrzésében és újkori fényének visszahozásában — a városi
            kisautótól a kisteherautóig. Gépi mosó nélkül, méret szerinti, előre kimondott áron.
          </p>

          {/* Három tény, nem három díszítés: ezek döntik el, hogy valaki
              behozza-e az autót. Számot egyik sem állít, amit ne mondtunk
              volna ki máshol is. */}
          <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-4 sm:mt-9 sm:gap-y-5">
            {[
              { label: 'Helyszín', value: `${site.city} és 20 km` },
              { label: 'Munkaidő', value: '2 – 5 óra' },
              { label: 'Ár', value: 'Méret szerint, fixen' },
            ].map((fact) => (
              <li key={fact.label}>
                <span className="block text-body-sm text-on-dark-muted">{fact.label}</span>
                <span className="mt-1 block font-display text-h5 uppercase tracking-wide text-on-dark">
                  {fact.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* A kép a nagy nézetek jobb oldalán zárja a kompozíciót. Kisebb
            nézeten elmarad: ott a cím és a választósáv a lényeg, egy harmadik
            nagy elem csak lejjebb tolná az árat.

            **Ez hangulati kép, nem referencia** — ezért nincs alatta felirat,
            és ezért `alt=""`. A valódi munkafotók a referencia szekcióban és a
            `/referenciak` oldalon vannak, ott ki is van írva, melyik autó,
            milyen szolgáltatás és mennyiért. Egy hangulati képet elvégzett
            munkaként feltüntetni félrevezetés lenne. */}
        <div className="relative hidden lg:col-span-5 lg:block xl:col-span-6">
          <div
            // A `ring` és nem `border`: a `clip-path` a keretet is levágná a
            // ferde élnél, és a maradék három oldalon félbehagyott keret
            // maradna. A gyűrű a vágott alakot követi.
            className="relative ml-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-card ring-1 ring-inset ring-steel"
            // A ferde bal felső él ugyanaz a mozdulat, mint a `chamfer`
            // szekcióhatáré: a kép így a lap formanyelvének része, nem egy
            // beillesztett téglalap.
            style={{ clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)' }}
          >
            <Image
              src={heroCar}
              alt=""
              aria-hidden="true"
              priority
              quality={82}
              sizes="(min-width: 1280px) 28rem, 24rem"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <ServicePicker
        bookingEnabled={bookingEnabled}
        bookingHref={bookingHref}
        bookingLabel={bookingLabel}
      />
    </section>
  );
}
