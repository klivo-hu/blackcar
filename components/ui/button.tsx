import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Az oldal egyetlen gombja.
 *
 * Négy változat, két hangnem, két méret — és semmi több. Minden cselekvés
 * ugyanígy néz ki és ugyanúgy viselkedik, mert a látogatónak egyszer kelljen
 * megtanulnia, mi kattintható.
 *
 * A `tone="dark"` nem egy másik komponens, hanem ugyanennek a gombnak a sötét
 * felületen használt párja: egy hover-időzítés vagy egy sarokrádiusz
 * megváltoztatása így egy helyen történik.
 *
 * **A fénycsík.** Nyugalmi állapotban a gomb tiszta. Rálebegésre egy keskeny
 * fénypászma söpör végig rajta balról jobbra — ugyanaz a mozdulat, amivel a
 * nyitó függöny is dolgozik, és amivel a lakkot ellenőrzik a fény alatt. Nem
 * világít, nem lüktet: egyszer áthalad, és vége. Csak finom mutatóval, mert
 * érintésre a hover hamisan sülne el.
 *
 * A lenyomás egy hajszálnyi összenyomás: a gomb *helye* nem mozdul, tehát a
 * mutató nem csúszik le róla menet közben.
 */

const button = cva(
  [
    'group/button relative inline-flex items-center justify-center gap-2 overflow-hidden',
    'rounded-pill font-display font-semibold uppercase tracking-wide whitespace-nowrap',
    'transition-[background-color,border-color,color,transform,box-shadow] duration-feedback ease-standard',
    'active:scale-[0.985]',
    'disabled:pointer-events-none disabled:opacity-55',
  ],
  {
    variants: {
      variant: {
        primary: 'shadow-raise hover:shadow-float',
        secondary: 'border',
        ghost: 'border border-transparent',
        // Csak visszafordíthatatlan műveletre (törlés) az adminban.
        danger: 'border border-danger/50 text-danger hover:bg-danger/10',
      },
      tone: {
        light: '',
        dark: '',
      },
      size: {
        md: 'h-11 px-5 text-body-sm',
        lg: 'h-13 px-7 text-body',
      },
    },
    compoundVariants: [
      {
        // Sötét felületen a sárgaréz a legerősebb hívás, fekete felirattal:
        // 8,2:1. Fehér gomb itt túl hangos lenne, és elvenné a fotók helyét.
        variant: 'primary',
        tone: 'dark',
        class: 'bg-brass text-obsidian hover:bg-brass/90',
      },
      {
        variant: 'primary',
        tone: 'light',
        class: 'bg-obsidian text-on-dark hover:bg-graphite',
      },
      {
        variant: 'secondary',
        tone: 'dark',
        class: 'border-steel bg-slate text-on-dark hover:border-brass/60 hover:bg-slate/80',
      },
      {
        variant: 'secondary',
        tone: 'light',
        class: 'border-line-strong bg-paper text-ink hover:border-brass-deep/60',
      },
      {
        variant: 'ghost',
        tone: 'dark',
        class: 'text-on-dark hover:border-steel hover:bg-slate',
      },
      {
        variant: 'ghost',
        tone: 'light',
        class: 'text-ink hover:border-line-strong hover:bg-paper',
      },
    ],
    defaultVariants: { variant: 'primary', tone: 'dark', size: 'md' },
  },
);

type ButtonVariants = VariantProps<typeof button>;

/**
 * A jobbra mutató nyíl a hover irányát erősíti: „ez tovább visz".
 * Dekoráció, ezért a képernyőolvasó elől el van rejtve.
 */
function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4 transition-transform duration-feedback ease-standard group-hover/button:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d="M2.5 8h11M9.5 4l4 4-4 4" />
    </svg>
  );
}

/**
 * A fénypászma.
 *
 * Nyugalomban a gombon kívül áll (`-150%`), rálebegésre átsöpör. Nem
 * végtelenített: az átmenet egyszer lefut, és a mutató távozásakor
 * visszaugrik — a visszaút azért nem animált, mert egy oda-vissza söprés
 * hintázásnak látszana, nem fénynek.
 *
 * `mix-blend-overlay`: a pászma a gomb *saját* színén világosít, tehát a
 * sárgaréz és a sötét gombon is helyes marad, két külön szabály nélkül.
 */
function Sheen() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/35',
        'mix-blend-overlay opacity-0 transition-none',
        '[@media(hover:hover)]:group-hover/button:translate-x-[420%]',
        '[@media(hover:hover)]:group-hover/button:opacity-100',
        '[@media(hover:hover)]:group-hover/button:transition-transform',
        '[@media(hover:hover)]:group-hover/button:duration-[620ms]',
        '[@media(hover:hover)]:group-hover/button:ease-standard',
      )}
    />
  );
}

type CommonProps = ButtonVariants & {
  className?: string;
  children: ReactNode;
  /** Nyíl a felirat után. Csak továbbvivő cselekvésen. */
  arrow?: boolean;
};

export function ButtonLink({
  href,
  variant,
  tone,
  size,
  className,
  arrow = false,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  return (
    <Link href={href} className={cn(button({ variant, tone, size }), className)} {...rest}>
      <Sheen />
      <span className="relative inline-flex items-center gap-2">
        {children}
        {arrow ? <Arrow /> : null}
      </span>
    </Link>
  );
}

export function Button({
  variant,
  tone,
  size,
  className,
  arrow = false,
  children,
  type = 'button',
  ...rest
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button type={type} className={cn(button({ variant, tone, size }), className)} {...rest}>
      <Sheen />
      <span className="relative inline-flex items-center gap-2">
        {children}
        {arrow ? <Arrow /> : null}
      </span>
    </button>
  );
}

/**
 * Külső hivatkozás gomb alakban.
 *
 * Külön komponens, mert a `rel="noopener"` nem elfelejthető opció: egy
 * `target="_blank"` link enélkül hozzáfér a megnyitó lap `window.opener`
 * objektumához, és át tudja irányítani az eredeti oldalt.
 */
export function ButtonExternal({
  href,
  variant,
  tone,
  size,
  className,
  arrow = false,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<'a'>, 'className' | 'children'>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(button({ variant, tone, size }), className)}
      {...rest}
    >
      <Sheen />
      <span className="relative inline-flex items-center gap-2">
        {children}
        {arrow ? <Arrow /> : null}
      </span>
    </a>
  );
}
