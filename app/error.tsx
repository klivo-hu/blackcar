'use client';

import { useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/site/logo';

/**
 * A hibaoldal.
 *
 * **A hiba részletei nem kerülnek a képernyőre.** Egy verem-nyomkövetés a
 * látogatónak semmit nem mond, egy támadónak viszont igen: útvonalakat,
 * könyvtárneveket és a keretrendszer verzióját. A napló a szerveré; a
 * látogató azt kapja, amit tehet.
 *
 * A `digest` kivétel: az a Next.js által generált, tartalom nélküli azonosító,
 * amivel a szerver naplójában meg lehet találni ugyanezt a hibát. Ezért
 * megjelenik — ez az, amit egy telefonhívásnál be lehet mondani.
 *
 * Kliens komponens, mert ez a React hibahatárának a szerződése.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A szerveroldali naplóba a Next.js már beírta; ez a böngészőkonzolé,
    // hogy egy helyszíni hibakeresésnél legyen mibe kapaszkodni.
    console.error('[hiba]', error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center bg-obsidian py-24" data-surface="obsidian">
      <Container width="prose">
        <LogoMark className="h-auto w-36 text-on-dark" />

        <h1 className="mt-12 text-h1 text-on-dark">Valami félrement</h1>
        <p className="mt-5 text-body-lg text-on-dark-muted">
          Az oldal betöltése közben hiba történt. Próbálja meg újratölteni — ha továbbra sem
          működik, hívjon minket, és intézzük telefonon.
        </p>

        {error.digest ? (
          <p className="mt-6 text-body-sm text-on-dark-muted">
            Hibaazonosító: <code className="text-brass">{error.digest}</code>
          </p>
        ) : null}

        <Button onClick={reset} variant="primary" tone="dark" size="lg" className="mt-10">
          Újrapróbálom
        </Button>
      </Container>
    </main>
  );
}
