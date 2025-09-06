// src/routes/health/+server.ts
import { json } from '@sveltejs/kit';
import { testConnection } from '$lib/server/db';

export const prerender = false;

export const GET = async () => {
  // Returns true if Mongo responds to a ping; false otherwise.
  const db = await testConnection();

  // Always 200 so platform health checks don't block deploys
  return json(
    {
      ok: true,    // service is up
      db           // database connectivity status
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store'
      }
    }
  );
};
