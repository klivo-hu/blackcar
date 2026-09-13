import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * A tesztfuttató.
 *
 * A `@/` feloldást itt meg kell ismételni: a Vitest a `tsconfig.json` `paths`
 * mezőjét nem olvassa. Enélkül minden `@/lib/...` import „modul nem található"
 * hibával áll le, ami a tesztek írásakor az első fal.
 *
 * A referenciafotók statikus importtal jönnek (`lib/content/works.ts`), és a
 * Vitest a `.jpg`-t nem tudja értelmezni — ezért van rá egy alias, ami egy apró
 * modulra mutat. Az objektum alakja megegyezik azzal, amit a Next ad (`src`,
 * `width`, `height`), tehát a tesztelt kód ugyanazt látja.
 *
 * **A képminta a teljes modulazonosítóra illeszkedik** (`^.*`), nem csak a
 * kiterjesztésre: a Vite az illeszkedő *részletet* cseréli le, tehát egy
 * `/\.jpg$/` mintából `@/assets/munkak/alfa1<útvonal>` lenne — és a hibaüzenet
 * az eredeti importra mutatna, nem a rossz aliasra.
 *
 * A sorrend is számít: a képminta áll elöl, mert a `@` alias különben előbb
 * illeszkedne a `@/assets/...jpg` elejére.
 */
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^.*\.(jpe?g|png|webp|avif|gif)$/,
        replacement: fileURLToPath(new URL('./tests/stub-image.ts', import.meta.url)),
      },
      { find: '@', replacement: fileURLToPath(new URL('./', import.meta.url)) },
    ],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
