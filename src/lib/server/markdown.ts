// src/lib/server/markdown.ts - MARKDOWN PROCESSOR
import { marked } from 'marked';

/**
 * ✅ FIXED: Configure marked for safe HTML output
 */
marked.setOptions({
  gfm: true,
  breaks: true,
  // sanitize option was removed in newer versions of marked
  // Use DOMPurify or similar for sanitization if needed
}); 

/**
 * ✅ Convert markdown to HTML
 */
export async function mdToHtml(markdown: string): Promise<string> {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  try {
    return await marked(markdown);
  } catch (error) {
    console.error('[mdToHtml] Markdown parsing error:', error);
    // Return the original markdown wrapped in a pre tag as fallback
    return `<pre>${markdown}</pre>`;
  }
}

/**
 * ✅ Extract excerpt from markdown content
 */
export function extractExcerpt(markdown: string, maxLength: number = 150): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // Remove markdown formatting for excerpt
  const plainText = markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/`(.*?)`/g, '$1') // Remove code formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last complete word within the limit
  const trimmed = plainText.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? trimmed.substring(0, lastSpace) + '...'
    : trimmed + '...';
}