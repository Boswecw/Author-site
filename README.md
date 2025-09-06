# Author-site

This is my project README for the author site...
Perfect 👍 Adding **MongoDB schemas** to your `README.md` will make it crystal-clear how your `books` and `posts` collections are structured. Here’s the updated README with `BookDoc` and `PostDoc` TypeScript interfaces included:

---

````markdown
# Author Website

A modern author portfolio and book showcase site built with **SvelteKit 2**, **Svelte 5 (runes)**, **TypeScript**, **Tailwind CSS**, and **MongoDB Atlas**.  
The site highlights Charles W. Boswell’s work as a Navy veteran, firefighter, and fantasy/faith-based author.  

It provides sections for:
- 📚 **Books** – Current, featured, and upcoming releases (pulled from MongoDB).
- ✍️ **Blog** – Long-form posts and updates stored in MongoDB Atlas.
- 👤 **About** – Professional biography, military/firefighting background, and writing journey.
- 📩 **Contact** – Simple form for reader inquiries and professional outreach.

---

## 🚀 Tech Stack

- **Frontend Framework**: [SvelteKit 2](https://kit.svelte.dev/) with [Svelte 5](https://svelte.dev/blog/runes) runes
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)  
- **Driver**: Official [mongodb](https://www.npmjs.com/package/mongodb) Node.js driver
- **Hosting**: Netlify (adapter-netlify) or Vercel
- **Assets**: Firebase Storage for book covers, genre icons, and media. Covers are resolved client-side.

---

## 📂 Project Structure

```bash
author-site/
├── src/
│   ├── lib/
│   │   ├── server/        # Server utilities (db.ts, books.ts, etc.)
│   │   ├── services/      # Helpers (imageLoading, progressiveImage, etc.)
│   │   └── assets/        # Icons, favicons, static images
│   ├── routes/
│   │   ├── +layout.svelte # Global layout
│   │   ├── +page.svelte   # Homepage
│   │   ├── about/         
│   │   ├── books/         
│   │   ├── blog/          
│   │   └── contact/
│   └── app.css            # Tailwind base styles
├── static/                # Favicon and static assets
├── package.json
├── svelte.config.js
└── tsconfig.json
````

---

## ⚙️ Setup & Installation

Clone the repo:

```bash
git clone git@github.com:Boswell-web/author-site.git
cd author-site
```

Install dependencies (Yarn preferred):

```bash
yarn install
# or
npm install
```

Start the dev server:

```bash
yarn dev
```

Open the site at **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```bash
# MongoDB Atlas
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="author_site"

# Firebase client config
PUBLIC_FIREBASE_API_KEY="..."
PUBLIC_FIREBASE_AUTH_DOMAIN="..."
PUBLIC_FIREBASE_PROJECT_ID="..."
PUBLIC_FIREBASE_STORAGE_BUCKET="..."
```

Copy `.env.example` to `.env` and fill in the values for your environment.

### Resolving Covers

Book covers live in Firebase Storage and are resolved on the client with `resolveCover`:

```svelte
<!-- BookCard.svelte -->
<script lang="ts">
  import { resolveCover } from '$lib/utils/covers';
  $: cover = resolveCover(book.cover);
</script>
<img src={cover} alt={book.title} />
```

```svelte
<!-- Hero.svelte -->
<script lang="ts">
  import { resolveCover } from '$lib/utils/covers';
  $: cover = resolveCover(bookCover);
</script>
{#if cover}
  <img src={cover} alt="Book cover" />
{/if}
```

---

## 🗄️ MongoDB Schemas

### BookDoc

```ts
export interface BookDoc {
  _id?: ObjectId;               // MongoDB ObjectId
  id: string;                   // Short unique string identifier (e.g., "faith-in-a-firestorm")
  title: string;                // Full book title
  description: string;          // Short summary or back-cover copy
  cover: string | null;         // Firebase Storage path for cover image
  genre: "faith" | "epic";      // Genre key used for filtering/icons
  status: "published" | "upcoming" | "featured";
  publishDate?: string;         // ISO date string ("2025-09-01")
  isbn?: string;                // ISBN number
  format?: "ebook" | "paperback" | "hardcover";
  createdAt?: Date;             // Auto-set on insertion
  updatedAt?: Date;             // Auto-updated on edit
}
```

### PostDoc

```ts
export interface PostDoc {
  _id?: ObjectId;               // MongoDB ObjectId
  slug: string;                 // Unique slug for routing (/blog/<slug>)
  title: string;                // Blog post title
  content: string;              // Markdown/HTML content
  excerpt?: string;             // Short preview for blog listing
  cover?: string | null;        // Optional cover image path
  tags?: string[];              // e.g., ["writing", "faith", "inspiration"]
  published: boolean;           // Controls visibility on site
  createdAt: Date;              // Auto-set on insertion
  updatedAt?: Date;             // Auto-updated on edit
}
```

---

## 🛠 Development Notes

* **Database**:

  * Collections: `books`, `posts`
  * Documents follow the interfaces above for type safety and consistency.
  * If no featured or upcoming books exist, the homepage loader returns a default featured book and sample upcoming titles using storage paths so the page still renders.

* **Image Handling**:

  * Covers are uploaded to Firebase Storage and resolved on the client with `resolveCover`—no manual tokens needed.
  * Progressive loading helpers.

* **Styling**:

  * Tailwind components with custom utility classes in `app.css`.
  * Favicon and logos in `/static`.

---

## 📦 Deployment

1. **Netlify** (recommended):

   * Install adapter: `@sveltejs/adapter-netlify`
   * Build with:

     ```bash
     yarn build
     netlify deploy --prod
     ```

2. **Vercel**:

   * Install adapter: `@sveltejs/adapter-vercel`
   * Push to GitHub, connect repo to Vercel dashboard.

---

## ✨ Features Roadmap

* [x] Featured book on homepage
* [x] Upcoming releases (faith/epic genres)
* [x] Author About page with biography & portrait
* [x] Blog posts stored in MongoDB Atlas
* [ ] Newsletter signup integration
* [ ] Admin dashboard for adding/editing books & posts
* [ ] Dark mode toggle

---

## 📖 About the Author

**Charles Boswell** is a U.S. Navy veteran and firefighter turned fantasy and faith-based author. His stories are shaped by 16 years of service in wildland firefighting and a lifelong love of storytelling.

---

## 📜 License

MIT License © 2025 Charles W. Boswell
