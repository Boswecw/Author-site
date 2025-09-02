<script lang="ts">
  import type { BlogPost } from '$lib/types';

  // Sample blog posts - replace with your actual data
  const posts: BlogPost[] = [
    {
      title: 'From Firefighter to Fantasy Author: My Writing Journey',
      excerpt: 'Discover how sixteen years of battling wildfires shaped my approach to creating epic fantasy worlds filled with elemental magic and authentic heroism.',
      date: '2024-12-15',
      slug: 'firefighter-to-fantasy-author',
      tags: ['writing', 'personal', 'firefighting']
    },
    {
      title: 'The Real Brotherhood Behind Fantasy Fellowship',
      excerpt: 'Military service and firefighting taught me about true brotherhood. Learn how these real experiences influence the character relationships in my novels.',
      date: '2024-12-01',
      slug: 'real-brotherhood-fantasy-fellowship',
      tags: ['military', 'character development', 'brotherhood']
    },
    {
      title: 'Why I Write Christian Fantasy',
      excerpt: 'Faith has been my anchor through dangerous missions and life-threatening situations. Here\'s why I weave spiritual themes into my fantasy adventures.',
      date: '2024-11-20',
      slug: 'why-christian-fantasy',
      tags: ['faith', 'writing philosophy', 'genre']
    },
    {
      title: 'Building Authentic Magic Systems',
      excerpt: 'Drawing from my experience with the raw power of wildfires, I create magic systems that feel both fantastical and grounded in reality.',
      date: '2024-11-05',
      slug: 'authentic-magic-systems',
      tags: ['worldbuilding', 'magic systems', 'writing craft']
    }
  ];

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Blog — Charles Boswell</title>
  <meta name="description" content="Read insights on writing, military service, firefighting, and the intersection of faith and fantasy from author Charles W. Boswell." />
</svelte:head>

<div class="section-padding">
  <div class="container-width">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">From the Fire Line</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Insights on writing, faith, service, and the real experiences that shape 
        my fantasy worlds. Stories from both the battlefield and the blank page.
      </p>
    </div>

    <!-- Blog Posts -->
    <div class="max-w-4xl mx-auto space-y-12">
      {#each posts as post}
        <article class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <time datetime={post.date}>{formatDate(post.date)}</time>
              {#if post.tags && post.tags.length > 0}
                <span>•</span>
                <div class="flex space-x-2">
                  {#each post.tags as tag}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {tag}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>

            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors">
              <a href="/blog/{post.slug}">{post.title}</a>
            </h2>

            <p class="text-lg text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            <a 
              href="/blog/{post.slug}"
              class="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors"
            >
              Read Full Post
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </article>
      {/each}
    </div>

    <!-- Coming Soon Message -->
    <div class="mt-16 text-center bg-gray-50 rounded-xl p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">More Stories Coming Soon</h2>
      <p class="text-lg text-gray-600 mb-6">
        I'm regularly sharing insights about writing, military life, firefighting, 
        and the creative process. Subscribe to stay updated with new posts.
      </p>
      <a href="/contact" class="btn-primary">
        Subscribe for Updates
      </a>
    </div>
  </div>
</div>