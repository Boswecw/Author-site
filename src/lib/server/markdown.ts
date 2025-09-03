// src/lib/server/markdown.ts

/**
 * CRITICAL FIX: Safe markdown-to-HTML conversion with fallbacks
 */
export async function mdToHtml(markdown: string | null | undefined): Promise<string> {
  if (!markdown || typeof markdown !== 'string') {
    return '<p class="text-gray-500 italic">No content available.</p>';
  }

  try {
    // Try to use a markdown processor if available
    // For now, implement basic markdown-like conversion
    return processBasicMarkdown(markdown);
  } catch (error) {
    console.error('[mdToHtml] Markdown processing failed:', error);
    
    // Fallback: Return escaped HTML with basic formatting
    return `<div class="prose prose-gray max-w-none">
      ${escapeHtml(markdown).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
    </div>`;
  }
}

/**
 * Basic markdown processing for common patterns
 */
function processBasicMarkdown(text: string): string {
  let html = text;

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-red-600 hover:text-red-700 underline" target="_blank" rel="noopener">$1</a>');

  // Code blocks (basic)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');

  // Lists
  html = html.replace(/^\* (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-2 my-4">$1</ul>');

  // Paragraphs (split by double newlines)
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<ul')) return p;
      return `<p class="mb-4 leading-relaxed">${p}</p>`;
    })
    .filter(p => p)
    .join('\n');

  return `<div class="prose prose-red max-w-none">${html}</div>`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match] || match);
}

/**
 * Calculate estimated reading time
 */
export function calculateReadingTime(markdown: string): string {
  if (!markdown) return '0 min read';
  
  const wordsPerMinute = 200;
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / wordsPerMinute));
  
  return `${minutes} min read`;
}

/**
 * Extract excerpt from markdown content
 */
export function extractExcerpt(markdown: string, maxLength = 160): string {
  if (!markdown) return '';
  
  // Remove markdown formatting
  let text = markdown
    .replace(/#{1,6}\s/g, '') // headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .trim();

  // Get first paragraph or truncate
  const firstParagraph = text.split('\n\n')[0];
  if (firstParagraph.length <= maxLength) return firstParagraph;
  
  return firstParagraph.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}