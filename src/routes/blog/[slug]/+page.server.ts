import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/server/posts';

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPostBySlug(params.slug);
  if (!post || post.status !== 'published') throw error(404, 'Post not found');
  return { post };
};
