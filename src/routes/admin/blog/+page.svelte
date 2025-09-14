<!-- src/routes/admin/blog/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const { posts, stats, tags, filters } = data;

  // Local state for filters
  let searchInput = $state(filters.search || '');
  let selectedStatus = $state(filters.status || '');
  let selectedSource = $state(filters.source || '');
  let selectedSort = $state(filters.sortBy || 'newest');

  // Handle filter changes
  function updateFilters() {
    const params = new URLSearchParams();
    
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedSource) params.set('source', selectedSource);
    if (selectedSort && selectedSort !== 'newest') params.set('sort', selectedSort);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/admin/blog?${queryString}` : '/admin/blog';
    goto(newUrl);
  }

  function clearFilters() {
    searchInput = '';
    selectedStatus = '';
    selectedSource = '';
    selectedSort = 'newest';
    goto('/admin/blog');
  }

  function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return 'No date';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }

  function getStatusBadge(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getSourceBadge(source: string): string {
    switch (source) {
      case 'google-docs':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manual':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function deletePost(postId: string) {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      // TODO: Implement delete functionality
      console.log('Delete post:', postId);
    }
  }
</script>

<svelte:head>
  <title>Blog Management - Admin - Charles Boswell</title>
  <meta name="description" content="Manage blog posts and content" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-6">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Blog Management
            </h1>
            <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {stats.total} total posts
              </div>
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {stats.published} published
              </div>
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                {stats.draft} drafts
              </div>
            </div>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <a
              href="/blog"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              View Public Blog
            </a>
            <button
              class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              New Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            id="search"
            type="text"
            bind:value={searchInput}
            placeholder="Search posts..."
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            onkeydown={(e) => e.key === 'Enter' && updateFilters()}
          />
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            bind:value={selectedStatus}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <!-- Source Filter -->
        <div>
          <label for="source" class="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select
            id="source"
            bind:value={selectedSource}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Sources</option>
            <option value="admin">Admin</option>
            <option value="google-docs">Google Docs</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <!-- Sort -->
        <div>
          <label for="sort" class="block text-sm font-medium text-gray-700 mb-1">Sort</label>
          <select
            id="sort"
            bind:value={selectedSort}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex space-x-2">
        <button
          onclick={updateFilters}
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
        <button
          onclick={clearFilters}
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Clear All
        </button>
      </div>
    </div>

    <!-- Posts Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        {#if posts.length > 0}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each posts as post (post._id || post.slug)}
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div>
                          <div class="text-sm font-medium text-gray-900">
                            <a 
                              href={`/blog/${post.slug || '#'}`}
                              class="hover:text-indigo-600"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {post.title || 'Untitled'}
                            </a>
                          </div>
                          <div class="text-sm text-gray-500 truncate max-w-xs">
                            {post.excerpt || post.description || 'No excerpt'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(post.status || 'draft')}`}>
                        {post.status || 'draft'}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceBadge(post.source || 'manual')}`}>
                        {post.source || 'manual'}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(post.publishDate || post.publishedAt)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-wrap gap-1">
                        {#if post.tags && Array.isArray(post.tags) && post.tags.length > 0}
                          {#each post.tags.slice(0, 3) as tag}
                            <span class="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              {tag}
                            </span>
                          {/each}
                          {#if post.tags.length > 3}
                            <span class="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              +{post.tags.length - 3}
                            </span>
                          {/if}
                        {:else}
                          <span class="text-xs text-gray-400">No tags</span>
                        {/if}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center space-x-2">
                        <a
                          href={`/blog/${post.slug || '#'}`}
                          class="text-indigo-600 hover:text-indigo-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                        <button
                          class="text-gray-600 hover:text-gray-900"
                          onclick={() => {/* TODO: Edit functionality */}}
                        >
                          Edit
                        </button>
                        <button
                          class="text-red-600 hover:text-red-900"
                          onclick={() => deletePost(post._id || post.slug)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <!-- Empty State -->
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No blog posts found</h3>
            <p class="mt-1 text-sm text-gray-500">
              {#if filters.search || filters.status || filters.source}
                Try adjusting your filters or create a new post.
              {:else}
                Get started by creating your first blog post.
              {/if}
            </p>
            <div class="mt-6">
              <button
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Create New Post
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Back to Admin -->
    <div class="mt-6">
      <a
        href="/admin"
        class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Admin Dashboard
      </a>
    </div>
  </div>
</div>