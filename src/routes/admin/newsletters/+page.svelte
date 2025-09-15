<!-- src/routes/admin/newsletters/+page.svelte - Enhanced with send functionality -->
<script lang="ts">
  import type { PageData } from './$types';
  
  const { data }: { data: PageData } = $props();

  function formatDate(date: string | Date | null) {
    if (!date) return 'Not sent';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function canSend(status: string) {
    return status !== 'sent';
  }
</script>

<svelte:head>
  <title>Newsletters - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4">
    <!-- Header -->
    <div class="mb-8">
      <nav class="text-sm text-gray-500 mb-4">
        <a href="/admin" class="hover:text-gray-700">Admin</a>
        <span class="mx-2">→</span>
        <span class="text-gray-900">Newsletters</span>
      </nav>
      
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">Newsletter Management</h1>
        
        <div class="flex items-center space-x-4">
          <a 
            href="/admin/subscribers"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Manage Subscribers
          </a>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    {#if data.error}
      <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <p class="ml-3 text-red-800">{data.error}</p>
        </div>
      </div>
    {/if}

    <!-- Newsletters Table -->
    {#if data.newsletters && data.newsletters.length > 0}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Recent Newsletters</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage and send your newsletters to subscribers
          </p>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Newsletter
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each data.newsletters as newsletter}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {newsletter.subject}
                    </div>
                    {#if newsletter.preheader}
                      <div class="text-sm text-gray-500">
                        {newsletter.preheader}
                      </div>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(newsletter.status)}">
                      {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(newsletter.processedAt || newsletter.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(newsletter.sentAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {#if newsletter.googleDocUrl}
                      <a 
                        href={newsletter.googleDocUrl} 
                        target="_blank" 
                        class="text-blue-600 hover:text-blue-800 flex items-center"
                        title={newsletter.fileName}
                      >
                        Google Docs
                        <svg class="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    {:else}
                      <span class="text-gray-400">Manual</span>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      {#if canSend(newsletter.status)}
                        <a 
                          href="/admin/newsletters/send?id={newsletter.id}"
                          class="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                          </svg>
                          Send
                        </a>
                      {:else}
                        <span class="inline-flex items-center px-3 py-1 text-xs font-medium rounded text-green-700 bg-green-50">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Sent
                        </span>
                      {/if}
                      
                      <a 
                        href="/admin/newsletters/send?id={newsletter.id}"
                        class="text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {:else if !data.error}
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No newsletters yet</h3>
        <p class="mt-1 text-sm text-gray-500">
          Start creating newsletters using your Google Docs integration or manual creation.
        </p>
      </div>
    {/if}

    <!-- System Info -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-800">Newsletter System</h3>
      <p class="text-sm text-blue-700 mt-1">
        Newsletters are created via Google Docs integration using the webhook endpoint <code>/api/newsletter/create</code>. 
        They're stored in MongoDB and can be sent through your email system.
      </p>
      <div class="mt-3 flex flex-col sm:flex-row gap-3">
        <a 
          href="/admin/diagnostics"
          class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          System Diagnostics
        </a>
        <button 
          onclick={() => location.reload()} 
          class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh Data
        </button>
        <a 
          href="/admin/newsletters/test"
          class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Test Email System
        </a>
      </div>
    </div>
  </div>
</div>