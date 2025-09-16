// src/lib/types.ts - FIXED: Complete type definitions
import type { ObjectId } from 'mongodb';

// All possible book statuses
export type BookStatus = 'published' | 'upcoming' | 'draft' | 'writing' | 'coming-soon' | 'featured';

// All possible post statuses  
export type PostStatus = 'published' | 'draft';

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
  values?: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
}

// FIXED: Post interface defined BEFORE it's used
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

// Blog page data interface
export interface BlogFilters {
  search?: string | null;
  tag?: string | null;
}

export interface BlogPagination {
  current: number;
  total: number;
  hasMore: boolean;
  hasPrevious: boolean;
  totalPosts: number;
}

// FIXED: Now Post is defined above this usage
export interface PageData {
  posts?: Post[];
  filters?: BlogFilters;
  pagination?: BlogPagination;
}

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

// Extended post document with ALL missing timestamp fields
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
  
  // Timestamp fields
  createdAt?: Date;
  updatedAt?: Date;
}

// Image component props with loading attribute
export interface ImageProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fallbackText?: string;
  fallbackType?: 'book' | 'avatar' | 'logo';
  loading?: 'lazy' | 'eager';
}

// Newsletter admin page data
export interface NewsletterPageData {
  newsletters: Array<{
    id: string;
    subject: string;
    preheader?: string;
    status: 'draft' | 'ready' | 'sent';
    createdAt: string;
    processedAt?: string;
    sentAt?: string;
    googleDocUrl?: string;
    fileName?: string;
    source?: string;
  }>;
  error?: string;
}