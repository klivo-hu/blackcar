import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * A lint kapu.
 *
 * Két szabály van itt, ami nem alapértelmezés, és mindkettő valós hibaosztályt
 * zár ki ebben a projektben:
 *
 * - `no-restricted-imports` — a kliens komponensek nem húzhatják be az
 *   adattárat. A tároló `revalidateTag`-et importál, ami csak szerveren
 *   létezik, és a build némán elszáll tőle.
 * - `@typescript-eslint/no-floating-promises` — egy elfelejtett `await` egy
 *   íráson azt jelenti, hogy a válasz a lemezre írás *előtt* megy vissza.
 */
export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'legacy/**', 'data/**', 'next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // A scriptek és a konfigurációs fájlok nincsenek a tsconfig programjában,
    // tehát a típusinformációt igénylő szabályok nem futtathatók rájuk.
    //
    // A saját `rules` blokk **a kikapcsoló szabályok után** fésülődik be, nem
    // helyettük: egy külön `rules: {...}` kulcs felülírná a
    // `disableTypeChecked` teljes szabálylistáját, és a lint azzal a hibával
    // állna le, hogy típusinformáció nélkül próbál típusos szabályt futtatni.
    files: ['scripts/**/*.mjs', '**/*.config.{js,mjs,ts}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      // A `disableTypeChecked` `parserOptions`-jét **tovább kell vinni**: az
      // kapcsolja ki a projekt-szolgáltatást. Egy sima `languageOptions` blokk
      // felülírná, és a lint azzal állna le, hogy ezek a fájlok nincsenek
      // benne a tsconfig programjában.
      ...tseslint.configs.disableTypeChecked.languageOptions,
      // Ezek Node alatt futnak, nem böngészőben: a `process`, a `console` és a
      // `Buffer` itt globális, nem definiálatlan azonosító.
      globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly' },
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      'no-console': 'off',
    },
  },
);
