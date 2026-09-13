import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { formatRange, formatThousands, vehicleSizes, type Service } from '@/lib/content/pricing';

/**
 * Egy szolgáltatás teljes leírása, árral.
 *
 * **A méret szerinti ár csak ott jelenik meg, ahol a vállalkozás kimondta.**
 * A teljes takarításra sáv van megadva, bontás nincs — ott tehát nincs
 * kitalált táblázat sem: a szekció megmondja, mi határozza meg az árat, és
 * ennyi. Egy becsült, de kimondottnak látszó ár rosszabb, mint egy őszinte
 * sáv: az elsőt az ügyfél elvárásként hozza magával.
 *
 * A felsorolás és a táblázat **egymás mellett** fut, nem egymás alatt: aki
 * árat keres, ne kelljen átgörgetnie a tartalomjegyzéket, és fordítva.
 */
export function ServiceDetail({ service, index }: { service: Service; index: number }) {
  // Kiemelve, mert a `service.bySize` szűkítése elveszne a `map` visszahívásán
  // belül: a TypeScript nem tudja, hogy a tulajdonság közben nem változott meg.
  const bySize = service.bySize;

  return (
    <Reveal
      as="article"
      id={service.slug}
      // A rögzített fejléc alá horgonyzott szekció különben a fejléc mögé
      // csúszna. A `scroll-margin` a helyes eszköz erre, nem egy üres elem.
      className="scroll-mt-28 border-t border-line pt-12 first:border-t-0 first:pt-0"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div>
          <div className="flex items-baseline gap-4">
            <span aria-hidden="true" className="font-display text-h4 text-brass-deep">
              {`0${index + 1}`}
            </span>
            <h2 className="text-h2 text-ink">{service.name}</h2>
          </div>

          <p className="mt-5 max-w-prose text-body-lg text-muted">{service.summary}</p>

          <h3 className="mt-10 text-h6 uppercase tracking-[0.12em] text-brass-deep">
            A csomag tartalma
          </h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {service.includes.map((item) => (
              <li key={item} className="flex gap-3 text-body text-ink-soft">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 10 16"
                  className="mt-1.5 h-3.5 w-2.5 shrink-0 text-brass-deep"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                >
                  <path d="M8 2 2 14" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Card tone="light" className="h-fit lg:sticky lg:top-28">
          <dl>
            <dt className="text-body-sm text-muted">Ár</dt>
            <dd className="font-display text-h3 text-ink">{formatRange(service.range)}</dd>
            <dt className="mt-5 text-body-sm text-muted">Várható időtartam</dt>
            <dd className="font-display text-h5 text-ink">{service.duration}</dd>
          </dl>

          {bySize ? (
            <>
              <h3 className="mt-7 border-t border-line pt-6 text-h6 uppercase tracking-[0.12em] text-brass-deep">
                Méret szerint
              </h3>
              {/* Leíráslista, nem `<table>`: ez név–érték párok sorozata, nem
                  két dimenzió mentén olvasandó adat. A táblázat a
                  képernyőolvasónak sor- és oszlopnavigációt ígérne, amiből itt
                  csak az egyik létezne. */}
              <dl className="mt-4 space-y-3">
                {vehicleSizes.map((size) => (
                  <div
                    key={size.id}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-body-sm text-ink-soft">{size.label}</dt>
                    <dd className="shrink-0 font-display text-h6 text-ink">
                      {formatThousands(bySize[size.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="mt-7 border-t border-line pt-6 text-body-sm text-muted">
              A teljes takarítás ára a gépjármű méretéből és tényleges állapotából adódik. A pontos
              összeget az autó átvételekor, a munka megkezdése előtt mondjuk ki — utólag nem
              változik.
            </p>
          )}
        </Card>
      </div>
    </Reveal>
  );
}
