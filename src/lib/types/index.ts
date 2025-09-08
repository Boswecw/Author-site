// src/lib/types/index.ts - CLEANED UP AND CONSISTENT
import type { ObjectId } from 'mongodb';

/**
 * Type definitions for consistent use across interfaces
 */
export type BookStatus = 'published' | 'writing' | 'coming-soon' | 'draft' | 'featured';
export type PostStatus = 'published' | 'draft';
export type BookGenre = 'faith' | 'epic' | 'sci-fi';

/**
 * Buy links structure for books
 */
export interface BuyLinks {
  amazon?: string | null;
  barnes?: string | null;
  other?: string | null;
}

/**
 * MongoDB document type for books collection
 */
export interface BookDoc {
  _id?: ObjectId;
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: BookGenre | null;
  status?: BookStatus | null;
  publishDate?: string | Date | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: BuyLinks | null;
  featured?: boolean;
}

/**
 * Client-side book type (clean, no MongoDB-specific fields)
 */
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

/**
 * Blog post MongoDB document
 */
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
  status: PostStatus;
  genre?: string | null;
}

/**
 * Client-side post type (clean, no MongoDB-specific fields)
 */
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

/**
 * Form data types
 */
export interface NewsletterSignupData {
  email: string;
  firstName?: string;
  interests?: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

/**
 * Image-related types
 */
export type ImageType = 'book' | 'avatar' | 'logo';

export interface ImageConfig {
  width: number;
  height: number;
}

/**
 * API response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Page data types for SvelteKit
 */
export interface PageData {
  featured?: Book;
  upcoming?: Book[];
  books?: Book[];
  posts?: Post[];
  drafts?: Book[];
}

/**
 * Utility types for database operations
 */
export type CreateBookData = Omit<BookDoc, '_id' | 'featured'>;
export type UpdateBookData = Partial<CreateBookData>;
export type CreatePostData = Omit<PostDoc, '_id'>;
export type UpdatePostData = Partial<CreatePostData>;