/**
 * Képhelyettesítő a tesztekhez.
 *
 * A Next.js a statikus képimportot metaadat-objektummá alakítja; a Vitest
 * viszont nyers `.jpg`-t kapna, amit nem tud értelmezni. Ez a modul ugyanazt az
 * alakot adja vissza, tehát a tartalmi tesztek a valódi adaton futnak, csak a
 * képpont nem jön velük.
 */
export default { src: '/teszt-kep.jpg', height: 1600, width: 1200, blurDataURL: '' };
