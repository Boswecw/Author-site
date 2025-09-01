import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const modules = import.meta.glob('/src/lib/posts/*.md');

  const slug = params.slug;
  const match = Object.keys(modules).find((p) => p.endsWith(`/${slug}.md`));
  if (!match) {
    return { status: 404 };
  }

  const mod: any = await modules[match](); // dynamic import
  return {
    component: mod.default,
    metadata: mod.metadata
  };
};
