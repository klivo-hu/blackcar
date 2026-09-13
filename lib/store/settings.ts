import { revalidateTag, unstable_cache } from 'next/cache';
import { DEFAULT_SETTINGS, type SiteSettings } from '@/lib/content/settings';
import { createDocument } from './json-store';

/**
 * A beállítások tárolása.
 *
 * Egyetlen JSON **dokumentum**, nem gyűjtemény: egy beállításnak nincs
 * sorrendje és nincs belőle több. A `createDocument` az alapértelmezésekre
 * olvas rá, tehát egy új kapcsoló azelőtt is működik, hogy a fájl újraíródna —
 * nincs migráció, és friss telepítésen sem lesz `undefined`.
 *
 * A gyorsítótár kulcsa tartalmazza a fájl ujjlenyomatát. Enélkül egy új build
 * a `.next/cache`-ben maradt **régi** beállítást sütné a statikus oldalakba: a
 * build sikeres lenne, az oldal hiánytalan, csak épp elavult — például
 * kikapcsolt foglalással azok után, hogy a tulajdonos bekapcsolta.
 */
const settings = createDocument<SiteSettings>('settings.json', DEFAULT_SETTINGS);

export const SETTINGS_TAG = 'settings';

const readSettings = unstable_cache(
  async () => settings.read(),
  ['bc-settings', settings.fingerprint()],
  {
    tags: [SETTINGS_TAG],
  },
);

export async function getSiteSettings(): Promise<SiteSettings> {
  return readSettings();
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const next = await settings.update(patch);
  revalidateTag(SETTINGS_TAG);
  return next;
}
