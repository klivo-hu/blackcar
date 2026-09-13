import Image, { type StaticImageData } from 'next/image';
import { Container } from '@/components/ui/container';

/**
 * Az aloldalak fejléce.
 *
 * Ugyanaz a sötét színpad, mint a nyitóképernyőn, csak alacsonyabb: a látogató
 * felismeri, hogy ugyanazon az oldalon van, de a cím azonnal a tartalomhoz
 * vezet, nem egy második nyitóképernyőt kap.
 *
 * A háttérkép **hangulati**, nem tartalmi — ezért `alt=""` és `aria-hidden`:
 * a képernyőolvasónak nincs mit mondania róla, a címsor viszont mindent elmond.
 *
 * A sötétítő réteg itt nem esztétikai döntés: a fehér cím alatt a kép
 * világosodhatna annyira, hogy a kontraszt 4,5:1 alá essen, és ez képenként
 * más helyen történne meg.
 */
export function PageHeader({
  id,
  title,
  lead,
  image,
  children,
}: {
  id: string;
  title: string;
  lead: string;
  image: StaticImageData;
  /** Cselekvés a felvezető alatt — például az árlistára ugró gomb. */
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      data-surface="obsidian"
      data-sheen
      className="relative isolate overflow-hidden bg-obsidian pb-20 pt-36 md:pb-24 md:pt-44"
    >
      <Image
        src={image}
        alt=""
        aria-hidden="true"
        priority
        quality={82}
        sizes="100vw"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen"
        style={{
          background:
            'radial-gradient(28rem 28rem at var(--sheen-x, 70%) var(--sheen-y, 30%), rgb(var(--brass) / 0.14), transparent 65%)',
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-obsidian via-obsidian/85 to-obsidian/45"
      />

      <Container width="wide">
        <div className="max-w-3xl">
          <h1 id={id} className="text-h1 text-on-dark">
            {title}
          </h1>
          <p className="mt-6 max-w-prose text-body-lg text-on-dark-muted">{lead}</p>
          {children ? <div className="mt-9 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
