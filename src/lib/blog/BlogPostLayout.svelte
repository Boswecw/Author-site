<script lang="ts">
    export let metadata: {
      title?: string;
      excerpt?: string;
      publishDate?: string;
      tags?: string[];
      readTime?: string;
    } = {};
  </script>
  
  <article class="prose dark:prose-invert max-w-3xl mx-auto py-12">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">{metadata.title ?? ''}</h1>
      {#if metadata.excerpt}<p class="text-gray-600">{metadata.excerpt}</p>{/if}
      <div class="mt-3 text-sm text-gray-500 flex gap-3 flex-wrap">
        {#if metadata.publishDate}
          <time>
            {new Date(metadata.publishDate).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: '2-digit'
            })}
          </time>
        {/if}
        {#if metadata.readTime}<span>{metadata.readTime}</span>{/if}
        {#if metadata.tags?.length}
          <span class="inline-flex gap-2">
            {#each metadata.tags as t}
              <span class="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">{t}</span>
            {/each}
          </span>
        {/if}
      </div>
    </header>
    <slot />
  </article>
  