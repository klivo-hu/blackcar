#!/usr/bin/env node
/**
 * Admin jelszó hash generálása az `ADMIN_PASSWORD_HASH` mezőbe.
 *
 *   npm run gen:password -- "a jelszavad"
 *
 * A kimenet formátuma: pbkdf2.<iteráció>.<base64 salt>.<base64 kulcs>
 * Az elválasztó pont, nem dollárjel — a dotenv-expand a "$210000"-t változó
 * hivatkozásként értelmezné és kifejtené, némán elrontva a hash-t.
 *
 * Ugyanaz a származtatás fut itt, mint a `lib/auth/password.ts`-ben; ha az egyik
 * paraméter változik, a másikat is igazítani kell.
 */

import { pbkdf2Sync, randomBytes } from 'node:crypto';

const ITERATIONS = 210_000;
const KEY_LENGTH_BYTES = 32;
const SALT_LENGTH_BYTES = 16;

const password = process.argv[2];

if (!password) {
  console.error('\nHasználat: npm run gen:password -- "a jelszavad"\n');
  process.exit(1);
}

if (password.length < 12) {
  console.error('\nA jelszó legyen legalább 12 karakter.\n');
  process.exit(1);
}

const salt = randomBytes(SALT_LENGTH_BYTES);
const derived = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH_BYTES, 'sha256');

const hash = ['pbkdf2', ITERATIONS, salt.toString('base64'), derived.toString('base64')].join('.');

console.log('\nMásold a .env fájlba:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
console.log('A jelszót magát sehol nem tároljuk — jegyezd meg, vagy tedd jelszókezelőbe.\n');
