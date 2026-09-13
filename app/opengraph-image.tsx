import { ImageResponse } from 'next/og';
import { site } from '@/lib/content/site';

/**
 * A megosztási kép.
 *
 * **Rajzolt, nem generált fotó.** A megosztási kép lényege a szöveg: a
 * márkanév, a város és az, hogy mit csinálunk. Egy AI-val előállított képen a
 * felirat mindig kockázat — hibás ékezet, torz betű —, itt viszont valódi
 * szövegréteg, tehát pontosan az van rajta, amit írtunk.
 *
 * A kompozíció ugyanaz, mint a nyitóképernyőé: sötét felület, sárgaréz vonal,
 * bal alsó sarokban a cím. Aki a megosztott linkről érkezik, ugyanazt látja
 * viszont.
 *
 * A `runtime` szándékosan nincs `edge`-re állítva: a kép build időben egyszer
 * elkészül, és a `standalone` kimenet mellett a Node futtatókörnyezet az,
 * amiben a `next/og` biztosan rendelkezésre áll.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${site.name} — autókozmetika ${site.city}ban`;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: '#0A0A0B',
        padding: 72,
        position: 'relative',
      }}
    >
      {/* A ferde vágás: ugyanaz a forma, mint a szekcióhatárokon.
            Elforgatott téglalap, a sárgaréz fényvonal pedig az **alsó
            szegélye** — nem külön elem. Két külön elforgatott sáv a saját
            középpontja körül fordulna, tehát más-más eltolást kapna, és a
            vonal elcsúszna a vágás élétől. Egy elem egy szegéllyel nem tud
            elcsúszni önmagától. */}
      <div
        style={{
          position: 'absolute',
          top: -220,
          right: -160,
          width: 900,
          height: 420,
          background: '#141417',
          borderBottom: '3px solid #C8A253',
          transform: 'rotate(-14deg)',
        }}
      />

      <div style={{ display: 'flex', width: 52, height: 5, background: '#C8A253' }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 28,
          color: '#F2F0EC',
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
        }}
      >
        <span>Autókozmetika</span>
        <span style={{ color: '#C8A253' }}>{site.city}ban</span>
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 30,
          color: '#A8A59D',
          fontSize: 30,
          lineHeight: 1.4,
          maxWidth: 820,
        }}
      >
        Külső, belső és teljes takarítás — méret szerinti, előre kimondott áron.
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 40,
          paddingTop: 28,
          borderTop: '1px solid #2E2E36',
          color: '#F2F0EC',
          fontSize: 28,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {site.name}
      </div>
    </div>,
    size,
  );
}
