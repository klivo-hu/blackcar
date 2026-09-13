import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateBooking } from '@/lib/validation';
import { validateSettings } from '@/lib/content/settings';

/**
 * A bizalmi határ tesztjei.
 *
 * Ezek a függvények döntik el, mi kerülhet lemezre egy nyilvános végponton
 * keresztül. A böngészőben futó ellenőrzés kikapcsolható, a végpont pedig
 * űrlap nélkül is hívható — tehát ami itt átmegy, az a tényleges védelem.
 *
 * A dátumot rögzített időre állítjuk (`vi.setSystemTime`). Enélkül a „nem lehet
 * a múltban" teszt a futtatás napjától függene, és éjfél környékén véletlenül
 * elbukna — az a fajta hiba, amit senki nem tud reprodukálni.
 */

/** Egy érvényes foglalás, amiből a hibás eseteket származtatjuk. */
function validBooking(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Teszt Elemér',
    email: 'teszt@pelda.hu',
    phone: '+36 30 111 2222',
    vehicle: 'Opel Astra kombi',
    vehicleSize: 'kombi',
    service: 'teljes-takaritas',
    date: '2026-03-10',
    daypart: 'delelott',
    message: '',
    consent: true,
    ...overrides,
  };
}

describe('validateBooking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('elfogadja a hiánytalan foglalást, és levágja a fölösleges szóközöket', () => {
    const result = validateBooking(validBooking({ name: '  Teszt Elemér  ' }));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('Teszt Elemér');
      expect(result.value.service).toBe('teljes-takaritas');
    }
  });

  it('elutasítja a hozzájárulás nélküli foglalást', () => {
    const result = validateBooking(validBooking({ consent: false }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.consent).toBeDefined();
  });

  it('nem fogad el ismeretlen szolgáltatást', () => {
    // A kliens legördülője csak a három ismert értéket kínálja, de a végpont
    // közvetlenül is hívható. Az értékkészlet a tartalomból jön, nem egy
    // itt duplázott listából.
    const result = validateBooking(validBooking({ service: 'ingyen-takaritas' }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.service).toBeDefined();
  });

  it('nem fogad el ismeretlen méretkategóriát', () => {
    const result = validateBooking(validBooking({ vehicleSize: 'kamion' }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.vehicleSize).toBeDefined();
  });

  it('elutasítja a múltbeli napot', () => {
    const result = validateBooking(validBooking({ date: '2026-02-28' }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.date).toBeDefined();
  });

  it('elfogadja a mai napot', () => {
    // Határeset: a mai nap nem múlt. A karakterláncos összehasonlítás miatt ez
    // időzónától függetlenül igaz — `Date` objektumokkal nem lenne az.
    const result = validateBooking(validBooking({ date: '2026-03-01' }));

    expect(result.ok).toBe(true);
  });

  it('elutasítja a fél évnél távolabbi napot', () => {
    const result = validateBooking(validBooking({ date: '2027-01-01' }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.date).toBeDefined();
  });

  it('elutasítja a hibás e-mail címet és telefonszámot', () => {
    const result = validateBooking(validBooking({ email: 'nem-email', phone: 'hívj' }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.phone).toBeDefined();
    }
  });

  it('elutasítja a hosszkorláton túli üzenetet', () => {
    const result = validateBooking(validBooking({ message: 'a'.repeat(1501) }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.message).toBeDefined();
  });

  it('kiszűri a vezérlőkaraktereket a szövegmezőkből', () => {
    const withNul = `Teszt${String.fromCharCode(0)} Elemér`;
    const result = validateBooking(validBooking({ name: withNul }));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe('Teszt Elemér');
  });

  it('nem száll el nem objektum bemeneten', () => {
    for (const input of [null, undefined, 'szöveg', 42]) {
      const result = validateBooking(input);
      expect(result.ok).toBe(false);
    }
  });
});

describe('validateSettings', () => {
  it('elfogadja az érvényes beállítást', () => {
    const result = validateSettings({
      bookingEnabled: true,
      email: 'info@pelda.hu',
      phone: '+36 70 907 0585',
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.bookingEnabled).toBe(true);
  });

  it('a kapcsolónak logikai értéknek kell lennie', () => {
    // Egy `"true"` karakterlánc igazként viselkedne minden `if`-ben, tehát a
    // foglalás némán bekapcsolva maradna egy elrontott kérés után is.
    const result = validateSettings({
      bookingEnabled: 'true',
      email: 'info@pelda.hu',
      phone: '+36 70 907 0585',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.bookingEnabled).toBeDefined();
  });

  it('elutasítja a hibás elérhetőséget', () => {
    const result = validateSettings({ bookingEnabled: false, email: 'nem-email', phone: 'x' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.phone).toBeDefined();
    }
  });
});
