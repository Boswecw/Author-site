<!-- src/routes/admin/newsletters/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  // Define the expected data type based on the server file
  interface Newsletter {
    id: string;
    subject: string;
    preheader: string;
    status: 'draft' | 'ready' | 'sent';
    slug: string;
    createdAt: string;
    processedAt?: string;
    sentAt?: string;
    googleDocUrl?: string;
    fileName: string;
  }
  
  interface PageData {
    newsletters: Newsletter[];
    error?: string;
  }
  
  // Get data from the page
  let data = $page.data as PageData;
  
  function formatDate(dateStr: string | undefined) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-50';
      case 'ready': return 'text-blue-600 bg-blue-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }
  
  function getStatusText(status: string) {
    switch (status) {
      case 'sent': return 'Sent';
      case 'ready': return 'Ready';
      case 'draft': return 'Draft';
      default: return status;
    }
  }
</script>

<svelte:head>
  <title>Newsletter Management - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Newsletter Management</h1>
          <p class="mt-2 text-gray-600">View and manage your newsletter campaigns</p>
        </div>
        <div class="flex space-x-3">
          <a 
            href="/admin" 
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Admin
          </a>
        </div>
      </div>
    </div>

    <!-- Error State -->
    {#if data.error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error Loading Newsletters</h3>
            <p class="mt-1 text-sm text-red-700">{data.error}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Newsletter Statistics -->
    {#if data.newsletters && data.newsletters.length > 0}
      {@const stats = data.newsletters.reduce((acc, newsletter) => {
        acc.total++;
        acc[newsletter.status] = (acc[newsletter.status] || 0) + 1;
        return acc;
      }, { total: 0, draft: 0, ready: 0, sent: 0 })}
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Total</div>
          <div class="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Sent</div>
          <div class="text-2xl font-bold text-green-600">{stats.sent}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Ready</div>
          <div class="text-2xl font-bold text-blue-600">{stats.ready}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Draft</div>
          <div class="text-2xl font-bold text-yellow-600">{stats.draft}</div>
        </div>
      </div>
    {/if}

    <!-- Newsletter Table -->
    {#if data.newsletters && data.newsletters.length > 0}
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processed
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each data.newsletters as newsletter}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <div class="text-sm font-medium text-gray-900">
                        {newsletter.subject}
                      </div>
                      {#if newsletter.preheader}
                        <div class="text-xs text-gray-500 mt-1">
                          {newsletter.preheader}
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(newsletter.status)}">
                      {getStatusText(newsletter.status)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(newsletter.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(newsletter.processedAt)}
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
      </div>
    </div>
  </div>
</div>