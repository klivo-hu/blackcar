import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Osztálynevek összefésülése, a Tailwind ütközéseinek feloldásával.
 *
 * **Miért van itt konfiguráció.** A `tailwind-merge` a beépített méretnevekből
 * ismeri fel a betűméret-osztályokat (`text-sm`, `text-lg`). A mi skálánk saját
 * nevekkel dolgozik (`text-h3`, `text-body-lg`), amelyeket a könyvtár
 * *szövegszínnek* néz — így egy `cn('text-h3', 'text-ink')` hívásban a kettőt
 * ütközőnek hiszi, és eldobja a méretet.
 *
 * Ez néma hiba: nincs figyelmeztetés, nincs fordítási hiba, csak a címsor lesz
 * akkora, mint a folyószöveg. Ezért kap a könyvtár explicit listát a skáláról.
 * A lista a `tailwind.config.ts` `fontSize` kulcsaival egyezik; ha ott bővül,
 * itt is bővíteni kell.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: ['body-sm', 'body', 'body-lg', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1', 'display'],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
