// src/routes/health/+server.ts
import { json } from '@sveltejs/kit';
import { testConnection } from '$lib/server/db';
export const prerender = false;
export const GET = async () => json({ ok: await testConnection() });
