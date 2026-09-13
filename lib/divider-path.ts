/**
 * A szekcióelválasztók geometriája.
 *
 * Három felület van az oldalon, és **mindegyikhez egy saját elválasztó
 * tartozik**. A szabály egyetlen mondat: *az elválasztó formáját az a felület
 * adja, amelyikbe érkezünk.* Ezért nem kell oldalanként eldönteni, melyik forma
 * jön — elég a szekciók sorrendje, a határ magától következik belőle.
 *
 *   → obszidián  `chamfer`  — megtört ferde vágás, mint a karosszéria válvonala
 *   → grafit     `sweep`    — széles, középről elcsúsztatott ív: a polírozó útja
 *   → csont      `terrace`  — lépcsős perem, mint egy megmunkált lemezél
 *
 * Az útvonalakat itt **számoljuk**, nem kézzel írt `d` attribútumokból
 * másoljuk. Egy kézzel írt görbe minden módosításnál újrarajzolandó, és nem
 * lehet megmondani róla, miért pont ott van a töréspont. Ezek a függvények
 * paraméterekkel dolgoznak, amiknek van jelentésük.
 *
 * A koordinátarendszer 1440 egység széles és 100 magas. Az SVG
 * `preserveAspectRatio="none"`-nal nyúlik a nézet szélességére, tehát a
 * *látott* szög a képernyő szélességétől függ — ez szándékos: a forma a lapot
 * követi, nem fordítva.
 */

export const DIVIDER_WIDTH = 1440;
export const DIVIDER_HEIGHT = 100;

export type DividerShape = 'chamfer' | 'sweep' | 'terrace';

/** Kerekítés: a felesleges tizedesek csak hizlalják a HTML-t. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Megtört ferde vágás — a karosszéria válvonala.
 *
 * Nem egyetlen átló: a `kink` pontban megtörik, ahogy egy autó oldalán is
 * megtörik a fényt vezető él. Az aszimmetria (a törés nem középen van) az, ami
 * miatt ez rajzolt formának látszik, nem egy elforgatott téglalapnak.
 */
export function chamferEdge(): string {
  const kinkX = DIVIDER_WIDTH * 0.42;
  const left = DIVIDER_HEIGHT * 0.82;
  const kinkY = DIVIDER_HEIGHT * 0.46;
  const right = DIVIDER_HEIGHT * 0.04;

  return `M 0 ${round(left)} L ${round(kinkX)} ${round(kinkY)} L ${DIVIDER_WIDTH} ${round(right)}`;
}

/**
 * Széles, elcsúsztatott ív — a polírozó egyetlen áthúzása.
 *
 * A tetőpont a bal harmadban van, nem középen: egy középre szimmetrikus ív
 * buboréknak látszik, egy elcsúsztatott pedig mozdulatnak. A vezérlőpontok a
 * kereten kívülre nyúlnak (negatív `y`), ettől lapos és hosszú az ív ahelyett,
 * hogy púposodna.
 */
export function sweepEdge(): string {
  const start = DIVIDER_HEIGHT * 0.68;
  const end = DIVIDER_HEIGHT * 0.34;

  return [
    `M 0 ${round(start)}`,
    `C ${round(DIVIDER_WIDTH * 0.2)} ${round(-DIVIDER_HEIGHT * 0.1)}`,
    `${round(DIVIDER_WIDTH * 0.56)} ${round(-DIVIDER_HEIGHT * 0.04)}`,
    `${DIVIDER_WIDTH} ${round(end)}`,
  ].join(' ');
}

/**
 * Lépcsős él — megmunkált lemezperem.
 *
 * Öt vízszintes sík, köztük ferde emelkedőkkel, balról jobbra **lefelé**
 * lépve — tehát az ellenkező irányba, mint a `chamfer`, ami jobbra fölfelé
 * tart. Ez adja a két szögletes forma közötti különbséget.
 *
 * **A lépések nem egyformák.** Egyenletes osztással a forma lépcsőházzá válna:
 * a szem kiszámolja az elsőt, és a többit már nem nézi meg. A fogyó szélesség
 * (`RUNS`) és a gyorsuló süllyedés (`LEVELS`) attól tűnik megrajzoltnak, hogy
 * nem lehet előre kitalálni.
 *
 * Az emelkedők **ferdék**, ugyanabban a szögben, amiben a `chamfer` törik —
 * így a három elválasztó ugyanannak a formanyelvnek a három szava, nem három
 * külön ötlet. Egy korábbi változat itt huszonhat vékony lamellát rajzolt
 * (hűtőrács); teljes lapszélességen az vonalkóddá esett szét, és zajt adott
 * oda, ahol határnak kellett volna lennie.
 */

/** A síkok szélessége a sáv szélességének arányában. Összegük 1. */
const RUNS = [0.3, 0.24, 0.19, 0.15, 0.12];

/** A síkok magassága a sáv magasságának arányában, fentről lefelé. */
const LEVELS = [0.08, 0.24, 0.44, 0.66, 0.88];

export function terraceEdge({ slant = 10 }: { slant?: number } = {}): string {
  const parts: string[] = [`M 0 ${round(DIVIDER_HEIGHT * (LEVELS[0] as number))}`];
  let x = 0;

  for (let index = 0; index < RUNS.length; index += 1) {
    const y = DIVIDER_HEIGHT * (LEVELS[index] as number);
    x += DIVIDER_WIDTH * (RUNS[index] as number);

    // A sík: vízszintes szakasz a következő emelkedő tövéig.
    parts.push(`L ${round(x)} ${round(y)}`);

    const nextLevel = LEVELS[index + 1];
    if (nextLevel === undefined) break;

    // Az emelkedő: ferde szakasz a következő síkra. A `slant` előretolja a
    // tetejét, ettől dől meg — függőleges emelkedővel a forma mérnöki rajz
    // lenne, nem karosszériaél.
    x += slant;
    parts.push(`L ${round(x)} ${round(DIVIDER_HEIGHT * nextLevel)}`);
  }

  // A jobb szélig kifutó utolsó sík. Az `x` a kerekítések és a `slant` miatt
  // nem pontosan a szélen áll meg, ezért zárjuk le kifejezetten.
  parts.push(`L ${DIVIDER_WIDTH} ${round(DIVIDER_HEIGHT * (LEVELS[LEVELS.length - 1] as number))}`);

  return parts.join(' ');
}

/**
 * Egy nyitott felső élből zárt kitöltést csinál: lemegy a sáv aljára, végig,
 * és vissza. Enélkül az él vonal maradna, nem felület.
 */
export function fillBelow(edge: string): string {
  return `${edge} L ${DIVIDER_WIDTH} ${DIVIDER_HEIGHT} L 0 ${DIVIDER_HEIGHT} Z`;
}
