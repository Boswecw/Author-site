<script lang="ts">
  // Mock blog posts data - replace with real data later
  const blogPosts = [
    {
      id: '1',
      title: 'Writing Authentic Battle Scenes: Lessons from the Fireline',
      excerpt: 'How 16 years of wildland firefighting taught me to write realistic combat that readers can feel in their bones.',
      content: '',
      publishDate: '2024-02-15',
      tags: ['Writing Craft', 'Firefighting', 'Military']
    },
    {
      id: '2',  
      title: 'The Brotherhood Code: Why Fantasy Needs Real Relationships',
      excerpt: 'The bonds forged in crisis run deeper than any magical connection. Here\'s how I bring authentic camaraderie to fantasy.',
      content: '',
      publishDate: '2024-01-28',
      tags: ['Character Development', 'Military', 'Fantasy']
    },
    {
      id: '3',
      title: 'Fire and Magic: Creating Elemental Systems That Make Sense',
      excerpt: 'When you\'ve worked with real fire for decades, fantasy fire magic takes on new meaning. My approach to elemental worldbuilding.',
      content: '',
      publishDate: '2024-01-10',
      tags: ['Worldbuilding', 'Magic Systems', 'Writing Craft']
    }
  ];
</script>

<svelte:head>
  <title>Blog & Updates - Author Name</title>
  <meta name="description" content="Writing insights, behind-the-scenes stories, and updates from a fantasy author with real military and firefighting experience." />
</svelte:head>

<section class="py-20 bg-gray-50">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Blog & Updates</h1>
      <p class="text-xl text-gray-600">
        Writing insights, behind-the-scenes stories, and lessons learned from the fireline to fiction.
      </p>
    </div>

    <!-- Blog Posts -->
    <div class="space-y-8">
      {#each blogPosts as post}
        <article class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex flex-wrap gap-2 mb-4">
              {#each post.tags as tag}
                <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              {/each}
            </div>
            
            <h2 class="text-2xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors">
              <a href="/blog/{post.id}" class="no-underline">
                {post.title}
              </a>
            </h2>
            
            <p class="text-gray-600 text-lg leading-relaxed mb-6">
              {post.excerpt}
            </p>
            
            <div class="flex items-center justify-between">
              <time class="text-sm text-gray-500">
                {new Date(post.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}
              </time>
              
              <a 
                href="/blog/{post.id}" 
                class="text-red-600 font-semibold hover:text-red-700 transition-colors"
              >
                Read More →
              </a>
            </div>
          </div>
        </article>
      {/each}
    </div>

    <!-- Newsletter Signup -->
    <div class="bg-white rounded-lg shadow-lg p-8 mt-16 text-center">
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
      <p class="text-gray-600 mb-6">
        Get new blog posts delivered to your inbox, plus exclusive content and early access to upcoming releases.
      </p>
      <a href="/contact" class="btn-primary">
        Subscribe to Updates
      </a>
    </div>
  </div>
</section>