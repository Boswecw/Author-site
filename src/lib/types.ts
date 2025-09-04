export type Book = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: 'faith' | 'epic' | 'sci-fi' | string | null;
  status?: string | null;
  publishDate?: string | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: Record<string, string | null>;
  featured?: boolean;
};

export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  tags?: string[];
}