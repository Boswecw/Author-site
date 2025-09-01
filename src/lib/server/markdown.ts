// src/lib/server/markdown.ts
import { marked } from 'marked';
import createDOMPurify from 'isomorphic-dompurify';

export function mdToHtml(md: string) {
  const dirty = marked.parse(md ?? '');
  return createDOMPurify.sanitize(dirty as string);
}
