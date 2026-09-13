import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { LogoMark } from '@/components/site/logo';

/**
 * A 404-es oldal.
 *
 * **Nem zsákutca.** Aki ide téved, általában árat vagy elérhetőséget keresett;
 * a lap ezért a három valódi oldalra mutat, nem csak egy „vissza a
 * kezdőlapra" gombra.
 *
 * Saját kerete van, nem a `(site)` elrendezésé: a gyökérszintű `not-found` a
 * keret *fölött* renderelődik, tehát a fejléc és a lábléc nem érhető el
 * innen. Egy egyszerű, önhordó lap itt a helyes válasz.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-obsidian py-24" data-surface="obsidian">
      <Container width="prose">
        <LogoMark className="h-auto w-36 text-on-dark" />

        <p className="mt-12 font-display text-h5 uppercase tracking-[0.2em] text-brass">404</p>
        <h1 className="mt-4 text-h1 text-on-dark">Ez az oldal nincs meg</h1>
        <p className="mt-5 text-body-lg text-on-dark-muted">
          Lehet, hogy elírás történt a címben, vagy a lap azóta átkerült máshová. Innen tovább tud
          lépni:
        </p>

        <ul className="mt-9 space-y-3">
          {[
            { href: '/', label: 'Kezdőlap' },
            { href: '/szolgaltatasok', label: 'Szolgáltatások és árak' },
            { href: '/referenciak', label: 'Elvégzett munkák' },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-body-lg text-on-dark underline underline-offset-4 transition-colors duration-ui ease-standard hover:text-brass"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <ButtonLink href="/" variant="primary" tone="dark" size="lg" className="mt-10">
          Vissza a kezdőlapra
        </ButtonLink>
      </Container>
    </main>
  );
}
