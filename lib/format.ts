/**
 * Formázók. Kicsi, de egy helyen: ezek a függvények olyan szabályokat kódolnak,
 * amiket szétszórva mindenki kicsit másképp írna meg.
 */

/**
 * `tel:` hivatkozás egy olvasható telefonszámból.
 *
 * A megjelenített szám tagolt (`+36 70 907 0585`), a hivatkozásban viszont a
 * szóköz és a kötőjel egyes telefonos alkalmazásokat megzavar. A pluszjel
 * marad — az a nemzetközi előhívó, nem tagolás.
 */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

/** Dátum magyar, olvasható formában: `2026. március 4.` */
const dateFormatter = new Intl.DateTimeFormat('hu-HU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** Dátum és idő: `2026. március 4. 14:05` */
const dateTimeFormatter = new Intl.DateTimeFormat('hu-HU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateTimeFormatter.format(date);
}

/** A mai nap `YYYY-MM-DD` alakban, helyi idő szerint. */
export function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
