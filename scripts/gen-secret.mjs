#!/usr/bin/env node
/**
 * Munkamenet aláíró kulcs generálása az `ADMIN_JWT_SECRET` mezőbe.
 *
 *   npm run gen:secret
 *
 * 48 bájt véletlen, base64url kódolva — jóval a `lib/auth/jwt.ts` által
 * megkövetelt 32 karakteres alsó határ fölött.
 */

import { randomBytes } from 'node:crypto';

const secret = randomBytes(48).toString('base64url');

console.log('\nMásold a .env fájlba:\n');
console.log(`ADMIN_JWT_SECRET=${secret}\n`);
console.log('Az érték cseréje azonnal érvényteleníti az összes élő munkamenetet.\n');
