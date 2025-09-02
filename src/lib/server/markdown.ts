// src/lib/server/markdown.ts
import { marked } from 'marked';
import createDOMPurify from 'isomorphic-dompurify';

const DOMPurify = createDOMPurify();

export function mdToHtml(md: string) {
  const dirty = marked.parse(md ?? '');
  return DOMPurify.sanitize(dirty as string);
}
