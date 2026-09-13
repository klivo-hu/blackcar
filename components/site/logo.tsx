import { cn } from '@/lib/cn';
import { site } from '@/lib/content/site';

/**
 * A márkajel: az autó sziluettje.
 *
 * Az útvonalak a vállalkozás **meglévő emblémájából** származnak
 * (`legacy/images/logo2.svg`), nem újrarajzolt közelítések — a jel ugyanaz
 * marad, mint a közösségi oldalakon és a matricán, tehát a látogató
 * felismeri. A csoport eltolása bele van építve a koordinátákba, és a nézetdoboz
 * a rajz tényleges határaira van vágva (111,55 × 22), hogy a jel körül ne
 * maradjon üres sáv, ami elrontaná az igazítást.
 *
 * A kitöltés `currentColor`: a jel a szövegszínt veszi fel, tehát ugyanaz a
 * komponens szolgálja a sötét és a világos felületet is.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 111.55 22"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g transform="translate(-53.12576,-112.02915)">
        <path d="m 53.13187,134.01815 c 0,0 -0.291105,-4.30469 3.145967,-5.87247 1.992445,-0.90883 -0.838925,2.44687 -0.838925,2.44687 0,0 7.4105,-4.71895 9.612675,-4.75391 2.200788,-0.0349 -3.041099,-0.17477 -3.041099,-0.17477 0,0 7.890642,-3.14703 15.729828,-2.16723 0.838925,0.10486 -24.608446,10.52151 -24.608446,10.52151 z" />
        <path d="m 124.1354,112.04905 c -1.2338,-0.0703 -23.35801,-0.33613 -32.918746,7.21706 -3.311677,2.61629 -5.587982,3.4608 -7.036779,3.65145 9.651236,1.2367 55.397175,6.43499 76.893495,-3.19102 1.05384,-0.47191 -33.232,-7.75999 -36.93797,-7.67749 z m -4.11895,1.68613 c 13.35394,-0.0717 23.6492,4.13359 23.6492,4.13359 0,0 0.60351,0.30544 0.41961,0.62942 -5.34659,9.41906 -49.846051,1.81746 -49.846051,1.81746 8.651391,-4.95488 17.764861,-6.53746 25.777241,-6.58047 z m -37.906216,8.90953 c 0,0 0.113483,0.0629 0.28577,0.13126 0.183252,0.0127 1.126754,0.0792 1.738395,0.14521 0.01573,-0.002 0.02851,-0.002 0.04444,-0.004 -1.162202,-0.14893 -2.068607,-0.27285 -2.068607,-0.27285 z" />
        <path d="m 145.28678,124.4256 c 0,0 16.85703,-3.16378 17.64797,-4.10303 0.79095,-0.93925 -0.69207,4.00416 -0.69207,4.00416 0,0 -0.88982,-2.12567 -3.65813,-0.93925 -2.76831,1.18642 5.19058,1.58189 5.93209,7.51398 0.74152,5.93209 0.0989,-8.50266 -19.22986,-6.47586 z" />
        <path d="m 55.389139,127.10652 c 0,0 13.495504,-9.39248 32.280457,-7.41512 18.784954,1.97737 -5.042275,3.11435 -5.042275,3.11435 0,0 -17.845707,-1.28529 -27.238182,4.30077 z" />
        <path d="m 81.777641,122.76259 3.198397,0.1573 1.538028,-0.43695 -0.978744,-1.04865 z" />
        <path d="m 83.611579,122.84989 0.871275,0.0989 0.549955,-0.24717 z" />
      </g>
    </svg>
  );
}

/**
 * A teljes embléma: jel és név egymás alatt.
 *
 * A név **szövegként** van szedve, nem képként. Így kereshető, felolvasható,
 * és a betűtípus-skálával együtt mozog — egy beégetett feliratú SVG mindebből
 * semmit nem tudna. A tördelést a hívó `className` szabályozza.
 */
export function Wordmark({
  className,
  markClassName,
  textClassName,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn('inline-flex flex-col items-start gap-1.5', className)}>
      <LogoMark className={cn('h-auto w-28', markClassName)} />
      <span
        className={cn(
          'font-display text-h6 font-bold uppercase leading-none tracking-[0.06em]',
          textClassName,
        )}
      >
        {site.shortName}
      </span>
    </span>
  );
}
