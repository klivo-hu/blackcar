import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A vízszintes mérték. Egyetlen helyen dől el, milyen széles a tartalom és
 * mekkora a lap széle — így nem tud oldalanként pár pixelt csúszni.
 *
 * - `default` (1280px) — a szekciók zöme.
 * - `wide` (1440px) — nagy képes rácsok, ahol a levegő maga a kompozíció.
 * - `prose` (704px, ~65 karakter) — összefüggő olvasnivaló.
 */
export function Container({
  as: Tag = 'div',
  width = 'default',
  className,
  children,
}: {
  as?: 'div' | 'section' | 'header' | 'footer' | 'article' | 'nav' | 'ul';
  width?: 'default' | 'wide' | 'prose';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-5 sm:px-8',
        width === 'default' && 'max-w-content',
        width === 'wide' && 'max-w-wide',
        width === 'prose' && 'max-w-prose',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
