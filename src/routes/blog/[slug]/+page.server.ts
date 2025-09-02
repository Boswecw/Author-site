import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/server/posts';
import { mdToHtml } from '$lib/server/markdown';

function normalizeFirebaseUrl(url?: string | null): string | undefined {
  return url?.replace('endless-fire-467204-n2.firebasestorage.app', 'endless-fire-467204-n2.appspot.com');
}

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPostBySlug(params.slug);
  if (!post || post.status !== 'published') throw error(404, 'Post not found');

  return {
    post: {
      ...post,
      heroImage: normalizeFirebaseUrl(post.heroImage),
      contentHtml: mdToHtml(post.contentMarkdown ?? '')
    }
  };
};
