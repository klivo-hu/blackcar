import { cn } from '@/lib/cn';
import {
  DIVIDER_HEIGHT,
  DIVIDER_WIDTH,
  chamferEdge,
  fillBelow,
  sweepEdge,
  terraceEdge,
  type DividerShape,
} from '@/lib/divider-path';

/**
 * A szekcióhatár.
 *
 * **A forma az érkező felületé.** A sáv felső színe a fölötte lévő szekcióé
 * (`from`), a rajzolt alakzat pedig az alatta lévőé (`to`) — tehát a határ nem
 * külön díszítés, hanem a két felület találkozása. A `to` határozza meg a
 * formát is, a `SHAPE` táblázat szerint; így egy szekció beszúrásakor nincs mit
 * eldönteni, csak a sorrendet kell helyesen megadni.
 *
 * Mindhárom forma **egyetlen nyitott felső él**, amit a `fillBelow` zár
 * felületté, és amin egy sárgaréz vonal fut végig. Ez az egyetlen hely az
 * oldalon, ahol az akcentus vonalként jelenik meg — és pont ezért működik: a
 * lakkozott élen megcsillanó fényt idézi, nem díszít.
 *
 * Szerver komponens, nulla kliensoldali JavaScripttel. Az `aria-hidden`
 * szándékos: ez felület, nem tartalom — a képernyőolvasónak nincs mit mondania
 * róla.
 */

export type Surface = 'obsidian' | 'graphite' | 'bone';

/** Melyik felülethez melyik forma tartozik. Ez a szabály, egy helyen. */
const SHAPE: Record<Surface, DividerShape> = {
  obsidian: 'chamfer',
  graphite: 'sweep',
  bone: 'terrace',
};

const EDGE: Record<DividerShape, () => string> = {
  chamfer: chamferEdge,
  sweep: sweepEdge,
  terrace: terraceEdge,
};

const SURFACE_FILL: Record<Surface, string> = {
  obsidian: 'rgb(var(--obsidian))',
  graphite: 'rgb(var(--graphite))',
  bone: 'rgb(var(--bone))',
};

const SURFACE_BG: Record<Surface, string> = {
  obsidian: 'bg-obsidian',
  graphite: 'bg-graphite',
  bone: 'bg-bone',
};

/**
 * A sáv magassága.
 *
 * Formánként más, mert más a rajz igénye: az ívnek kell a hely, hogy ív
 * maradjon és ne lapos folt legyen, a ferde vágásnak viszont pont a laposság
 * adja a feszességét. A `clamp` miatt mobilon sem nő el a határ a tartalom
 * rovására.
 */
const SHAPE_HEIGHT: Record<DividerShape, string> = {
  chamfer: 'clamp(2.75rem, 5.5vw, 5rem)',
  sweep: 'clamp(3.25rem, 6.5vw, 6rem)',
  terrace: 'clamp(2.5rem, 5vw, 4.5rem)',
};

export function SectionDivider({
  from,
  to,
  className,
}: {
  from: Surface;
  to: Surface;
  className?: string;
}) {
  const shape = SHAPE[to];
  const edge = EDGE[shape]();

  return (
    <div
      aria-hidden="true"
      // A `-mb-px` a felület és a sáv közti hajszálrést tünteti el: a böngésző
      // a tört pixelen néha világos vonalat hagy a kettő határán.
      className={cn('relative -mb-px block w-full', SURFACE_BG[from], className)}
      style={{ height: SHAPE_HEIGHT[shape] }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${DIVIDER_WIDTH} ${DIVIDER_HEIGHT}`}
        preserveAspectRatio="none"
        focusable="false"
        role="presentation"
      >
        <path d={fillBelow(edge)} fill={SURFACE_FILL[to]} />
        {/* A fényvonal **külön path**, nem a kitöltés körvonala: a körvonal a
            sáv alján és oldalain is végigfutna, és bekeretezné a szekciót
            ahelyett, hogy az élt rajzolná ki. A csont felületen mélyebb tónus
            kell, mert a világos sárgaréz ott 2,1:1 lenne. */}
        <path
          d={edge}
          fill="none"
          stroke={to === 'bone' ? 'rgb(var(--brass-deep))' : 'rgb(var(--brass))'}
          strokeWidth={1.5}
          // `vector-effect`: a `preserveAspectRatio="none"` a vonalvastagságot
          // is nyújtaná, és széles nézeten kövér csíkká hízna az él.
          vectorEffect="non-scaling-stroke"
          strokeLinecap="square"
          strokeLinejoin="miter"
          opacity={0.75}
        />
      </svg>
    </div>
  );
}
