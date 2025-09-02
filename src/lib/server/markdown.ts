// src/lib/server/markdown.ts
import { marked } from 'marked';

// Optional: tweak renderer or options here
marked.setOptions({
  // gfm enabled by default in recent versions
  // breaks: false, // set true if you want single newlines -> <br>
});

/**
 * Convert Markdown -> HTML (server-side).
 * Marked's parse can be async, so expose an async API.
 */
export async function mdToHtml(md: string): Promise<string> {
  // marked.parse returns string | Promise<string> depending on config
  const html = await marked.parse(md ?? '', { async: true });
  return typeof html === 'string' ? html : String(html);
}
