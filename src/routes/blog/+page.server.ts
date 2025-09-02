import type { PageServerLoad } from './$types';
import { getPublishedPosts, getAllTags } from '$lib/server/posts';
import { mdToHtml } from '$lib/server/markdown';
import { env } from '$env/dynamic/private';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const tagParam = url.searchParams.get('tag') ?? undefined;
  const pageSize = 10;

  const { items, total } = await getPublishedPosts(page, pageSize, tagParam);
  const tags = await getAllTags();

  const posts = items.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    heroImage: normalizeFirebaseUrl(p.heroImage) ?? undefined,
    publishDate: p.publishDate ?? undefined,
    tags: p.tags ?? [],
    genre: p.genre,
    contentHtml: mdToHtml(p.contentMarkdown ?? '')
  }));

  return {
    posts,
    total,
    page,
    pageSize,
    tag: tagParam ?? 'All',
    tags,
    __debug: { db: env.MONGODB_DB, found: posts.length }
  };
};

