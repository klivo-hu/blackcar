'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminField, adminInputClass } from '@/components/admin/ui';

/**
 * Az admin belépő űrlap.
 *
 * **Az átirányítási cél ellenőrzött.** A `tovabb` paraméter a címsorból jön,
 * tehát támadó is elhelyezheti benne, amit akar. Csak az fogadható el, ami
 * egyetlen `/`-rel kezdődik és nem `//`-rel: az utóbbi a böngészőnek
 * protokoll-relatív **külső** URL (`//pelda.hu`), és ezzel a belépő oldal
 * nyílt átirányítássá válna — egy hiteles domainről indított adathalász
 * lánccá.
 *
 * Sikeres belépés után `router.refresh()` is fut, nem csak navigáció: a
 * munkamenet süti megléte szerveroldali adat, és enélkül a gyorsítótárazott
 * elrendezés a belépés előtti állapotot mutatná.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function safeTarget(): string {
    const raw = params.get('tovabb');
    if (!raw) return '/admin';
    // Csak saját útvonal: egy `/`, de nem kettő.
    if (!raw.startsWith('/') || raw.startsWith('//')) return '/admin';
    return raw;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: data.get('username'),
          password: data.get('password'),
        }),
      });

      if (response.ok) {
        router.replace(safeTarget());
        router.refresh();
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? 'A belépés nem sikerült.');
    } catch {
      setError('Nem sikerült kapcsolódni a kiszolgálóhoz.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="w-full max-w-md rounded-panel border border-steel bg-slate p-8"
    >
      <h1 className="text-h3 text-on-dark">Belépés</h1>
      <p className="mt-2 text-body-sm text-on-dark-muted">
        Az oldal szerkesztői felülete. A belépési adatokat a kiszolgáló környezeti változói
        tárolják.
      </p>

      <div className="mt-8 space-y-5">
        <AdminField id="admin-user" label="Felhasználónév">
          <input
            id="admin-user"
            name="username"
            type="text"
            required
            autoComplete="username"
            autoFocus
            className={adminInputClass()}
          />
        </AdminField>

        <AdminField id="admin-pass" label="Jelszó">
          <input
            id="admin-pass"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={adminInputClass()}
          />
        </AdminField>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-card border border-danger/50 bg-danger/10 px-4 py-3 text-body-sm text-on-dark"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        tone="dark"
        size="lg"
        disabled={sending}
        className="mt-7 w-full"
      >
        {sending ? 'Belépés…' : 'Belépés'}
      </Button>
    </form>
  );
}
