import { describe, it, expect } from 'vitest';
import { normalizeFirebaseUrl } from './urls';

describe('normalizeFirebaseUrl', () => {
  it('rewrites .firebasestorage.app buckets to .appspot.com and adds alt=media', () => {
    const input =
      'https://firebasestorage.googleapis.com/v0/b/test-bucket.firebasestorage.app/o/file.txt';
    const result = normalizeFirebaseUrl(input);

    expect(result).toBeTruthy();
    const url = new URL(result!);
    expect(url.searchParams.get('alt')).toBe('media');
    expect(result).toContain('test-bucket.appspot.com');
    expect(result).not.toContain('firebasestorage.app');
  });

  it('rewrites malformed bucket even when alt is already present', () => {
    const input =
      'https://firebasestorage.googleapis.com/v0/b/another-bucket.firebasestorage.app/o/file.txt?alt=media';
    const result = normalizeFirebaseUrl(input);

    expect(result).toBeTruthy();
    const url = new URL(result!);
    expect(url.searchParams.get('alt')).toBe('media');
    expect(result).toContain('another-bucket.appspot.com');
    expect(result).not.toContain('firebasestorage.app');
  });

  it('adds alt=media to .appspot.com URLs', () => {
    const input =
      'https://firebasestorage.googleapis.com/v0/b/test-bucket.appspot.com/o/file.txt';
    const result = normalizeFirebaseUrl(input);

    expect(result).toBeTruthy();
    const url = new URL(result!);
    expect(url.searchParams.get('alt')).toBe('media');
    expect(result).toContain('test-bucket.appspot.com');
  });
});

