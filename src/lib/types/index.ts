// src/lib/types/index.ts - COMPLETE WITH PostDoc
import type { ObjectId } from 'mongodb';

/**
 * MongoDB document type for books collection
 */
export interface BookDoc {
  _id?: ObjectId;
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: 'faith' | 'epic' | 'sci-fi' | null;
  status?: 'published' | 'writing' | 'coming-soon' | 'draft' | null;
  publishDate?: string | Date | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: {
    amazon?: string | null;
    barnes?: string | null;
    other?: string | null;
  } | null;
  links?: {
    amazon?: string | null;
    barnes?: string | null;
    other?: string | null;
  } | null;
  featured?: boolean;
}

/**
 * Client-side book type
 */
export interface Book {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: 'faith' | 'epic' | 'sci-fi' | null;
  status?: 'published' | 'writing' | 'coming-soon' | 'draft' | null;
  publishDate?: string | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: {
    amazon?: string | null;
    barnes?: string | null;
    other?: string | null;
  } | null;
  links?: {
    amazon?: string | null;
    barnes?: string | null;
    other?: string | null;
  } | null;
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
  status: 'published' | 'draft';
  genre?: string | null;
}

/**
 * Client-side post type
 */
export interface Post {
  slug: string;
  title: string;
  excerpt?: string;
  contentHtml?: string;
  heroImage?: string;
  publishDate?: string;
  tags: string[];
  genre?: string;
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
 * Status type definitions
 */
export type BookStatus = 'published' | 'writing' | 'coming-soon' | 'draft';
export type PostStatus = 'published' | 'draft';
export type BookGenre = 'faith' | 'epic' | 'sci-fi';