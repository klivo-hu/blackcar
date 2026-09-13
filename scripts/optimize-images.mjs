#!/usr/bin/env node
/**
 * A referenciafotók előkészítése.
 *
 *   npm run images
 *
 * A `legacy/images/munkaim/` mappában a vállalkozás **valódi** munkafotói
 * vannak, telefonnal készítve: 3000×4000, egyenként 3–13 MB. Ez így sem az
 * image-be, sem a bundle-be nem mehet — 60 MB forráskép mellett a Docker build
 * és a telepítés is perceket veszít, a látogató pedig ugyanazt a képet kapja,
 * mint 1600 pixelről.
 *
 * A kimenet az `assets/munkak/` alá kerül, nem a `public/` alá, mert a
 * komponensek **statikus importtal** hivatkoznak rájuk. Így a Next build
 * időben ismeri a méretarányt (nincs elrendezés-ugrás) és maga állítja elő a
 * homályos helyőrzőt — nincs kézzel karbantartott méret- vagy blur-táblázat,
 * ami elcsúszhatna a képektől.
 *
 * A script idempotens: a meglévő, frissebb kimenetet nem írja újra.
 */

import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = 'legacy/images/munkaim';
const TARGET_DIR = 'assets/munkak';

/**
 * A hosszabb él maximuma. A fotók álló tájolásúak (3:4), tehát ez 1200×1600-at
 * ad — elég egy teljes képernyős nagyításhoz is retina kijelzőn, mert a Next
 * ebből szolgálja ki a kisebb méreteket.
 */
const MAX_EDGE = 1600;
const QUALITY = 80;

async function isUpToDate(source, target) {
  try {
    const [a, b] = await Promise.all([stat(source), stat(target)]);
    return b.mtimeMs >= a.mtimeMs;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(TARGET_DIR, { recursive: true });

  const files = (await readdir(SOURCE_DIR)).filter((name) => /\.(jpe?g|png|webp)$/i.test(name));
  if (files.length === 0) {
    console.error(`Nincs feldolgozható kép itt: ${SOURCE_DIR}`);
    process.exitCode = 1;
    return;
  }

  let written = 0;
  let skipped = 0;

  for (const name of files) {
    const source = join(SOURCE_DIR, name);
    const target = join(TARGET_DIR, `${parse(name).name}.jpg`);

    if (await isUpToDate(source, target)) {
      skipped += 1;
      continue;
    }

    await sharp(source)
      // `withoutEnlargement`: egy kisebb eredetit nem nagyítunk föl — a
      // felnagyított kép nem lesz részletesebb, csak nagyobb.
      .rotate() // EXIF tájolás beégetése; enélkül a telefonos fotók eldőlnek.
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toFile(target);

    const { size } = await stat(target);
    console.log(`${target}  ${(size / 1024).toFixed(0)} kB`);
    written += 1;
  }

  // A mappa nem maradhat üresen verziókövetve, ha valaha az lenne.
  await writeFile(
    join(TARGET_DIR, '.gitkeep'),
    '# A képeket a scripts/optimize-images.mjs állítja elő.\n',
    'utf8',
  );

  console.log(`\nKész: ${written} kép átméretezve, ${skipped} változatlan.`);
}

await main();
