import { describe, expect, it } from 'vitest';
import { FIREBASE_TOKENS } from './firebaseTokens';

function findMissing(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object'
      ? findMissing(value, path)
      : value ? [] : [path];
  });
}

describe('firebase token configuration', () => {
  it('loads tokens from environment variables', () => {
    const missing = findMissing(FIREBASE_TOKENS);
    expect(missing).toEqual([]);
  });
});
