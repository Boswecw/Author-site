export interface NewsletterSignupData {
  name?: string;
  email: string;
  source?: string;
}

export interface BookDoc {
  _id?: import('mongodb').ObjectId;
  title: string;
  description: string;
  cover?: string | null;
  genre: string;
  status: BookStatus;
  publishDate?: Date | string | null;
  isbn?: string | null;
  format: string;
  pages?: number | null;
  buyLinks?: Record<string, string>;
  featured?: boolean;
  links?: Record<string, string>;
}

export type BookStatus = 'published' | 'upcoming' | 'draft';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
