import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/server/posts';
import { mdToHtml } from '$lib/server/markdown';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPostBySlug(params.slug);
  if (!post || post.status !== 'published') throw error(404, 'Post not found');

  return {
    post: {
      ...post,
      heroImage: normalizeFirebaseUrl(post.heroImage) ?? undefined,
      contentHtml: mdToHtml(post.contentMarkdown ?? '')
    }
  };
};
