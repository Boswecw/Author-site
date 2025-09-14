// src/lib/types/index.ts - COMPLETE FIX
import type { ObjectId } from 'mongodb';

/** ---------- Shared enums/unions ---------- */
export type BookStatus = 'published' | 'writing' | 'coming-soon' | 'draft' | 'featured' | 'upcoming';
export type PostStatus = 'published' | 'draft';
export type BookGenre = 'faith' | 'epic' | 'sci-fi';
export type ImageType = 'book' | 'avatar' | 'logo';

/** ---------- Utilities ---------- */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** ---------- Books ---------- */
export interface BuyLinks {
  amazon?: string | null;
  barnes?: string | null;
  other?: string | null;
}

/** Server-side book document as stored in MongoDB/DB */
export interface BookDoc {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: BookGenre | string | null;
  status?: Exclude<BookStatus, 'featured' | 'upcoming'> | 'upcoming' | 'featured' | string | null;
  publishDate?: string | Date | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  /** Accept strict BuyLinks or an arbitrary map for flexibility */
  buyLinks?: BuyLinks | Record<string, string | null>;
  /** ✅ Added to fix previous TS error in sanitizeBook */
  featured?: boolean;
}

/** Client-side normalized book */
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

/** ---------- Posts / Blog ---------- */

/** Minimal post doc used by various utilities (e.g., RSS) */
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

/** Full post document used in API routes backed by MongoDB */
export interface ExtendedPostDoc extends Omit<PostDoc, '_id' | 'publishDate' | 'publishedAt'> {
  _id: ObjectId;
  /** Dates stored as Date on the server */
  publishDate?: Date | null;
  publishedAt?: Date | null;
  lastSyncedAt?: Date;
  /** ✅ Added to fix API create/list/update type errors */
  createdAt?: Date;
  updatedAt?: Date;
  source?: 'admin' | 'import' | 'api';
}

/** Lightweight post for client lists */
export interface Post {
  slug: string;
  title: string;
  excerpt?: string | null;
  contentHtml?: string | null;
  heroImage?: string | null;
  publishDate?: string | null; // client stringified date
  tags: string[];
  genre?: string | null;
}

/** Filters and pagination used by blog pages */
export interface BlogFilters {
  search?: string;
  tag?: string;
}

export interface Pagination {
  /** Current page number (1-based) */
  current: number;
  /** Total number of pages */
  total: number;
  /** Whether there is a next page */
  hasMore: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
  /** Total number of posts across all pages */
  totalPosts: number;
}

/** ---------- Forms ---------- */

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

/** ---------- Health / Diagnostics (for HealthModal) ---------- */

export interface HealthStatus {
  healthy: boolean;
  database?: {
    connected: boolean;
    connectionTime?: number;
  };
  subscribers?: {
    total: number;
    confirmed: number;
  };
  performance?: {
    totalTime: number;
  };
}

export interface MongoDiagnostics {
  database?: {
    collections?: string[];
  };
}

export interface HealthResponse {
  health: HealthStatus;
  mongodb?: MongoDiagnostics;
  timestamp: string;
}

/** ---------- Misc page data (internal helpers) ---------- */
/** Keep this separate from SvelteKit route `./$types` PageData */
export interface PageData {
  featured?: Book;
  upcoming?: Book[];
  books?: Book[];
  posts?: Post[];
  drafts?: Book[];
}
