import { Oswald, Inter } from 'next/font/google';

/**
 * A két betűtípus.
 *
 * **Oswald a címsoroknak.** Az embléma felirata Haettenschweilerrel készült —
 * egy nagyon keskeny, nehéz groteszkkel. Ez a márka meglévő hangja, tehát a
 * címsorok is ezt folytatják; az Oswald ennek a szabadon elérhető, latin-ext
 * karakterkészletű megfelelője, tehát a magyar ékezetek is rendben vannak.
 *
 * **Inter a folyószövegnek.** A keskeny, nehéz betű hosszabb szövegben
 * olvashatatlan; a törzs ezért egy nyugodt, széles talpatlan betű, és a
 * kontraszt a kettő között maga a tipográfiai rendszer.
 *
 * A `next/font` build időben letölti és a saját kiszolgálónkról adja ki a
 * fájlokat: nincs futásidejű kérés idegen domainre (a CSP `font-src 'self'`-je
 * amúgy is blokkolná), és nincs elrendezés-ugrás sem, mert a `display: swap`
 * mellé a Next méretezett tartalék betűt számol.
 */

export const fontDisplay = Oswald({
  subsets: ['latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const fontSans = Inter({
  subsets: ['latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});
