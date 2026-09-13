import { LogoMark } from '@/components/site/logo';
import { site } from '@/lib/content/site';

/**
 * A nyitó függöny.
 *
 * Fekete lap, rajta a márkajel, és egyetlen ferde fénypászma, ami végigsöpör —
 * ugyanaz a mozdulat, amivel a frissen lakkozott felületet ellenőrzik a
 * műhelyfény alatt. A leleplezés tehát az oldal saját formanyelvén történik,
 * nem egy általános pörgő karikával.
 *
 * **Összesen 2,6 másodperc**, ebből az utolsó 0,7 a felhúzás. A határ három
 * másodperc, és a bevezető nem nyúlhat odáig: az első látogatás első
 * másodperceit nem szabad elvenni attól, aki árat keres.
 *
 * Szerver komponens, nulla kliensoldali JavaScripttel: hogy egyáltalán
 * lefusson-e, azt a `MotionBoot` fejlécszkript dönti el a `<html>` egy
 * adat-attribútumával, a mozgást pedig CSS animáció végzi. Ha bármi elakad, a
 * függöny alapból **rejtett** — nem az a hibás állapot áll elő, hogy egy fekete
 * lap marad a tartalom fölött.
 */
export function IntroCurtain() {
  return (
    <div className="intro" aria-hidden="true">
      <span className="intro__sweep" />
      <span className="intro__mark">
        <LogoMark className="h-auto w-[clamp(11rem,42vw,22rem)] text-on-dark" />
        <span className="intro__rule" />
        <span className="font-display text-[clamp(1rem,3vw,1.5rem)] font-semibold uppercase tracking-[0.34em] text-on-dark-muted">
          {site.city}
        </span>
      </span>
    </div>
  );
}
