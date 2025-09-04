// src/lib/types.ts - Add missing BookDoc type

export interface Book {
  id: string;
  title: string;
  description: string | null;
  cover: string | null;
  genre: 'faith' | 'epic' | 'sci-fi';
  status: 'published' | 'featured' | 'upcoming' | 'writing' | 'coming-soon';
  publishDate?: string | null;
  isbn?: string | null;
  format?: 'EPUB' | 'paperback' | 'hardcover' | null;
  pages?: number | null;
  buyLinks?: {
    amazon?: string | null;
    barnes?: string | null;
    other?: string | null;
  };
}

// Add the missing BookDoc type for MongoDB documents
export interface BookDoc {
  _id?: any; // MongoDB ObjectId
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre: 'faith' | 'epic' | 'sci-fi';
  status: 'published' | 'featured' | 'upcoming' | 'writing' | 'coming-soon';
  publishDate?: string | null;
  isbn?: string | null;
  format?: 'EPUB' | 'paperback' | 'hardcover' | null;
  pages?: number | null;
  buyLinks?: {
    amazon?: string | null;
    barnes?: string | null;
    other?: string | null;
  };
  featured?: boolean;
}

export interface Post {
  slug: string;
  title: string;
  excerpt?: string;
  contentHtml?: string;
  heroImage?: string;
  publishDate?: string;
  tags?: string[];
  genre?: string;
}

// Add PostDoc type for MongoDB documents
export interface PostDoc {
  _id?: any; // MongoDB ObjectId
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  heroImage?: string | null;
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  status: 'published' | 'draft';
  genre?: 'faith' | 'epic' | 'sci-fi' | string | null;
}