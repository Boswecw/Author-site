import { describe, it, expect } from 'vitest';
import { normalizeFirebaseUrl } from './urls';

describe('normalizeFirebaseUrl', () => {
  it('keeps .firebasestorage.app URLs and adds alt=media', () => {
    const input =
      'https://firebasestorage.googleapis.com/v0/b/test-bucket.firebasestorage.app/o/file.txt';
    const result = normalizeFirebaseUrl(input);

    expect(result).toBeTruthy();
    const url = new URL(result!);
    expect(url.searchParams.get('alt')).toBe('media');
    expect(result).toContain('test-bucket.firebasestorage.app');
    expect(result).not.toContain('appspot.com');
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

  it('preserves existing tokens in the URL', () => {
    const input =
      'https://firebasestorage.googleapis.com/v0/b/test-bucket.appspot.com/o/file.txt?alt=media&token=123';
    const result = normalizeFirebaseUrl(input);

    expect(result).toBeTruthy();
    const url = new URL(result!);
    expect(url.searchParams.get('alt')).toBe('media');
    expect(url.searchParams.get('token')).toBe('123');
  });
});

