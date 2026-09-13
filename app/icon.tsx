import { ImageResponse } from 'next/og';

/**
 * A böngészőfül ikonja.
 *
 * Futásidőben rajzolódik, nem képfájlból: így nincs külön eszköz, amit egy
 * arculatváltás után el lehetne felejteni cserélni, és a `LocalBusiness`
 * strukturált adat `logo` mezője is erre mutathat.
 *
 * 32×32-en az autó sziluettje felismerhetetlen paca lenne, ezért a favicon egy
 * betű: a márkanév kezdőbetűje sárgaréz alapon. Ez az a méret, ahol egy
 * egyszerű forma többet ér, mint egy pontos, de olvashatatlan.
 */
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0A0B',
        color: '#C8A253',
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: '-0.04em',
      }}
    >
      B
    </div>,
    size,
  );
}
