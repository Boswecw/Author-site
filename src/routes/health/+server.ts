import type { RequestHandler } from './$types';
export const GET: RequestHandler = async () =>
  new Response('ok', { status: 200 });
