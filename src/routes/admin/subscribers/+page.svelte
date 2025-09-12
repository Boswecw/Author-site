// src/routes/admin/subscribers/+page.svelte - Updated for serialized data
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  // Define the expected data type
  interface SerializedSubscriber {
    _id: string;
    email: string;
    name: string;
    status: 'pending' | 'confirmed' | 'unsubscribed';
    source: string;
    createdAt: string; // Now string instead of Date
    updatedAt: string;
    confirmedAt?: string;
    unsubscribedAt?: string;
  }
  
  interface PageData {
    stats: {
      total: number;
      confirmed: number;
      pending: number;
      unsubscribed: number;
      newThisWeek: number;
      newThisMonth: number;
    };
    subscribers: SerializedSubscriber[];
    search: string;
    success: boolean;
    error?: string;
  }
  
  // Get data from the page
  let data = $page.data as PageData;
  let searchQuery = $state(data.search || '');
  
  async function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    goto(`/admin/subscribers?${params.toString()}`);
  }
  
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

    <!-- Error Message -->
    {#if data.error}
      <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error Loading Data</h3>
            <p class="text-sm text-red-700 mt-1">{data.error}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Search -->
    <div class="mb-6 bg-white rounded-lg shadow p-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            bind:value={searchQuery}
            type="text"
            placeholder="Search by email or name..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onkeydown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onclick={handleSearch}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
        {#if data.search}
          <a
            href="/admin/subscribers"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </a>
        {/if}
      </div>
    </div>

    <!-- Subscribers Table -->
    {#if data.success && data.subscribers.length > 0}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Subscribers ({data.subscribers.length})
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subscriber.email}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subscriber.name || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(subscriber.status)}">
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