import type { Config } from 'tailwindcss';

/**
 * A design rendszer Tailwindra fordítva.
 *
 * Minden szín CSS egyedi tulajdonságból jön (`app/globals.css`), RGB hármasként
 * tárolva, hogy a Tailwind alfa-módosítói (`bg-obsidian/70`) továbbra is
 * működjenek. Így a tokenek egyetlen helyen élnek, és a sötét szekciók
 * ugyanazokat a neveket használják, mint a világosak.
 *
 * Nincs `gradient` segédosztály és nincs második akcentus a sárgaréz mellett:
 * mindkettő kimondott tervezési döntés, és azzal tartjuk be, hogy nem is
 * létezik hozzájuk token.
 */

function withAlpha(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // A három szekciófelület. Ez a teljes készlet — negyedik nincs.
        obsidian: withAlpha('--obsidian'),
        graphite: withAlpha('--graphite'),
        bone: withAlpha('--bone'),
        // Kiemelt felületek a felületeken belül (kártya, panel).
        slate: withAlpha('--slate'),
        paper: withAlpha('--paper'),
        // Szöveg.
        ink: withAlpha('--ink'),
        'ink-soft': withAlpha('--ink-soft'),
        muted: withAlpha('--muted'),
        'on-dark': withAlpha('--on-dark'),
        'on-dark-muted': withAlpha('--on-dark-muted'),
        // Az egyetlen akcentus: sárgaréz. Két tónus, mert a világos felületen a
        // sötét felületi változat 2,1:1 lenne.
        brass: withAlpha('--brass'),
        'brass-deep': withAlpha('--brass-deep'),
        // Keret.
        steel: withAlpha('--steel'),
        line: withAlpha('--line'),
        'line-strong': withAlpha('--line-strong'),
        // Állapotjelzés. Csak visszajelzésre, soha díszítésre.
        success: withAlpha('--success'),
        danger: withAlpha('--danger'),
      },
      fontFamily: {
        // A változónevek az `app/fonts.ts`-ben dőlnek el.
        display: ['var(--font-display)', 'Haettenschweiler', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // A nagy fokozatok `clamp`-pel folyékonyak. Fix méreten a hosszú magyar
        // szavak („autókozmetika", „időpontfoglalás") 360 px-es nézeten
        // kilógnának, és ezt semmilyen sortörés nem javítja: egy szó nem fér el.
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        body: ['1.0625rem', { lineHeight: '1.7' }],
        'body-lg': ['1.1875rem', { lineHeight: '1.65' }],
        h6: ['1.0625rem', { lineHeight: '1.3', letterSpacing: '0.01em' }],
        h5: ['1.3125rem', { lineHeight: '1.25', letterSpacing: '0' }],
        h4: ['1.625rem', { lineHeight: '1.18', letterSpacing: '0' }],
        h3: ['clamp(1.625rem, 3.4vw, 2.125rem)', { lineHeight: '1.12', letterSpacing: '0' }],
        h2: ['clamp(2rem, 5vw, 3.25rem)', { lineHeight: '1.02', letterSpacing: '0' }],
        h1: ['clamp(2.5rem, 6.4vw, 4.25rem)', { lineHeight: '0.98', letterSpacing: '0' }],
        display: ['clamp(3rem, 9.5vw, 6.5rem)', { lineHeight: '0.9', letterSpacing: '-0.01em' }],
      },
      spacing: {
        // A 4px-es alapegység Tailwind-alapértelmezés; csak a szekció-ritmus
        // hiányzó lépéseit vesszük fel.
        13: '3.25rem',
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        content: '80rem', // 1280px
        wide: '90rem', // 1440px
        prose: '44rem', // ~65 karakter
      },
      borderRadius: {
        // Egyetlen lekerekítési rendszer. A `pill` a navigációé és a gomboké.
        card: '0.75rem',
        panel: '1.25rem',
        pill: '9999px',
      },
      boxShadow: {
        // Árnyék csak elemeléshez, soha díszítésnek. Három szint, nem több.
        raise: '0 1px 2px rgb(var(--shadow) / 0.24), 0 4px 14px rgb(var(--shadow) / 0.18)',
        float: '0 2px 6px rgb(var(--shadow) / 0.28), 0 14px 34px rgb(var(--shadow) / 0.24)',
        lift: '0 4px 12px rgb(var(--shadow) / 0.30), 0 28px 64px rgb(var(--shadow) / 0.34)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-out)',
        entrance: 'var(--ease-out)',
        exit: 'var(--ease-in-out)',
      },
      transitionDuration: {
        feedback: '140ms',
        ui: '220ms',
        panel: '320ms',
        page: '460ms',
      },
    },
  },
  plugins: [],
};

export default config;
