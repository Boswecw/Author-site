// src/hooks.server.ts
import '$lib/config/env';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  try {
    return await resolve(event);
  } catch (err) {
    console.error('[HOOK] Uncaught error:', err);
    throw err; // still surfaces to SvelteKit error page
  }
};

export function handleError({ error }) {
  console.error('[HOOK] handleError:', error);
}
