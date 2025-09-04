// src/lib/types/index.ts - UPDATED TO FIX EXPORTS
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
  featured?: boolean;
  // ADD MISSING LINKS PROPERTY
  links?: {
    amazon?: string | null;
    barnes?: string | null;
    other?: string | null;
  } | null;
}

/**
 * Client-side book type (sanitized)
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
  // ADD MISSING LINKS PROPERTY  
  links?: {
    amazon?: string | null;
    barnes?: string | null;
    other?: string | null;
  } | null;
}

/**
 * Blog post types - ENSURE PostDoc IS EXPORTED
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

// ADD MISSING NewsletterSignupData EXPORT
export interface NewsletterSignupData {
  email: string;
  firstName?: string;
  interests?: string[];
}

// ADD MISSING ContactFormData EXPORT  
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export type BookStatus = 'published' | 'writing' | 'coming-soon' | 'draft';