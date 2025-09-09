// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import validateEnv from './lib/config/env';

validateEnv();

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

