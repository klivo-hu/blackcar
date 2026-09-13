# syntax=docker/dockerfile:1
#
# Több lépcsős build a Next.js standalone szerverhez.
# A futó konténer a 3000-es porton figyel — ezt várja a tárhelyszolgáltatás.

# -----------------------------------------------------------------------------
# 1. Függőségek
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Csak a lockfile-ok, hogy ez a réteg addig cache-elt maradjon, amíg egy
# függőség tényleg nem változik — a teljes forrás bemásolása minden
# szerkesztésnél érvénytelenítené.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund


# -----------------------------------------------------------------------------
# 2. Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# A `NEXT_PUBLIC_*` értékek build időben égnek bele a kliens bundle-be, tehát a
# publikus URL-t itt kell tudni — nem a konténer indulásakor. Felülírás:
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.hu
ARG NEXT_PUBLIC_SITE_URL=https://blackcar60.hu
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build idejű helyőrző. A `lib/auth/jwt.ts` kulcs nélkül kivételt dob, és az
# admin belépő oldal előrenderelése eléri ezt a kódot. A valódi kulcs futásidőben
# érkezik a környezetből; ez az érték soha nem ír alá felhasználóhoz kerülő tokent.
ENV ADMIN_JWT_SECRET=build-time-placeholder-not-used-at-runtime-0000

RUN npm run build


# -----------------------------------------------------------------------------
# 3. Futásidő
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Az alkalmazás futásidőben ide ír; csatolj ide kötetet, különben minden
# foglalás és beállítás elvész a következő deploynál.
ENV DATA_DIR=/app/data

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# A `standalone` már tartalmaz egy minimális node_modules-t és a server.js-t.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# A kulcs- és jelszógeneráló bent marad: a szerkesztő jelszavát a konténerben
# is elő kell tudni állítani.
#   docker compose exec hosting_blackcar60_web node scripts/gen-password.mjs "uj jelszo"
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Az adatkönyvtár üresen indul, és **ez a helyes kiinduló állapot**: a
# `createDocument` az alapértelmezésekre olvas rá (`lib/content/settings.ts`),
# tehát fájl nélkül a foglalás kikapcsolt, az elérhetőség pedig a beépített
# érték. Nincs mit vetni, és nincs az a kockázat sem, hogy egy fejlesztői
# adatfájl beégjen az image-be — a `.dockerignore` a `data` mappát ki is zárja.
#
# A mappa itt jön létre, hogy egy csatolt kötet nélküli indítás is működjön.
RUN mkdir -p /app/data \
 && chown -R nextjs:nodejs /app/data

# A szerver soha nem fut rootként: egy távoli kódfuttatási hiba bármelyik
# függőségben így elszigetelt hiba marad, nem konténer-átvétel.
USER nextjs

EXPOSE 3000

# A healthcheck a főoldalt kéri le; egy hibás renderelés jelölje a konténert
# egészségtelennek, ahelyett hogy némán hibát szolgálna ki.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
