'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogoMark } from '@/components/site/logo';
import { Button } from '@/components/ui/button';

/**
 * Az admin keret: fejléc, kilépés, vissza az oldalra.
 *
 * Kliens komponens, mert a kilépés egy `fetch` és egy navigáció. A `refresh()`
 * a navigáció **után** fut: a süti törlése szerveroldali állapot, és enélkül a
 * belépő oldal a gyorsítótárból, bejelentkezettnek látszó kerettel jönne vissza.
 */
export function AdminShell({ user, children }: { user: string; children: React.ReactNode }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
    } finally {
      router.replace('/admin/belepes');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-obsidian" data-surface="obsidian">
      <header className="border-b border-steel">
        <div className="mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <LogoMark className="h-auto w-24 text-on-dark" />
            <span className="border-l border-steel pl-4 font-display text-h6 uppercase tracking-[0.14em] text-brass">
              Szerkesztés
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-body-sm text-on-dark-muted sm:inline">{user}</span>
            <Link
              href="/"
              className="text-body-sm text-on-dark-muted underline underline-offset-4 transition-colors duration-ui ease-standard hover:text-on-dark"
            >
              Oldal megtekintése
            </Link>
            <Button variant="ghost" tone="dark" onClick={() => void logout()} disabled={leaving}>
              {leaving ? 'Kilépés…' : 'Kilépés'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}
