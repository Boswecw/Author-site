// src/lib/server/blog-google-docs.ts - Extend existing blog system

import { getDb } from '$lib/server/db';
import type { ObjectId } from 'mongodb';

// Extend your existing PostDoc interface slightly
export interface ExtendedPostDoc {
  _id?: ObjectId;
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;  // Keep your existing Markdown field
  heroImage?: string | null;
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  genre?: string | null;
  status: 'published' | 'draft';
  
  // NEW: Google Docs integration fields
  source?: 'google-docs' | 'manual' | 'admin';  // Track how post was created
  googleDocId?: string;  // Link back to Google Doc
  lastSyncedAt?: Date;   // When last synced from Google Docs
}

/**
 * Convert HTML content to Markdown
 * This keeps your existing contentMarkdown field working
 */
function htmlToMarkdown(html: string): string {
  // Simple HTML to Markdown conversion
  // You could use a library like 'turndown' for more sophisticated conversion
  
  let markdown = html
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    // Lists
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
    
  return markdown;
}

/**
 * Create slug from title (matches your existing logic)
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Save content from Google Docs to your existing posts collection
 */
export async function saveGoogleDocsPost(data: {
  googleDocId: string;
  title: string;
  htmlContent: string;
  metadata: {
    excerpt?: string;
    tags?: string[];
    status?: 'draft' | 'published';
    heroImage?: string;
    genre?: string;
    publishDate?: string;
  };
}): Promise<ExtendedPostDoc> {
  const db = await getDb();
  const collection = db.collection<ExtendedPostDoc>('posts');
  
  const slug = createSlug(data.title);
  const now = new Date();
  
  // Convert HTML to Markdown to fit your existing schema
  const contentMarkdown = htmlToMarkdown(data.htmlContent);
  
  // Extract excerpt from content if not provided
  const excerpt = data.metadata.excerpt || 
    contentMarkdown.substring(0, 160).replace(/[#*\[\]]/g, '').trim() + '...';
  
  // Prepare post document (matches your existing schema)
  const postDoc: Omit<ExtendedPostDoc, '_id'> = {
    slug,
    title: data.title,
    excerpt,
    contentMarkdown,  // ✅ Keeps your existing Markdown field
    heroImage: data.metadata.heroImage || null,
    publishDate: data.metadata.publishDate ? new Date(data.metadata.publishDate) : now,
    publishedAt: data.metadata.status === 'published' ? now : null,
    tags: data.metadata.tags || [],
    genre: data.metadata.genre || null,
    status: data.metadata.status || 'published',
    
    // New Google Docs tracking fields
    source: 'google-docs',
    googleDocId: data.googleDocId,
    lastSyncedAt: now
  };
  
  // Upsert based on Google Doc ID (if exists) or slug
  const existingPost = await collection.findOne({ 
    $or: [
      { googleDocId: data.googleDocId },
      { slug }
    ]
  });
  
  if (existingPost) {
    // Update existing post
    const result = await collection.findOneAndUpdate(
      { _id: existingPost._id },
      { $set: postDoc },
      { returnDocument: 'after' }
    );
    return result.value!;
  } else {
    // Create new post
    const result = await collection.insertOne(postDoc);
    return { ...postDoc, _id: result.insertedId };
  }
}

/**
 * Check if Google Doc has been synced before
 */
export async function checkGoogleDocSync(googleDocId: string): Promise<{
  exists: boolean;
  post?: ExtendedPostDoc;
  lastSynced?: Date;
}> {
  const db = await getDb();
  const collection = db.collection<ExtendedPostDoc>('posts');
  
  const post = await collection.findOne({ googleDocId });
  
  if (post) {
    return {
      exists: true,
      post,
      lastSynced: post.lastSyncedAt
    };
  }
  
  return { exists: false };
}

/**
 * Get all Google Docs sourced posts (for admin purposes)
 */
export async function getGoogleDocsPosts(): Promise<ExtendedPostDoc[]> {
  const db = await getDb();
  const collection = db.collection<ExtendedPostDoc>('posts');
  
  return await collection
    .find({ source: 'google-docs' })
    .sort({ publishDate: -1 })
    .toArray();
}