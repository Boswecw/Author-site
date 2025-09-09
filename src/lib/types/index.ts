// src/lib/types/index.ts - COMPLETE FIX
import type { ObjectId } from 'mongodb';

export type BookStatus = 'published' | 'writing' | 'coming-soon' | 'draft' | 'featured' | 'upcoming';
export type PostStatus = 'published' | 'draft';
export type BookGenre = 'faith' | 'epic' | 'sci-fi';

export interface BuyLinks {
  amazon?: string | null;
  barnes?: string | null;
  other?: string | null;
}

// ✅ FIXED: Add missing featured property to BookDoc
export interface BookDoc {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: 'faith' | 'epic' | 'sci-fi' | string | null;
  status?: 'draft' | 'upcoming' | 'published' | 'coming-soon' | string | null;
  publishDate?: string | Date | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: Record<string, string | null>;
  featured?: boolean;  // ✅ ADD THIS to fix the TypeScript errors
}

// ✅ ADD MISSING EXPORT - fixes NewsletterSignup.svelte error
export interface NewsletterSignupData {
  email: string;
  firstName?: string;
  interests?: string[];
}

// ✅ ADD MISSING EXPORT - fixes RSS error
export interface PostDoc {
  _id?: ObjectId;
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  contentHtml?: string | null;
  heroImage?: string | null;
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  genre?: string | null;
  status: PostStatus;
}

// Client-side types
export interface Book {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: BookGenre | null;
  status?: BookStatus | null;
  publishDate?: string | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: BuyLinks | null;
  featured?: boolean;
}

export interface Post {
  slug: string;
  title: string;
  excerpt?: string | null;
  contentHtml?: string | null;
  heroImage?: string | null;
  publishDate?: string | null;
  tags: string[];
  genre?: string | null;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export type ImageType = 'book' | 'avatar' | 'logo';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PageData {
  featured?: Book;
  upcoming?: Book[];
  books?: Book[];
  posts?: Post[];
  drafts?: Book[];
}