import type { Metadata, Viewport } from 'next';
import { fontDisplay, fontSans } from '@/app/fonts';
import { site } from '@/lib/content/site';
import { absoluteUrl } from '@/lib/site-url';
import { MotionBoot } from '@/components/motion/motion-boot';
import './globals.css';

/**
 * A gyökér elrendezés.
 *
 * A `metadataBase` itt dől el egyszer: enélkül a Next.js relatív útvonalakat
 * írna az Open Graph és a canonical mezőkbe, ami a legtöbb megosztón
 * egyszerűen nem működik. A címsablon minden aloldal címéhez hozzáfűzi a
 * márkanevet; a főoldal viszont abszolút címet ad meg (lásd `buildMetadata`),
 * hogy ne duplázódjon.
 */
export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl('/')),
  title: {
    default: `${site.name} — autókozmetika ${site.city}ban`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: absoluteUrl('/') }],
  creator: site.name,
  publisher: site.name,
  formatDetection: { telephone: true, email: true, address: false },
  alternates: { canonical: absoluteUrl('/') },
};

export const viewport: Viewport = {
  // A mobil böngésző fejlécsávja. Az oldal alapfelülete obszidián, tehát a
  // sáv is az — különben a lap teteje világos csíkkal indulna.
  themeColor: '#0A0A0B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // A `suppressHydrationWarning` a `<html>`-en szándékos és pontosan ide való:
    // a `MotionBoot` a festés előtt kirak rá két adat-attribútumot, tehát a
    // kiszolgált és a hidratáláskor talált markup **szükségszerűen** eltér.
    // Csak ezt az egy elemet némítja el, a fa többi részét nem.
    <html
      lang={site.lang}
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable}`}
    >
      <head>
        <MotionBoot />
      </head>
      <body>{children}</body>
    </html>
  );
}
