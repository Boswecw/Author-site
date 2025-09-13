// src/lib/types.ts - Complete type definitions for Author Site

// Newsletter subscription data
export interface NewsletterSignupData {
  name?: string;
  email: string;
  source?: string;
  firstName?: string;
}

// MongoDB book document (raw database structure)
export interface BookDoc {
  _id?: import('mongodb').ObjectId;
  id?: string;
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

// Processed book data (for client-side use)
export interface Book {
  id: string;
  title: string;
  description: string;
  cover: string | null;
  genre: string;
  status: BookStatus;
  publishDate: string | null;
  isbn: string | null;
  format: string;
  pages: number | null;
  buyLinks: Record<string, string>;
  featured: boolean;
}

// All possible book statuses
export type BookStatus = 'published' | 'upcoming' | 'draft' | 'writing' | 'coming-soon' | 'featured';

// Contact form data
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}