#!/usr/bin/env node
/**
 * A `public/favicon.ico` előállítása.
 *
 *   npm run gen:favicon
 *
 * **Miért kell, ha van `app/icon.tsx`.** Az `app/icon.tsx` futásidőben rajzol
 * egy PNG-t, és a Next kiteszi rá a `<link rel="icon">` címkét — a böngésző
 * ebből dolgozik. Van viszont egy sereg kliens, amelyik a címke elolvasása
 * nélkül, konvencióból kéri a gyökérből a `/favicon.ico`-t: régebbi
 * böngészők, hírolvasók, chat-előnézetek és néhány kereső-robot. Azoknak ez a
 * fájl a válasz — enélkül 404-et kapnának.
 *
 * A rajz **ugyanaz**, mint az `app/icon.tsx`-é: sárgaréz „B" obszidián alapon.
 * 32 képponton az autó sziluettje felismerhetetlen paca lenne; ez az a méret,
 * ahol egy egyszerű forma többet ér, mint egy pontos, de olvashatatlan.
 *
 * Az ICO egy konténerformátum: több méretet tartalmaz, és a Vista óta
 * megengedett, hogy az egyes bejegyzések PNG-ként legyenek tömörítve. Ezt
 * használjuk, mert így a sharp PNG kimenete változtatás nélkül becsomagolható.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SIZES = [16, 32, 48];
const BACKGROUND = '#0A0A0B';
const FOREGROUND = '#C8A253';

/**
 * A márkajel SVG-ként, hogy méretfüggetlenül élesen skálázódjon.
 *
 * **A „B" nem szövegként van szedve, hanem útvonalként.** A szöveges változat
 * attól függne, milyen betűtípusok vannak a *generáló gépen* telepítve: ahol
 * nincs Impact, ott a tartalék betű más törzsmagasságot ad, és a betű vagy
 * elúszik, vagy levágódik a keret tetején. Pontosan ez történt az első
 * változattal. Egy útvonal mindenhol ugyanazt rajzolja.
 *
 * A forma szándékosan zömök és vastag: 16 képponton a vékony szár eltűnik.
 */
function markSvg(size) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
       <rect width="32" height="32" fill="${BACKGROUND}"/>
       <path fill="${FOREGROUND}" d="M8 7h9.4c3.5 0 5.6 1.7 5.6 4.6 0 1.8-.9 3.2-2.4 3.9 1.9.6 3 2.1 3 4.2 0 3.2-2.3 5.3-6 5.3H8V7zm4.4 3.3v4h4.3c1.4 0 2.2-.7 2.2-2s-.8-2-2.2-2h-4.3zm0 7v4.4h4.7c1.5 0 2.4-.8 2.4-2.2s-.9-2.2-2.4-2.2h-4.7z"/>
     </svg>`,
  );
}

/**
 * ICO konténer PNG bejegyzésekből.
 *
 * A fejléc hat bájt (foglalt, típus, darabszám), majd bejegyzésenként tizenhat
 * bájt könyvtárbejegyzés, végül a képadatok. A `width`/`height` mezők egy
 * bájtosak, tehát a 256-os méret 0-ként kódolódik — ezt itt nem érinti, mert
 * 48-nál nagyobb méretet nem teszünk bele.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // foglalt
  header.writeUInt16LE(1, 2); // 1 = ikon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // paletta mérete — PNG-nél 0
    entry.writeUInt8(0, 3); // foglalt
    entry.writeUInt16LE(1, 4); // színsíkok
    entry.writeUInt16LE(32, 6); // bit/képpont
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

async function main() {
  await mkdir('public', { recursive: true });

  const images = [];
  for (const size of SIZES) {
    const data = await sharp(markSvg(size), { density: 384 }).resize(size, size).png().toBuffer();
    images.push({ size, data });
  }

  const ico = buildIco(images);
  await writeFile('public/favicon.ico', ico);

  console.log(`public/favicon.ico  ${SIZES.join(', ')} px  ${(ico.length / 1024).toFixed(1)} kB`);
}

await main();
