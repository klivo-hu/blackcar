import { randomUUID } from 'node:crypto';
import { statSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * A tiny, dependency-free persistence layer backed by JSON files.
 *
 * Why not a database: the site stores a few hundred rows at most (posts, works,
 * leads, one settings object). A file store keeps deployment to a single
 * container with a mounted volume, and keeps the whole dataset greppable and
 * trivially backed up. Swapping in a real database later means reimplementing
 * this one module — nothing above it knows how storage works.
 *
 * Two properties matter and are both guaranteed here:
 *
 * 1. **Writes are atomic.** Content goes to a uniquely named temp file in the
 *    same directory, which is then `rename`d over the target. `rename` within a
 *    filesystem is atomic, so a crash mid-write can never leave a truncated
 *    file — a reader sees either the old or the new content.
 * 2. **Writes are serialised per file.** Node is single-threaded but `await`
 *    yields, so two concurrent request handlers could interleave a
 *    read-modify-write and lose an update. Every mutation runs inside a
 *    per-path promise chain, which removes that window.
 */

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), 'data');

/** One promise chain per file path — the serialisation primitive. */
const locks = new Map<string, Promise<unknown>>();

function resolvePath(fileName: string): string {
  return join(DATA_DIR, fileName);
}

/**
 * Runs `task` after every previously queued task for the same file has settled.
 * The stored promise is deliberately failure-tolerant so one rejected write
 * cannot poison the queue for later callers.
 */
function withLock<T>(fileName: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(fileName) ?? Promise.resolve();
  const next = previous.then(task, task);
  locks.set(
    fileName,
    next.catch(() => undefined),
  );
  return next;
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(resolvePath(fileName), 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    // A missing file is the expected state on a fresh install.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    // Corrupt JSON must not take the whole site down; fall back and warn.
    if (error instanceof SyntaxError) {
      console.error(`[store] ${fileName} contains invalid JSON — falling back to empty state.`);
      return fallback;
    }
    throw error;
  }
}

async function writeJson(fileName: string, value: unknown): Promise<void> {
  const target = resolvePath(fileName);
  await mkdir(dirname(target), { recursive: true });

  const temp = `${target}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temp, target);
}

/**
 * A typed collection of records stored in one JSON file.
 *
 * `read` is lock-free: it only ever observes a complete file thanks to the
 * atomic rename above. `mutate` takes the lock so read-modify-write is safe.
 */
export function createCollection<T>(fileName: string) {
  return {
    async read(): Promise<T[]> {
      return readJson<T[]>(fileName, []);
    },

    /** A fájl ujjlenyomata — lásd `fingerprint`. */
    fingerprint(): string {
      return fingerprint(fileName);
    },

    /**
     * Applies `update` to the current contents and persists the result.
     * Returns whatever `update` returns, so callers can hand back the created
     * or modified record without a second read.
     */
    async mutate<R>(
      update: (items: T[]) => { items: T[]; result: R } | Promise<{ items: T[]; result: R }>,
    ): Promise<R> {
      return withLock(fileName, async () => {
        const current = await readJson<T[]>(fileName, []);
        const { items, result } = await update(current);
        await writeJson(fileName, items);
        return result;
      });
    },
  };
}

/**
 * A fájl ujjlenyomata: méret és módosítási idő.
 *
 * **Miért kell.** A tárolót `unstable_cache` gyorsítja, az pedig a `.next/cache`
 * mappába ír, ami két build között megmarad. A JSON fájl viszont a Next
 * tudta nélkül változik, tehát egy új build a *régi* tartalmat sütné bele a
 * statikus oldalakba — és ez némán történik: a build sikeres, az oldal
 * hiánytalan, csak épp elavult. Pontosan ez történt a blogborítókkal és a
 * csapat szekcióval.
 *
 * Az ujjlenyomat a gyorsítótár-kulcs része, tehát ha a fájl változott, a kulcs
 * is más — a régi bejegyzés egyszerűen nem talál. Futásidőben a mutációk
 * `revalidateTag`-je gondoskodik a frissítésről, ehhez nem kell újraolvasni.
 *
 * Szinkron `statSync`: modulszinten, kérésen kívül fut, egyetlen alkalommal.
 */
function fingerprint(fileName: string): string {
  try {
    const stat = statSync(resolvePath(fileName));
    return `${stat.size}-${Math.round(stat.mtimeMs)}`;
  } catch {
    // Nincs még fájl — ez friss telepítésen a várt állapot.
    return 'empty';
  }
}

/** A single JSON object rather than a collection — used for site settings. */
export function createDocument<T extends object>(fileName: string, defaults: T) {
  return {
    async read(): Promise<T> {
      const stored = await readJson<Partial<T>>(fileName, {});
      // Merge over defaults so a new setting works before the file is rewritten.
      return { ...defaults, ...stored };
    },

    /** A fájl ujjlenyomata — ugyanazért kell, mint a gyűjteményeknél. */
    fingerprint(): string {
      return fingerprint(fileName);
    },

    async update(patch: Partial<T>): Promise<T> {
      return withLock(fileName, async () => {
        const stored = await readJson<Partial<T>>(fileName, {});
        const next = { ...defaults, ...stored, ...patch };
        await writeJson(fileName, next);
        return next;
      });
    },
  };
}

/** Sortable, URL-safe id. Time prefix keeps natural ordering in the raw file. */
export function createId(): string {
  return `${Date.now().toString(36)}${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}
