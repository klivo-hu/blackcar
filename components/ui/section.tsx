import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SectionDivider, type Surface } from '@/components/divider/section-divider';

/**
 * Egy szekció: felület, függőleges ritmus, és a fölötte lévő határ.
 *
 * Három felület van, és ez a teljes készlet: **obszidián → grafit → csont**.
 * A szekció maga rajzolja ki a fölötte lévő határt, és ehhez egyetlen dolgot
 * kell tudnia: melyik felületről érkezünk (`from`). A cél a saját felülete, a
 * forma pedig ebből következik (`SectionDivider`).
 *
 * **Szomszédos szekció nem lehet azonos felületű.** Ha az lenne, a határ
 * önmagába rajzolna, és láthatatlan sávként csak helyet foglalna. Az oldalak
 * ezért felváltva léptetik a felületeket.
 *
 * **Kapcsolható szekció nem döntheti el magáról, hogy megjelenik-e.** Minden
 * szekció a *fölötte* lévő felületről érkezik; ha egy szekció maga döntene a
 * láthatóságáról, az alatta lévő rossz színről indítaná a határát, és látható
 * varrás maradna. A döntést ezért az oldal hozza meg, és ugyanott dől el a
 * következő szekció `from` értéke is.
 *
 * A `data-surface` attribútumot a globális CSS olvassa: a fókuszgyűrű és a
 * kijelölés színe felületenként más.
 */

export type SectionTone = Surface;

const TONE_CLASS: Record<SectionTone, string> = {
  obsidian: 'bg-obsidian text-on-dark',
  graphite: 'bg-graphite text-on-dark',
  bone: 'bg-bone text-ink',
};

export function Section({
  id,
  tone = 'obsidian',
  from,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  tone?: SectionTone;
  /** A fölötte lévő szekció felülete. Az oldal első szekcióján nincs. */
  from?: SectionTone;
  /** Annak a címsornak az azonosítója, amelyik a szekciót elnevezi. */
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      {from ? <SectionDivider from={from} to={tone} /> : null}
      <section
        id={id}
        aria-labelledby={labelledBy}
        data-surface={tone}
        className={cn('relative isolate py-20 md:py-24 lg:py-30', TONE_CLASS[tone], className)}
      >
        {children}
      </section>
    </>
  );
}
