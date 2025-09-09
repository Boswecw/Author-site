```markdown
# Author-site

A modern author portfolio and book showcase built with **SvelteKit 2**, **Svelte 5 (runes)**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas**, and **Firebase Storage**.

It highlights:
- 📚 **Books** — featured & upcoming titles (from MongoDB)
- ✍️ **Blog** — posts in MongoDB with Markdown → HTML
- 👤 **About** — bio & background
- 📩 **Contact** — email form

---

## 🚀 Tech stack

- **Framework**: SvelteKit 2 + Svelte 5 (runes)
- **Lang**: TypeScript
- **Styling**: Tailwind CSS
- **DB**: MongoDB Atlas (official `mongodb` driver)
- **Assets**: Firebase Storage (covers, icons, images)
- **Build/Dev**: Vite
- **Env loader**: `dotenv-cli`

---

## 📂 Project structure

```

author-site/
├─ src/
│  ├─ lib/
│  │  ├─ server/         # server utilities (db.ts, books.ts, etc.)
│  │  ├─ utils/          # firebase image builders, etc.
│  │  └─ data/           # placeholder data (e.g., placeholderBooks)
│  ├─ routes/
│  │  ├─ +layout.svelte  # global layout
│  │  ├─ +page.server.ts # homepage loader
│  │  ├─ books/
│  │  └─ blog/
│  └─ app.css
├─ static/               # favicon and static assets
├─ package.json
├─ svelte.config.js
└─ tsconfig.json

````

---

## ⚙️ Requirements

- Node.js **v20+**
- npm **v9+**

---

## 🧰 Setup

Install dependencies:

```bash
npm install
````

Create **`.env.local`** in the project root (quotes matter for values with spaces or `< >`):

```dotenv
# MongoDB
MONGODB_URI="mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority&appName=AuthorSite"
MONGODB_DB="author_site"

# Email
EMAIL_FROM="Charles Boswell <charlesboswell@boswellwebdevelopment.com>"

# Firebase (public runtime config)
PUBLIC_FIREBASE_API_KEY="..."
PUBLIC_FIREBASE_AUTH_DOMAIN="..."
PUBLIC_FIREBASE_PROJECT_ID="..."
PUBLIC_FIREBASE_STORAGE_BUCKET="endless-fire-467204-n2.firebasestorage.app"
```

Run the dev server (port **3000**):

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

Build & preview:

```bash
npm run build
npm run preview
```

> The npm scripts use `dotenv-cli` to load `.env.local` for dev/build/preview.

---

## 🔌 Environment loading

We read envs with **`process.env`** on the server. The dev/build scripts already wrap commands with:

```
dotenv -e .env.local -- <command>
```

To sanity-check the file:

```bash
npx dotenv -e .env.local -- node -e "console.log(!!process.env.MONGODB_URI, process.env.MONGODB_DB)"
# expected: true author_site
```

---

## 🖼 Image handling (Firebase)

Centralized helpers in `src/lib/utils/firebase`:

```ts
// build a Firebase public URL for a cover under books/
export function buildBookCoverUrl(nameOrPath: string): string;

// build a Firebase public URL for any path (optionally prefix with a folder)
export function buildImageUrl(nameOrPath: string, folder?: string): string;
```

Usage examples:

```ts
// books (always under "books/")
const coverUrl = buildBookCoverUrl(book.cover);

// blog hero images:
// - full URLs pass through
// - "posts/hero.webp" honored as-is
// - bare file names default to "books/"
function resolveHero(ref?: string | null) {
  if (!ref) return null;
  const s = ref.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;         // already absolute
  if (s.includes('/')) return buildImageUrl(s);   // explicit folder
  return buildBookCoverUrl(/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(s) ? s : `${s}.png`);
}
```

---

## 🗄 MongoDB schemas

These interfaces reflect the data used by the loaders.

### `BookDoc`

```ts
export type BookDoc = {
  id: string; // short unique id, e.g. "faith-in-a-firestorm"
  title: string;
  description?: string | null;
  cover?: string | null; // filename or "books/cover.png" or full URL
  genre?: 'faith' | 'epic' | 'sci-fi' | string | null;
  status?: 'draft' | 'upcoming' | 'published' | 'coming-soon' | string | null;
  publishDate?: string | Date | null;
  isbn?: string | null;
  format?: string | null; // e.g. "EPUB"
  pages?: number | null;
  buyLinks?: Record<string, string | null>;
  featured?: boolean;
};
```

**Recommended indexes**

* `{ id: 1 }` unique
* `{ featured: 1 }`
* `{ status: 1, publishDate: -1 }`

### `PostDoc`

```ts
export interface PostDoc {
  _id?: any;
  slug: string;             // unique slug (/blog/<slug>)
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  heroImage?: string | null; // filename | "folder/file.ext" | full URL
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  genre?: string | null;
  status: 'published' | 'draft';
}
```

**Recommended indexes**

* `{ slug: 1 }` unique
* `{ status: 1, publishDate: -1, publishedAt: -1 }`

---

## 🔌 Database helper

`src/lib/server/db.ts` uses `process.env` and provides a **mock DB fallback** in dev if envs are missing, including a chainable cursor (`find().sort().skip().limit().toArray()`), so pages won’t crash.

```ts
import { getDb } from '$lib/server/db';
const db = await getDb();
const books = await db.collection<BookDoc>('books').find({}).toArray();
```

---

## 🧩 SvelteKit notes

* Use the `$page` store for routing info in components (don’t pass `URL` instances from server `load`—they aren’t serializable):

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  $: pathname = $page.url?.pathname ?? '/';
</script>
```

---

## 🧪 Scripts (package.json)

```json
{
  "scripts": {
    "dev": "dotenv -e .env.local -- vite dev --port 3000",
    "build": "svelte-kit sync && dotenv -e .env.local -- vite build",
    "preview": "dotenv -e .env.local -- vite preview --port 3000",
    "start": "dotenv -e .env.local -- node build",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "format": "prettier --write .",
    "test": "vitest"
  }
}
```

> We use Vite for local `dev` to avoid CLI mismatches. `svelte-kit sync` is run during `build` to keep types in sync.

---

## 📦 Deployment

* **Netlify**: use `@sveltejs/adapter-netlify`; set `MONGODB_URI`/`MONGODB_DB` in dashboard env.
* **Vercel**: use `@sveltejs/adapter-vercel`; set env vars in project settings.
* **Node**: use `@sveltejs/adapter-node` and run `node build`.

---

## 🛠 Troubleshooting

* **Hydration error: reading `pathname`**
  Don’t return a `URL` object from server `load`. Use `$page.url` on the client or pass plain strings.

* **`.env.local` syntax error**
  Quote values with spaces/angle-brackets:

  ```
  EMAIL_FROM="Charles Boswell <charlesboswell@boswellwebdevelopment.com>"
  ```

* **TypeScript can’t find `$env/*`**
  Ensure `tsconfig.json` extends `./.svelte-kit/tsconfig.json` and run `npx svelte-kit sync`.

---

## 📜 License

MIT © 2025 Charles W. Boswell

```
```
