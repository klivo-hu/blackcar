import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A kártya: kiemelt felület a szekció felületén.
 *
 * Két hangnem, mert két felülettípusra kell ülnie. Sötéten a `slate` a
 * kiemelés (a grafitnál egy fokkal világosabb), világoson a tiszta fehér.
 *
 * A `flush` **kapcsoló, nem `p-0` felülírás**. A `tailwind-merge` csak azonos
 * variánsú osztályt ejt ki: egy kívülről adott `p-0` leütné az alap `p-6`-ot,
 * a `sm:p-8`-at viszont nem, és a térköz 640 pixel fölött némán visszajönne.
 * Ahol hasonló felülírás kell, ott is a komponens adjon rá kapcsolót.
 */
export function Card({
  as: Tag = 'div',
  tone = 'dark',
  flush = false,
  interactive = false,
  className,
  children,
}: {
  as?: 'div' | 'article' | 'li' | 'section';
  tone?: 'dark' | 'light';
  flush?: boolean;
  /** Rálebegésre megemelkedik. Csak olyan kártyán, ami tényleg kattintható. */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        'relative rounded-card border',
        !flush && 'p-6 sm:p-8',
        tone === 'dark' ? 'border-steel bg-slate text-on-dark' : 'border-line bg-paper text-ink',
        interactive && [
          'transition-[transform,border-color,box-shadow] duration-ui ease-standard',
          'hover:-translate-y-1 hover:shadow-float',
          tone === 'dark' ? 'hover:border-brass/50' : 'hover:border-brass-deep/50',
        ],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
