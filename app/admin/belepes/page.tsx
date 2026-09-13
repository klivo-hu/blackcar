import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { LogoMark } from '@/components/site/logo';
import { getSession } from '@/lib/auth/session';

/**
 * A belépő oldal.
 *
 * Aki már be van jelentkezve, nem lát belépő űrlapot: azonnal a panelre kerül.
 * Enélkül egy elmentett könyvjelző örökké a belépésre vinne, és a felhasználó
 * azt hinné, lejárt a munkamenete.
 *
 * A `Suspense` a `useSearchParams` miatt kötelező: enélkül a Next.js az egész
 * oldalt kliensoldali rendereléshez kötné, és a build figyelmeztetéssel
 * jelezné.
 */
export default async function LoginPage() {
  if (await getSession()) redirect('/admin');

  return (
    <main
      data-surface="obsidian"
      className="flex min-h-screen flex-col items-center justify-center gap-10 bg-obsidian px-5 py-16"
    >
      <LogoMark className="h-auto w-40 text-on-dark" />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
