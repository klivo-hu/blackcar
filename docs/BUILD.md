# Build és futtatás

## Miért Turbopack

A `build` és a `dev` script is `--turbopack`-kel fut. Ez **nem** ízlés kérdése,
és nem is a sebességé:

A projekt könyvtára `F:\Klivo\! PROJEKTEK\BlackCar`. A felkiáltójel a webpack
loader-szintaxisában foglalt karakter, ezért a webpack a saját konfigurációját
érvénytelennek találja, és a build el sem indul:

```
configuration.context: The provided value "F:\Klivo\! PROJEKTEK\BlackCar"
contains exclamation mark (!) which is not allowed because it's reserved
for loader syntax.
```

A Turbopacknak nincs ilyen korlátja. Mivel a Docker image-ben a forrás a
`/app` alatt van — ahol a felkiáltójel nem szerepel —, ott a webpack is
lefutna; de két különböző bundler két különböző kimenetet jelent, és az a fajta
eltérés, ami csak élesben derül ki. Ezért mindkét helyen Turbopack fut.

Ha a projekt valaha felkiáltójel nélküli útvonalra kerül, a `--turbopack`
elhagyható — de nem kell elhagyni.

## Parancsok

```bash
npm run dev        # fejlesztői szerver a 3000-es porton
npm run verify     # típus + lint + formázás + teszt + build — ez a kapu
npm run build      # éles build
npm start          # az éles build futtatása
```

Segédparancsok:

```bash
npm run images         # a referenciafotók átméretezése (legacy/images → assets)
npm run contrast       # a paletta kontrasztpárjainak mérése
npm run gen:secret     # ADMIN_JWT_SECRET előállítása
npm run gen:password -- "a jelszó"   # ADMIN_PASSWORD_HASH előállítása
```

## Buktatók

- **Ne buildelj futó szerver mellé.** A `next build` felülírja a `.next`-et a
  futó `next start` alól: a kiszolgált HTML régi chunkokra hivatkozik, azok
  400-at adnak, és a lap stílus nélkül jelenik meg. Állítsd le a szervert,
  buildelj, indítsd újra.
- **Az `ADMIN_JWT_SECRET`-nek build időben is léteznie kell.** A
  `lib/auth/jwt.ts` kulcs nélkül kivételt dob, és a belépő oldal
  előrenderelése eléri ezt a kódot. A Dockerfile ezért állít be egy build idejű
  helyőrzőt; az soha nem ír alá felhasználóhoz kerülő tokent.
- **A `NEXT_PUBLIC_SITE_URL` build időben ég bele a kliens bundle-be**, nem
  a konténer indulásakor olvasódik. A Dockerfile build argumentumként kapja meg.
