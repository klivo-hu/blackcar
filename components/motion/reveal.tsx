import type { CSSProperties, ElementType, ReactNode } from 'react';

/**
 * Görgetésre megjelenő tartalom.
 *
 * Csak megjelöli az elemet; a megfigyelést a `MotionDriver` végzi egyetlen
 * `IntersectionObserver`-rel az egész oldalra. Ezért maradhat szerver
 * komponens, és ezért nem hoz létre egy húszkártyás rács húsz figyelőt.
 *
 * A `delay` a lépcsőzéshez van: egy rácsban 60 ms-onként lépve a szem követni
 * tudja a sorrendet. Négy-öt elem fölött a lépcsőzés már várakozás, ezért a
 * hívó helyek felső korláttal számolják (`staggerDelay`).
 */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  variant,
  className,
  id,
  children,
}: {
  as?: ElementType;
  /** Késleltetés ezredmásodpercben. */
  delay?: number;
  /**
   * `figure` — képekhez, nagyobb elmozdulással és egy hajszálnyi nagyítással.
   * `left` / `right` — oldalról érkező elem.
   */
  variant?: 'figure' | 'left' | 'right' | undefined;
  className?: string | undefined;
  /** Horgony, ha a szekcióra hivatkozni kell. */
  id?: string | undefined;
  children: ReactNode;
}) {
  return (
    <Tag
      data-reveal={variant ?? ''}
      id={id}
      className={className}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/** Lépcsőzés felső korláttal: a hatodik elem után nincs további várakozás. */
export function staggerDelay(index: number, step = 60, max = 5): number {
  return Math.min(index, max) * step;
}
