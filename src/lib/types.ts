// src/lib/types.ts

export type BookStatus =
  | 'writing'
  | 'coming-soon'
  | 'draft'        // ← include 'draft'
  | 'featured'
  | 'published'
  | 'upcoming';

export type BookGenre = 'faith' | 'epic' | 'sci-fi' | string;

export interface Book {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;         // Firebase Storage path
  genre?: BookGenre | null;
  status?: BookStatus | null;
  publishDate?: string | null;       // ISO string for client/UI
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: Record<string, string> | null;
}

// Mongo document shape (publishDate can be Date or string in DB)
export interface BookDoc extends Omit<Book, 'publishDate'> {
  publishDate?: Date | string | null;
}
