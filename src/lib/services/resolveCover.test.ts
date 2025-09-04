import { describe, expect, it, vi } from 'vitest';

// Mock Firebase Storage SDK
vi.mock('firebase/storage', () => {
  return {
    getDownloadURL: vi.fn(),
    ref: vi.fn((_storage, path: string) => path),
    getStorage: vi.fn(() => ({}))
  };
});

import { resolveCover } from './resolveCover';
import { getDownloadURL } from 'firebase/storage';

const mockedGetDownloadURL = vi.mocked(getDownloadURL);

describe('resolveCover', () => {
  it('returns null for falsy input', async () => {
    expect(await resolveCover(undefined)).toBeNull();
    expect(await resolveCover(null)).toBeNull();
    expect(await resolveCover('')).toBeNull();
  });

  it('returns original URL when given an http(s) URL', async () => {
    const url = 'https://example.com/image.jpg';
    const result = await resolveCover(url);
    expect(result).toBe(url);
    expect(mockedGetDownloadURL).not.toHaveBeenCalled();
  });

  it('calls getDownloadURL with a storage path', async () => {
    const storagePath = 'covers/test.jpg';
    mockedGetDownloadURL.mockResolvedValueOnce('resolved-url');

    const result = await resolveCover(storagePath);

    expect(mockedGetDownloadURL).toHaveBeenCalledWith(storagePath);
    expect(result).toBe('resolved-url');
  });
});
