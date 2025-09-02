// lib/utils/image.ts
function base64EncodeUtf8(s: string) {
  if (typeof window === 'undefined') {
    return Buffer.from(s, 'utf-8').toString('base64');
  }
  // Browser-safe UTF-8 → base64
  return btoa(unescape(encodeURIComponent(s)));
}

export function createImageFallback(
  text: string,
  type: 'book' | 'author' | 'blog' = 'book',
  bgColor = '#7f1d1d',
  textColor = 'white'
): string {
  const [width, height] = (type === 'book' ? '400x600' : '300x300').split('x');
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${text}">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="serif" font-size="18" font-weight="bold"
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${base64EncodeUtf8(svg)}`;
}
