import type { PageLoad } from './$types';

type PostModule = {
  metadata: {
    title: string;
    excerpt?: string;
    publishDate?: string;
    tags?: string[];
    readTime?: string;
  };
  default: unknown;
};

export const load: PageLoad = async ({ url }) => {
  const tag = url.searchParams.get('tag') ?? 'All';

  const modules = import.meta.glob('/src/lib/posts/*.md', { eager: true }) as Record<string, PostModule>;

  const posts = Object.entries(modules).map(([path, mod]) => {
    const slug = path.split('/').pop()?.replace('.md', '')!;
    return {
      slug,
      ...mod.metadata
    };
  })
  .filter(p => !!p.title)
  .sort((a, b) => (new Date(b.publishDate ?? 0).getTime()) - (new Date(a.publishDate ?? 0).getTime()));

  const filtered = tag === 'All' ? posts : posts.filter(p => p.tags?.includes(tag));

  // build category list from posts (plus 'All')
  const categories = Array.from(new Set(posts.flatMap(p => p.tags ?? []))).sort();
  categories.unshift('All');

  return { posts: filtered, allCategories: categories, selectedTag: tag };
};
