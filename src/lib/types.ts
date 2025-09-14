// src/lib/types.ts - Complete fix for all TypeScript issues
import type { ObjectId } from 'mongodb';

// Newsletter subscription data
export interface NewsletterSignupData {
  name?: string;
  email: string;
  source?: string;
  firstName?: string;
}

// Contact form data and action result
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactActionData {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
}

// All possible book statuses
export type BookStatus = 'published' | 'upcoming' | 'draft' | 'writing' | 'coming-soon' | 'featured';

// All possible post statuses
export type PostStatus = 'published' | 'draft';

// MongoDB book document (raw database structure)
export interface BookDoc {
  _id?: ObjectId;
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
  featured?: boolean; // ✅ FIXED: Added optional featured property
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
  featured: boolean; // ✅ FIXED: Make this required to match sanitizeBook function
}

// ✅ FIXED: ExtendedPostDoc with ALL missing timestamp fields
export interface ExtendedPostDoc {
  _id?: ObjectId;
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  heroImage?: string | null;
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  genre?: string | null;
  status: PostStatus;
  
  // Google Docs integration fields
  source?: 'google-docs' | 'manual' | 'admin';
  googleDocId?: string;
  lastSyncedAt?: Date;
  
  // ✅ FIXED: Added ALL missing timestamp fields
  createdAt?: Date;
  updatedAt?: Date;
}

// Client-side Post interface
export interface Post {
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  heroImage?: string | null;
  publishDate?: string | null;
  tags?: string[];
  genre?: string | null;
  status: PostStatus;
}

// Image component props
export interface ImageProps {
  src: string | null;
  alt?: string;
  className?: string;
  fallbackText?: string;
  fallbackType?: 'book' | 'avatar' | 'logo';
  loading?: 'eager' | 'lazy'; // ✅ FIXED: Added loading prop
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}