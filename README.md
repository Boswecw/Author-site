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
- **Assets**: Firebase Storage for book covers, genre icons, and media

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

# Optional: Firebase bucket (for images)
FIREBASE_BUCKET="endless-fire-467204-n2.firebasestorage.app"
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
  cover: string | null;         // Firebase Storage URL for cover image
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
  cover?: string | null;        // Optional cover image URL
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
  * If no featured or upcoming books exist, the homepage loader returns a default featured book and sample upcoming titles from `FIREBASE_IMAGES` so the page still renders.

* **Image Handling**:

  * Progressive loading & Firebase storage normalization helpers.
  * Book covers must be uploaded to Firebase Storage before referenced in MongoDB.

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

```

---

Would you like me to also include **sample seed data** (JSON) for books and posts in the README so you can quickly populate your MongoDB Atlas collections for local testing?
```
