import { describe, it, expect } from 'vitest';
import ReliableImage from './ReliableImage.svelte';

describe('ReliableImage', () => {
  it('falls back to data URI when src is null', () => {
    let result: { html: string } | undefined;
    expect(() => {
      result = ReliableImage.render({ src: null, alt: 'test' });
    }).not.toThrow();
    expect(result!.html).toContain('data:image/svg+xml;base64');
  });
});
