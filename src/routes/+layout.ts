// src/routes/+layout.ts
export const prerender = true;

// src/routes/+layout.server.ts (or +layout.ts depending on your setup)
export const load = () => ({
  meta: {
    title: 'Charles W. Boswell — Author',
    description: 'Official site of Charles W. Boswell, author of Faith in a FireStorm.'
  }
});
