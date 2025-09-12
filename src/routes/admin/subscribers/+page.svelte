<!-- src/routes/admin/subscribers/+page.svelte - Admin subscriber dashboard -->
<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  const props = $props<{ data: PageData }>();
  const data = $derived(props.data);
  
  let searchQuery = $state(data.search || '');
  
  async function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    goto(`/admin/subscribers?${params.toString()}`);
  }
  
  function formatDate(date: Date | string) {
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
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'unsubscribed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }
</script>

<svelte:head>
  <title>Subscriber Management - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
      <p class="mt-2 text-gray-600">Manage your newsletter subscriber list</p>
    </div>

    <!-- Statistics Cards -->
    {#if data.success && data.stats}
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Total</div>
          <div class="text-2xl font-bold text-gray-900">{data.stats.total}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Confirmed</div>
          <div class="text-2xl font-bold text-green-600">{data.stats.confirmed}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Pending</div>
          <div class="text-2xl font-bold text-yellow-600">{data.stats.pending}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Unsubscribed</div>
          <div class="text-2xl font-bold text-red-600">{data.stats.unsubscribed}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">This Week</div>
          <div class="text-2xl font-bold text-blue-600">{data.stats.newThisWeek}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">This Month</div>
          <div class="text-2xl font-bold text-purple-600">{data.stats.newThisMonth}</div>
        </div>
      </div>
    {/if}

    <!-- Search -->
    <div class="bg-white rounded-lg shadow mb-8">
      <div class="p-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search by email or name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onkeydown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onclick={handleSearch}
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
          {#if data.search}
            <a
              href="/admin/subscribers"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              Clear
            </a>
          {/if}
        </div>
      </div>
    </div>

    <!-- Error Message -->
    {#if data.error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p class="text-red-800">{data.error}</p>
      </div>
    {/if}

    <!-- Subscribers Table -->
    {#if data.subscribers && data.subscribers.length > 0}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">
            {data.search ? `Search Results (${data.subscribers.length})` : `Recent Subscribers (${data.subscribers.length})`}
          </h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscriber
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confirmed
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each data.subscribers as subscriber}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {subscriber.name || 'No name'}
                      </div>
                      <div class="text-sm text-gray-500">{subscriber.email}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscriber.status)}`}>
                      {subscriber.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscriber.source}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subscriber.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscriber.confirmedAt ? formatDate(subscriber.confirmedAt) : '-'}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {:else if data.success}
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-500">
          {data.search ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
        </p>
        {#if data.search}
          <a href="/admin/subscribers" class="mt-4 inline-block text-blue-600 hover:text-blue-800">
            View all subscribers
          </a>
        {/if}
      </div>
    {/if}

    <!-- System Info -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-800">System Info</h3>
      <p class="text-sm text-blue-700 mt-1">
        Subscribers are stored in both MongoDB and Google Sheets. 
        MongoDB provides fast queries for your website, while Google Sheets serves as a backup and allows manual management.
      </p>
      <div class="mt-3 flex flex-col sm:flex-row gap-3">
        <a 
          href="https://docs.google.com/spreadsheets/d/1Sbz89vJMlc1MYIlQ-Ol41Grq_DghdT1M7g7aTQ06qiA/edit"
          target="_blank"
          class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          View Google Sheets
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