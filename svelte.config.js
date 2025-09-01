// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import path from 'node:path';

const blogLayout = path.resolve('src/lib/blog/BlogPostLayout.svelte');

const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    mdsvex({
      extensions: ['.md'],
      layout: { _: blogLayout } // absolute filesystem path (no $lib here)
    }),
    vitePreprocess()
  ],
  kit: { adapter: adapter() }
};

export default config;
